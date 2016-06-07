var volume = 1;
var volumeStep = 0.1;

function increaseVolume() {
  volume = Math.min(volume + volumeStep, 1);
  updateVolume(volume);
}

function decreaseVolume() {
  volume = Math.max(volume - volumeStep, 0);
  updateVolume(volume);
}

function updateSlider(slider) {
  volume = slider.value;
  updateVolume(volume);
}

function updateVolume(volume) {
  var range = document.getElementById('volumeRange');
  range.value = volume;
  if (LS && LS.Globals && LS.Globals.changeVolume)
    LS.Globals.changeVolume(volume);
}

