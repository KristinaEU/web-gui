// Capture and send video and audio media

// Multistream recorder
var resolution_x = 320;
var resolution_y = 240;

var videoWrapper = document.getElementById("videoContainerWrapper");
var videoDimensions = videoWrapper.getBoundingClientRect();
videoWrapper.style.height = (videoDimensions.width / 4 * 3) + 'px';



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
var p2tbutton = document.getElementById("push2talk");


p2tbutton.onmousedown = function () {
  doUnmute();
};
p2tbutton.onmouseup = function () {
  doMute();
};

navigator.mediaDevices.getUserMedia(mediaConstraints)
  .then(function (stream) {
    console.log("Setting up mediaRecorder...");
    mediastream = stream;

    //mute by default
    mediaRecorder = new MediaRecorder(stream, {mimeType: 'video/webm', bitsPerSecond: 160000});

    mediaRecorder.ondataavailable = function (e) {
      //console.log("Data available!");
      doSend(e.data);
    };

    // Create video HTML
    var video = document.createElement('video');
    video.classname = "img-responsive img-rounded center-block";
    video.style.width = videoDimensions.width + 'px';
    video.style.height = (videoDimensions.width / 4 * 3) + 'px'; // the wrapper div has no height, but a 4:3 aspect ratio.
    video = mergeProps(video, {
      controls: false,
      muted: true,
      src: URL.createObjectURL(stream)
    });
    video.play();

    videoWrapper.innerHTML="";
    videoWrapper.appendChild(video);

  })
  .catch(function (error) {
    if (error.name === 'ConstraintNotSatisfiedError') {
      log.error("Some constraint was not satisfied!");

    } else if (error.name === 'PermissionDeniedError') {
      log.error("Permission denied!");
    }
  });

//Avatar rendering
var timeout=null;
var logs = [];
var testingTool = false;
var msgCallback = function(msg){
  console.log("Received Avatar server message:",msg,JSON.stringify(msg));

  if (msg.control === "SPEAKING"){
    $("#transcript").html('"'+msg.userText+'"');
    logs.push(msg);
    if (testingTool){
      $("#testing").html("TESTING!");
      setTimeout(runNextSentence,100);
      return false;
    } else {
      $("#testing").html("");
    }
    if (msg.lg && Array.isArray(msg.lg)){
      msg.lg.map(function(item){
         if (item.externalURL && item.externalURL != ""){
           //open ExternalURL
           if (timeout){
             clearTimeout(timeout);
           }
           var url = item.externalURL;
           console.log("opening external URL:",url);
           var openUrl = function(){
             if (url.startsWith("http")){
               window.open(url, '_blank');
             }else {
               window.open("http://"+url, '_blank');
             }
           };
           timeout = setTimeout(openUrl,1000);
         }
      });
    }
  }
};


var testIndex = 0;

var nextSentence = function(){
  var sentence = testSentences[testIndex];
  if (!sentence){
    return null;
  }
  if (sentence.startsWith("#")){
    setScenario(sentence.slice(1));
    testIndex++;
    sentence = nextSentence();
  }
  testIndex++;
  return sentence;
};

var runNextSentence = function(){
   var sentence = nextSentence();
   if (sentence){
     $("#manualTextInput").val(sentence);
     sendText();
   }
};

var importTestData = function (json){
  if (Array.isArray(json)){
    testSentences = json;
  } else {
    testSentences = JSON.parse(json);
  }
};

var startTestingTool = function(){
  testingTool = true;
  //Schedule first sentence
  testIndex = 0;
  runNextSentence();
  modal.style.display = "none";
};
var stopTestingTool = function(){
  testingTool = false;
  //reset sentences
  testIndex = 0;
  $("#testing").html("");
  modal.style.display = "none";
};

var downloadLogs = function () {
  var a = document.createElement("a");
  a.style = "display: none";
  document.body.appendChild(a);

  var json = JSON.stringify(logs);
  var blob = new Blob([json], {type: "application/json"});
  var url = URL.createObjectURL(blob);

  a.href = url;
  a.download = "logs.json";
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

var summarizeLogs = function() {
  var a = document.createElement("a");
  a.style = "display: none";
  document.body.appendChild(a);

  var result = logs.map(function (item){
    var res = {};
    res.meta = item.meta;
    res.userText = item.userText;
    res.time = item.time;
    res.outputText = item.lg.map(function (line){ return line.text });
    return  res;
  });

  var json = JSON.stringify(result);
  var blob = new Blob([json], {type: "application/json"});
  var url = URL.createObjectURL(blob);

  a.href = url;
  a.download = "logs.json";
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

var downloadCSV = function () {
  var a = document.createElement("a");
  a.style = "display: none";
  document.body.appendChild(a);

  var csv = "index;input;output;externalURL;scenario;language;roundTime;LA;DM;MS;LG\n";
  logs.map(function (item, idx) {
    var runTime = item.time["language-analysis"] + item.time["mode-selection"] + item.time["language-generation"] + item.time["dialog-management"];
    csv += idx + ";" + item.userText + ";";
    var url = "";
    item.lg.map(function (line) {
      csv += line.text
      if (url === "" && line.externalURL){
        url = line.externalURL;
      }
    });
    csv += ";" + url + ";" + item.meta.scenario + ";" + item.meta.language + ";" + runTime + ";" + item.time["language-analysis"] + ";" + item.time["dialog-management"] + ";" + item.time["mode-selection"] + ";" + item.time["language-generation"] + "\n";
  });
  var blob = new Blob([csv], {type: "text/csv"});
  var url = URL.createObjectURL(blob);

  a.href = url;
  a.download = "results.csv";
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// get the dimensions of the wrapper
var kristinaWrapper = document.getElementById("kristinaWrapper");
var kristinaDimensions = kristinaWrapper.getBoundingClientRect();


var player = new LS.Player({
  width: kristinaDimensions.width,
  height: kristinaDimensions.width / 4 * 3,
  resources: "resources",
  shaders: "shaders/shaders.xml",
  loadingbar: true, //shows loading bar progress
  container: kristinaWrapper
});

var canvas = document.getElementById("kristinaWrapper");
canvas.innerHTML = '';
canvas.appendChild(player.canvas);
player.canvas.style.borderRadius = '10px';

LS.Globals.hostname = "ec2-52-29-254-9.eu-central-1.compute.amazonaws.com";
LS.Globals.port = 8000;
LS.Globals.characterName = "KRISTINA";
player.loadScene("./scenes/emma.json");

setTimeout(function (){
  LS.Globals.showGUI = false;
  LS.Globals.msgCallback = msgCallback;
},500);
