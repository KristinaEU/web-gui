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
var reserved = false;
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
  $.ajax({
    url: "https://" + wsUri,
    success: new function () {


      //Now open websocket:
      ws = new WebSocket("wss://" + wsUri);

      ws.onopen = function (e) {
        console.log("Websocket connected to: ", wsUri);
        open = true;
        checkReservation();
        checkReservations();
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
  });
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
var doResetCall = function (body) {
  body["target"] = "RESET";
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
var myLabel = localStorage.getItem("kristina_label");
if (!myLabel) {
  myLabel = "Anonymous";
}

var setMyLabel = function (label) {
  myLabel = label;
  localStorage.setItem("kristina_label", label);
  console.log("Label changed to:", label);
};

//Schedule a reservation check
handleReplies["getReservation"] = function (reply) {
  var original_reservation = reserved;
  if (!reply) {
    $("#reservation").html("<div class='yellow'>Free</div>");
    reserved = false;
  } else {
    //check token with mine
    if (token === reply.reservation.token) {
      $("#reservation").html("<div class='green'>Reserved for you until: " + (new Date(reply.end).toTimeString()) + "</div>");
      reserved = true;
    } else {
      $("#reservation").html("<div class='red'>Reserved until: " + (new Date(reply.end).toTimeString()) + " by: " + reply.reservation.label + "</div>");
      reserved = false;
    }
  }
  if (original_reservation != reserved) {
    //start/stop media recorder
    if (mediaRecorder != null) {
      if (open && reserved) {
        console.log("Pushing server reset...");
        doResetCall({});
        console.log("Starting mediaRecorder...");
        mediaRecorder.start(500);
        setTimeout(function () {
          mediastream.getAudioTracks()[0].enabled = false;
        }, 700);
      } else {
        console.log("Stopping mediaRecorder...");
        mediaRecorder.stop();
        mediastream.getAudioTracks()[0].enabled = true;


      }
    }
  }
  //If reservation almost done, and we are still connected enlarge duration by 15 minutes
  if (reserved && (reply.end - new Date().getTime()) < 60000) {
    doProxyCall({'method': 'extend', 'params': [{token: token, label: myLabel}, 900000]});
    checkReservation();
  }
  if (open && reserved) {
    $('#manualInput').removeClass("disabled");
    $('#push2talk').removeClass("disabled");
    $('#scenarioSelector').removeClass("disabled");

  } else {
    $('#manualInput').addClass("disabled");
    $('#push2talk').addClass("disabled");
    $('#scenarioSelector').addClass("disabled");

  }
};

var checkReservation = function () {
  doProxyCall({'method': 'getReservation', 'params': null, token: token});
};
setInterval(checkReservation, 60000);

var reserve1hour = function () {
  doProxyCall({'method': 'reserve', 'params': [{token: token, label: myLabel}, 3600000]});
  checkReservation();
  checkReservations();

  modal.style.display = "none";
};
var reserve5min = function () {
  doProxyCall({'method': 'reserve', 'params': [{token: token, label: myLabel}, 300000]});
  checkReservation();
  checkReservations();

  modal.style.display = "none";
};
var release = function () {
  doProxyCall({'method': 'cancelRest', 'params': [{token: token}]});
  checkReservation();
  checkReservations();

  modal.style.display = "none";
};

//Setup and update timeline
var reservations = new vis.DataSet();

handleReplies["getReservations"] = function (reply) {
  //Getting an array of reservations:
  /*
   [
   {"start":1481270090560,"end":1481270105874,"reservation":{"token":"4882fa2c-1efd-8ed0-bd26-895f778de345","label":"ludo@almende.org"}},
   {"start":1481270115545,"end":1481270415545,"reservation":{"token":"4882fa2c-1efd-8ed0-bd26-895f778de345","label":"ludo@almende.org"}}
   ]
   */
  reservations.clear();
  reservations.add(reply.map(function (item) {
    return {id: item.start, start: item.start, end: item.end, content: item.reservation.label};
  }));
};
var start = new Date();
start.setHours(0);
start.setMinutes(0);
start.setSeconds(0);
start.setMilliseconds(0);
var end = new Date();
end.setHours(24);
end.setMinutes(0);
end.setSeconds(0);
end.setMilliseconds(0);
new vis.Timeline(document.getElementById("reservation_timeline"), reservations,{stack:false,start:start,end:end,selectable:false,align:'left'});

var checkReservations = function () {
  doProxyCall({'method': 'getReservations', 'params': null, token: token});
};
setInterval(checkReservations, 60000);


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
  $("#myLabelInput").val(myLabel);

  modal.style.display = "block";
}
