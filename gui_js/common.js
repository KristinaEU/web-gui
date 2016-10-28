/**
 * Created by ludo on 25-10-16.
 */


//Rest client to VSM: URL, call method, structures.
var vsm_uri = "http://ec2-52-29-254-9.eu-central-1.compute.amazonaws.com:11220/";

var vsm_start = {"cmd": "start"};
var vsm_reset = {"cmd": "reset"};
var vsm_load = {"cmd": "load", "arg": "res/prj/vsm"};

var vsm_set = function (field, val) {
  return {"cmd": "set", "arg": {"var": field, "val": JSON.stringify(val)}}
};
var vsm_text = function (text) {
  return vsm_set("UserData", {"confidence": 0.85, "text": text})
};

var sendText = function () {
  var text = $('#manualTextInput').val();
  if (typeof text == "string" && text != "") {
    doVSMCall(vsm_text(text));
  }
}

var initVSM = function () {
  doVSMCall(vsm_load);
  setTimeout(function () {
    doVSMCall(vsm_start);
  }, 1000);
}
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
  }

  ws.onclose = function (e) {
    console.log("Disconnected from websocket: ", wsUri);
    open = false;
  }

  ws.onmessage = function (e) {
    //console.log("Received data: ", e.data);
  }

  ws.onerror = function (e) {
    console.error("Websocket error: ", e);
    open = false;
  }
}

function doCmdSend(command) {
  if (open) {
    console.log("Sending VSM command:", command);
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
}

