var SCENARIO = null;

function setScenario(scenario) {
  console.log("selected scenario");

  document.getElementById('overlay').style.display = 'none';
  document.getElementById('scenarioHeader').innerHTML = scenario;
  SCENARIO = scenario;
}