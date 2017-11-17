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
  // "newspaper": {
  //   "user": "Elisabeth",
  //   "language": "de",
  //   "scenario": "newspaper",
  //   "vocapia-model": "ger-kr",
  //   "avatar": "KRISTINA"
  // },
  // "weather": {"user": "Hans", "language": "de", "scenario": "weather", "vocapia-model": "ger-kr", "avatar": "KRISTINA"},
  // "sleep_pl": {"user": "Iwona", "language": "pl", "scenario": "sleep", "vocapia-model": "pol-kr", "avatar": "KRISTINA"},
  // "sleep_ger": {
  //   "user": "Elisabeth",
  //   "language": "de",
  //   "scenario": "sleep",
  //   "vocapia-model": "ger-kr",
  //   "avatar": "KRISTINA"
  // },
  "eat_pl": {
    "user": "Jana",
    "language": "pl",
    "scenario": "eat_sleep",
    "vocapia-model": "pol-kr",
    "avatar": "KRISTINA"
  },
  "eat_ger": {
    "user": "Claudia",
    "language": "de",
    "scenario": "eat_sleep",
    "vocapia-model": "ger-kr",
    "avatar": "KRISTINA"
  },
  "companion_tr": {
    "user": "Mustafa",
    "language": "tr",
    "scenario": "companion",
    "vocapia-model": "tur-kr",
    "avatar": "KRISTINA"
  },
  "companion_ger": {
    "user": "Hans",
    "language": "de",
    "scenario": "companion",
    "vocapia-model": "ger-kr",
    "avatar": "KRISTINA"
  },
  "pain": {
    "user": "Carlos",
    "language": "es",
    "scenario": "backpain",
    "vocapia-model": "spa-kr",
    "avatar": "KRISTINA"
  },
  "babycare": {
    "user": "Carmen",
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

function createMetaData(scenario) {
  var meta = $.extend({}, map[scenario]);
  console.log(map[scenario], meta);
  meta["speaker"] = speaker;
  meta["subject"] = subject;
  return meta;
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
