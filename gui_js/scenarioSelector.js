
var map = {
  "newspaper": {
    "user": "Elisabeth",
    "language": "de",
    "scenario": "newspaper",
    "vocapia-model": "ger-kr",
    "avatar": "KRISTINA"
  },
  "weather": {"user": "Hans", "language": "de", "scenario": "weather", "vocapia-model": "ger-kr", "avatar": "KRISTINA"},
  "sleep_pl": {"user": "Iwona", "language": "pl", "scenario": "sleep", "vocapia-model": "pol-kr", "avatar": "KRISTINA"},
  "sleep_ger": {
    "user": "Elisabeth",
    "language": "de",
    "scenario": "sleep",
    "vocapia-model": "ger-kr",
    "avatar": "KRISTINA"
  },
  "pain": {"user": "Juan", "language": "es", "scenario": "pain", "vocapia-model": "spa-kr", "avatar": "KRISTINA"},
  "babycare": {
    "user": "Maria",
    "language": "es",
    "scenario": "babycare",
    "vocapia-model": "spa-kr",
    "avatar": "KRISTINA"
  }
};


function setScenario(scenario) {
  console.log("selected scenario:"+scenario);
  document.getElementById('scenarioHeader').innerHTML = scenario;

  console.log(vsm_set("MetaData", map[scenario]));
  doVSMCall(vsm_set("MetaData", map[scenario]));

  if (modal) {
    modal.style.display = "none";
  }
}

