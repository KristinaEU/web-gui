
// Capture and send video and audio media


// Multistream recorder
var resolution_x = 320;
var resolution_y = 240;



// Websocket variables
var ws = null;
//var wsUri = "wss://webglstudio.org:8080";
var wsUri = "ec2-52-29-254-9.eu-central-1.compute.amazonaws.com:16160";
// Init websocket connection
startWebsocket();

// HTML container
var container = document.getElementById('videoContainer');

// Constraints
var mediaConstraints = {
  audio: true,
  //video: false
  video: {
    mandatory: {
      maxWidth: resolution_x,
      maxHeight: resolution_y
    }
  }
};

var mediastream = null;
var mediaRecorder = null;
var p2tbutton = document.getElementById("push2talk");

p2tbutton.onmousedown = function(){
  console.log("unmuting!");
  if (mediastream != null) {
    mediastream.getAudioTracks()[0].enabled = true;
  }
};
p2tbutton.onmouseup =  function(){
  console.log("muting!");
  if (mediastream != null) {
    mediastream.getAudioTracks()[0].enabled = false;
  }
};

navigator.mediaDevices.getUserMedia(mediaConstraints)
  .then(function(stream) {
    console.log("Starting mediaRecorder...");
    mediastream = stream;

    //mute by default
    mediaRecorder = new MediaRecorder(stream, {mimeType: 'video/webm',bitsPerSecond: 160000});
    setTimeout(function(){mediastream.getAudioTracks()[0].enabled = false;},1000);

    mediaRecorder.ondataavailable = function(e) {
      //console.log("Data available!");
        doSend(e.data);
    };

    // get the dimensions of the wrapper
    var videoWrapper = document.getElementById("videoContainerWrapper");
    var videoDimensions = videoWrapper.getBoundingClientRect();

    // Create video HTML
    var video = document.createElement('video');
	video.classname = "img-responsive img-rounded center-block";
    video.style.width = videoDimensions.width + 'px';
    video.style.height = (videoDimensions.width/4*3) + 'px'; // the wrapper div has no height, but a 4:3 aspect ratio.
    video = mergeProps(video, {
      controls: false,
      muted: true,
      src: URL.createObjectURL(mediaRecorder.stream)
    });
    video.play();

	if (open){
		mediaRecorder.start(500);	
	}
    container.appendChild(video);

  })
  .catch(function(error) {
    if (error.name === 'ConstraintNotSatisfiedError') {
      log.error("Some constraint was not satisfied!");

    } else if (error.name === 'PermissionDeniedError') {
      log.error("Permission denied!");
    }
  });


// Websockets
var open = false;
function startWebsocket(){
  //Open https once first, to make sure certificate is valid
  var xhttp;
  if (window.XMLHttpRequest) {
    xhttp = new XMLHttpRequest();
    } else {
    // code for IE6, IE5
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xhttp.open("GET", "https://"+wsUri, false);
  xhttp.send();
  
  //Now open websocket:
  ws = new WebSocket("wss://"+wsUri);

  ws.onopen = function(e) {
    console.log("Websocket connected to: ", wsUri);
    open = true;
	if (mediaRecorder != null){
		mediaRecorder.start(500);	
	}  
  }

  ws.onclose = function(e){
    console.log("Disconnected from websocket: ", wsUri);
    open = false;
  }

  ws.onmessage = function(e){
    //console.log("Received data: ", e.data);
  }

  ws.onerror = function(e){
    console.error("Websocket error: ", e);
    open = false;
  }
}


function doSend(message)
{
  if (open) {
    //ws.send(message, {binary:true});
    var wrap = {"data":message};
	ws.send(wrap);
  }
}

//Avatar rendering

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
  player.loadScene("./scenes/emma.SCENE.wbin");

