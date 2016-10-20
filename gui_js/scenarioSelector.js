var SCENARIO = null;

//Set of scenarios, with associated language codes for vocapia, for LA and name of the person.
//Build selector from JS
//On set Scenario, send JSON object through Tunnel? Or directly in the VSM, good for first setup...!


var map = {
  "newspaper":{"user":"Elisabeth","language":"de","scenario":"newspaper","vocapia-model":"ger-kr"},
  "weather":{"user":"Hans","language":"de","scenario":"weather","vocapia-model":"ger-kr"},
  "sleep":{"user":"Iwona","language":"pl","scenario":"sleep","vocapia-model":"pol-kr"},
  "pain":{"user":"Juan","language":"es","scenario":"pain","vocapia-model":"spa-kr"},
  "babycare":{"user":"Maria","language":"es","scenario":"babycare","vocapia-model":"spa-kr"}
};


function setScenario(scenario) {
  console.log("selected scenario");
  document.getElementById('scenarioHeader').innerHTML = scenario;
  SCENARIO = scenario;

  console.log(map[scenario]);


}