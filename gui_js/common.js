/**
 * Created by ludo on 25-10-16.
 */


//Rest client to VSM: URL, call method, structures.
var handleReplies = {};
var vsm_uri = "http://ec2-52-29-254-9.eu-central-1.compute.amazonaws.com:11220/";

var vsm_start = {"cmd": "start"};
var vsm_reset = {"cmd": "reset"};
var vsm_load = {"cmd": "load", "arg": "res/prj/vsm"};

var vsm_set = function (field, val) {
  return {"cmd": "set", "arg": {"var": field, "val": JSON.stringify(val)}}
};
var vsm_text = function (text) {
  return vsm_set("UserData", {"confidence": "0.85", "text": text})
};

//Create and handle reservation(s)
//

var sendText = function () {
  var text = $('#manualTextInput').val();
  if (typeof text == "string" && text != "") {
    doVSMCall(vsm_text(text));
  }
};

var initVSM = function () {
  doVSMCall(vsm_load);
  setTimeout(function () {
    doVSMCall(vsm_start);
  }, 1000);
};

// Websocket variables
var ws = null;
var open = false;
var mediaRecorder = null;

//var wsUri = "wss://webglstudio.org:8080";
var wsUri = "ec2-52-29-254-9.eu-central-1.compute.amazonaws.com:16160";
// Init websocket connection
startWebsocket();


function startWebsocket() {

  if (open && typeof ws != "undefined") {
    ws.close();
  }

  //Open https once first, to make sure certificate is valid
  var xhttp;
  if (window.XMLHttpRequest) {
    xhttp = new XMLHttpRequest();
  } else {
    // code for IE6, IE5
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xhttp.open("GET", "https://" + wsUri, false);
  xhttp.send();

  //Now open websocket:
  ws = new WebSocket("wss://" + wsUri);

  ws.onopen = function (e) {
    console.log("Websocket connected to: ", wsUri);
    open = true;
    if (mediaRecorder != null) {
      mediaRecorder.start(500);
    }
    checkReservation();
  };

  ws.onclose = function (e) {
    console.log("Disconnected from websocket: ", wsUri);
    open = false;
  };

  ws.onmessage = function (e) {
    console.log("Received data: ", e.data);
    var data = e.data;
    if (typeof e.data === "string") {
      data = JSON.parse(e.data);
    }
    if (data.type === 'reply' && handleReplies[data.method]) {
      handleReplies[data.method](data.result);
    }
  };

  ws.onerror = function (e) {
    console.error("Websocket error: ", e);
    open = false;
  }
}

function doCmdSend(command) {
  if (open) {
    console.log("Sending command:", command);
    ws.send(JSON.stringify(command), {binary: false});
  }
}

function doSend(message) {
  if (open) {
    ws.send(message, {binary: true});
  }
}


var doVSMCall = function (body) {
  body["target"] = "VSM";
  doCmdSend(body);
};

var doProxyCall = function (body) {
  body["target"] = "PROXY";
  doCmdSend(body);
};

//RESERVATION SYSTEM

//If not done before, create local GUI/Token:
//Simple GUID generator (random based, not genuine, no guarantees)
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
var token = localStorage.getItem("kristina_token");
if (!token) {
  token = guid();
  localStorage.setItem("kristina_token", token);
}

//Schedule a reservation check
handleReplies["getReservation"] = function (reply) {
  if (!reply) {
    $("#reservation").html("<div class='yellow'>Free</div>");
  } else {
    //check token with mine
    if (token === reply.reservation.token) {
      $("#reservation").html("<div class='green'>Reserved for you until: " + (new Date(reply.end).toTimeString()) + "</div>");
    } else {
      $("#reservation").html("<div class='red'>Reserved until: " + (new Date(reply.end).toTimeString()) + "</div>");
    }
  }
};
var checkReservation = function () {
  doProxyCall({'method': 'getReservation', 'params': null});
};
setInterval(checkReservation, 60000);

var reserve1hour = function () {
  doProxyCall({'method': 'reserve', 'params': [{token:token}, 3600000]});
  checkReservation();
  modal.style.display = "none";
};

// Get the modal
var modal = document.getElementById('myModal');

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

var openScenarioSelection = function () {
  $('#modal-title').html("Scenario Selector");
  $('#modal-body').html($('#selector_contents').html());
  modal.style.display = "block";
};

var openReservationScreen = function () {
  $('#modal-title').html("Reservation System");
  $('#modal-body').html($('#reservation_contents').html());
  modal.style.display = "block";
}
