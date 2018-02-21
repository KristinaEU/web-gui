
(function(){

// GLOBAL VARIABLES
var maxRows = 13 * 3;
var wsUri = "localhost:8002";

/*
 * Activates or deactivates
 * moduleName   ->  id of the groupModule
 * activation   ->  true    - activates module
 *                  false   - deactivates module
 */
function setActivationModule(moduleName, activation) {
  if (activation) {
    $('#' + moduleName).attr("class", "modules active");
  } else {
    $('#' + moduleName).attr("class", "modules");
  }
}

// receive function
function getMessage() {

  var input = {
    "timestamp": "135",
    "moduleName": "LA",
    "message": "Language Analysis started",
    "activation": "true"
  };
  handleMessage(input);
}

function handleMessage(input) {

  var timestamp = input["timestamp"],
    moduleName = input["moduleName"],
    message = input["message"],
    activation = input["activation"];

  // active module visualization
  setActivationModule(moduleName, activation);

  // add new entry to the table logger
  addRowTable(timestamp, message);

  // if table is too big then remove oldest entries
  removeRows();

}

function addRowTable(timestamp, moduleName) {
  if ($('#tableLogger').length > 0) {
    $("#tableLogger").prepend('<tr><td>' + timestamp + '</td><td>' + moduleName + '</td></tr>');
  }
}

function removeRows() {
  if ($('#tableLogger').length > 0) {
    var nRows = $('#tableLogger >tbody >tr').length;
    if (nRows > maxRows) {

      var diff = nRows - maxRows;
      for (var i = 0; i < diff; i++) {
        $('#tableLogger tr:last').remove();
      }
    }
  }
}

// Websocket variables
var ws = null;
var ws_open = false;

// Init websocket connection
startWebsocket();


function startWebsocket() {

  if (ws_open && typeof ws != "undefined") {
    ws.close();
  }

  //Open https once first, to make sure certificate is valid
  $.ajax({
    url: "https://" + wsUri,
    success: new function () {


      //Now open websocket:
      ws = new WebSocket("wss://" + wsUri);

      ws.onopen = function (e) {
        console.log("Websocket connected to: ", wsUri);
        ws_open = true;
        this.send("dashboard");
      };

      ws.onclose = function (e) {
        console.log("Disconnected from websocket: ", wsUri);
        ws_open = false;
      };

      var message = "";
      ws.onmessage = function (e) {
        var data = e.data;
        if (data[0] == "{") {
          var json = JSON.parse(data);
          if (json["vsmEvent"]){
            handleMessage(json);
          }
        }
      };

      ws.onerror = function (e) {
        console.error("Websocket error: ", e);
        ws_open = false;
      }
    }
  });
}
})();