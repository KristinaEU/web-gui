
// Capture and send video and audio media


// Multistream recorder
var videoRecorder;
var audioRecorder;
var timeInterval = 1000; //ms
var resolution_x = 1280;
var resolution_y = 720;

var DISABLE_WEBSOCKET = true;

// Websocket variables
var ws = null;
var wsUri = "wss://webglstudio.org:8080";
//var wsUri = "wss://192.168.1.20:8080";
// Init websocket connection
if (DISABLE_WEBSOCKET !== true)
  startWebsocket();


// HTML container
var container = document.getElementById('videoContainer');



// Constraints
var mediaConstraints = {
  audio: true,
  video: {
    mandatory: {
      maxWidth: resolution_x,
      maxHeight: resolution_y
    }
  }
};



function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
  navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
}

function onMediaSuccess(stream) {

  // Declare media recorder
  videoRecorder = new MediaStreamRecorder(stream);
  videoRecorder.stream = stream;

  // Send audiovisual data
  videoRecorder.ondataavailable = function (blob) {
    // Send blob

    doSend(blob);
  };
  videoRecorder.clearOldRecordedFrames();
  videoRecorder.start(timeInterval*2);

  audioRecorder = new MediaStreamRecorder(stream);
  audioRecorder.mimeType = 'audio/wav';
  audioRecorder.ondataavailable = function(blob) {
    doSend(blob);
  };
  audioRecorder.start(timeInterval);


  //// Control buttons HTML
  //document.querySelector('#stop-recording').disabled = false;
  //document.querySelector('#pause-recording').disabled = false;


  // get the dimensions of the wrapper
  var kristinaWrapper = document.getElementById("kristinaWrapper");
  var kristinaDimensions = kristinaWrapper.getBoundingClientRect();

  var player = new LS.Player({
    width:kristinaDimensions.width,
    height:kristinaDimensions.width/4*3,
    resources: "resources",
    shaders: "shaders/shaders.xml",
    container: kristinaWrapper
  });

  var canvas = document.getElementById("kristinaWrapper");
  canvas.innerHTML = '';
  canvas.appendChild( player.canvas );
  player.canvas.style.borderRadius = '10px';
  player.loadScene("./scenes/kate.SCENE.wbin");


  // get the dimensions of the wrapper
  var videoWrapper = document.getElementById("videoContainerWrapper");
  var videoDimensions = videoWrapper.getBoundingClientRect();


  // Create video HTML
  var video = document.createElement('video');
  video.style.width = videoDimensions.width + 'px';
  video.style.height = (videoDimensions.width/4*3) + 'px'; // the wrapper div has no height, but a 4:3 aspect ratio.
  video.style.borderRadius = '10px';


  video = mergeProps(video, {
    controls: false,
    muted: true,
    src: URL.createObjectURL(stream)
  });

  // Add event listener?
  video.addEventListener('loadedmetadata', function() {
    videoRecorder.video = video;
  }, false);

  video.play();

  container.innerHTML = '';
  container.appendChild(video);
  //container.appendChild(document.createElement('hr'));


}

function onMediaError(e) {
  console.error('media error', e);
}



// HTML Control buttons
//
//window.onbeforeunload = function() {
//  //document.querySelector('#start-recording').disabled = false;
//};
//
//document.querySelector('#start-recording').onclick = function() {
//  this.disabled = true;
//  captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
//};
//
//document.querySelector('#stop-recording').onclick = function() {
//  this.disabled = true;
//  videoRecorder.stop();
//  audioRecorder.stop();
//  videoRecorder.stream.stop();
//
//  document.querySelector('#pause-recording').disabled = true;
//  document.querySelector('#start-recording').disabled = false;
//};
//
//document.querySelector('#pause-recording').onclick = function() {
//  this.disabled = true;
//  //mediaRecorder.pause();
//
//  document.querySelector('#resume-recording').disabled = false;
//};
//
//document.querySelector('#resume-recording').onclick = function() {
//  this.disabled = true;
//  //mediaRecorder.resume();
//
//  document.querySelector('#pause-recording').disabled = false;
//};
//



setTimeout(function() {captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);},1000);


// Websockets

function startWebsocket(){
  ws = new WebSocket(wsUri);

  ws.onopen = function(e) {
    console.log("Websocket connected to: ", wsUri);
    //this.send("Websocket connection established");
    captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
  }

  ws.onclose = function(e){
    console.log("Disconnected from websocket: ", wsUri);
    //mediaRecorder.stop();
  }

  ws.onmessage = function(e){
    //console.log("Received data: ", e.data);
  }

  ws.onerror = function(e){
    console.error("Websocket error: ", e.data);
  }

}


function doSend(message)
{
  if (DISABLE_WEBSOCKET !== true) {
    //console.log("Sending to websocket: ", message);
    ws.send(message);
  }
}