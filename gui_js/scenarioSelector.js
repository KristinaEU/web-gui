var SCENARIO = null;

//Set of scenarios, with associated language codes for vocapia, for LA and name of the person.
//Build selector from JS
//On set Scenario, send JSON object through Tunnel? Or directly in the VSM, good for first setup...!


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
}

