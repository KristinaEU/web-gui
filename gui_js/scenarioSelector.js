
var subjectOverrideText = localStorage.getItem("kristina_subjectOverride");
var subjectOverride = (subjectOverrideText && (subjectOverrideText.toLowerCase() === "true"));

var speaker = localStorage.getItem("kristina_speaker");
if (speaker == null) {
  speaker = {'name': 'Hans', 'gender': 'Male'};
} else {
  speaker = JSON.parse(speaker);
}
var subject = localStorage.getItem("kristina_subject");
if (subject == null) {
  subject = {'name': 'Claudia', 'gender': 'Female'};
} else {
  subject = JSON.parse(subject);
}
var map = {
  "eat_pl": {
    "user": "Jana",
    "subject":{"name":"Stefan","gender":"Male"},
    "language": "pl",
    "scenario": "eat_sleep",
    "vocapia-model": "pol-kr",
    "avatar": "KRISTINA"
  },
  "eat_ger": {
    "user": "Claudia",
    "subject":{"name":"Stefan","gender":"Male"},
    "language": "de",
    "scenario": "eat_sleep",
    "vocapia-model": "ger-kr",
    "avatar": "KRISTINA"
  },
  "companion_tr": {
    "user": "Mustafa",
    "subject":{"name":"Mustafa","gender":"Male"},
    "language": "tr",
    "scenario": "companion",
    "vocapia-model": "tur-kr",
    "avatar": "KRISTINA"
  },
  "companion_ger": {
    "user": "Hans",
    "subject":{"name":"Hans","gender":"Male"},
    "language": "de",
    "scenario": "companion",
    "vocapia-model": "ger-kr",
    "avatar": "KRISTINA"
  },
  "pain": {
    "user": "Carlos",
    "subject":{"name":"Carlos","gender":"Male"},
    "language": "es",
    "scenario": "backpain",
    "vocapia-model": "spa-kr",
    "avatar": "KRISTINA"
  },
  "babycare": {
    "user": "Carmen",
    "subject":{"name":"Carmen","gender":"Female"},
    "language": "es",
    "scenario": "babycare",
    "vocapia-model": "spa-kr",
    "avatar": "KRISTINA"
  }

};

$('#speakerNameInput').val(speaker.name);
$('#speakerGenderInput').val(speaker.gender);
$('#subjectNameInput').val(subject.name);
$('#subjectGenderInput').val(subject.gender);
setSubjectOverride();

function createMetaData(scenario) {
  var meta = $.extend({}, map[scenario]);

  meta["speaker"] = speaker;
  if (subjectOverride) {
    meta["subject"] = subject;
  } else {
    setSubjectName(meta.subject.name);
    $('#subjectNameInput').val(meta.subject.name);
    setSubjectGender(meta.subject.gender);
    $('#subjectGenderInput').val(meta.subject.gender);

  }
  return meta;
}

function setSubjectOverride(override){
  if (override){
    subjectOverride = override.checked;
    console.log("subjectOverride:",override,subjectOverride);
    localStorage.setItem("kristina_subjectOverride",JSON.stringify(subjectOverride));
  }
  if (!subjectOverride){
    $('#subjectOverride').removeAttr('checked');
    $('#subjectNameInput').attr('disabled',true);
    $('#subjectGenderInput').attr('disabled',true);
  } else {
    $('#subjectOverride').attr('checked','checked');
    $('#subjectNameInput').attr('disabled',false);
    $('#subjectGenderInput').attr('disabled',false);
  }
}

function setScenario(scenario) {
  console.log("selected scenario:" + scenario);
  document.getElementById('scenarioHeader').innerHTML = scenario;

  var meta = createMetaData(scenario);
  console.log(vsm_set("MetaData", meta));
  doVSMCall(vsm_set("MetaData", meta));

  if (modal) {
    modal.style.display = "none";
  }
}

function setSpeakerName(name) {
  speaker.name = name;
  localStorage.setItem("kristina_speaker",JSON.stringify(speaker));
}

function setSpeakerGender(gender) {
  speaker.gender = gender;
  localStorage.setItem("kristina_speaker",JSON.stringify(speaker));
}

function setSubjectName(name) {
  subject.name = name;
  localStorage.setItem("kristina_subject",JSON.stringify(subject));
}

function setSubjectGender(gender) {
  subject.gender = gender;
  localStorage.setItem("kristina_subject",JSON.stringify(subject));
}
