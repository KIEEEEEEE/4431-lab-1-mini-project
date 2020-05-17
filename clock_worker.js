var i = 0;
var tempo = 1;
var timeLength = 10;
var playing = false;

onmessage = function (e) {
  tempo = parseFloat(e.data.startClock.tempo);
  console.log("tempo: " + e.data.startClock.tempo);
  timeLength = parseInt(e.data.startClock.timeLength);
  timedCount();
}


function timedCount() {
  if (i <= timeLength) {
    console.log(i)
    this.postMessage(i);
    i = i + 1;
    // console.log(i);
    var ms = parseFloat((tempo) * 1000);
    console.log("ms: " + ms);
    setTimeout("timedCount()", ms);
  }
  else {
    i = 0;
  }

}
