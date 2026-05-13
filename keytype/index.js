function testfunction (jnode) {
  //console.log("test"); // had this to test timing of onload vs waitforkeyelements
  setKey();
  timings = [];
};

function setKey() {
  key = makeKey();
  document.getElementById("key").innerHTML = key;
}

function setTiming(timing) {
  document.getElementById("timing").innerHTML = timing + " ms";
}

function setBest(best) {
  document.getElementById("best").innerHTML = "Best time: " + best + " ms";
}

//waitForKeyElements("#key", testfunction, true);
window.onload = testfunction;

function makeGrouping() {
  // https://stackoverflow.com/a/1349426
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < 5; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function makeKey() {
  const key = makeGrouping() + "-" + makeGrouping() + "-" + makeGrouping();
  return key;
}

function input(e) {
  if (e.value.length == 1) {  // first input
    t0 = performance.now();
  }
  if(event.key === 'Enter') {
    submit(e.value);
  }
}

function trim(s) {
  return s.toLowerCase().replace(/-/gi,'');
}

function submit(value) {
  if (trim(value) == trim(key)) {
    t1 = performance.now();
    const last = t1-t0;
    setTiming(last);
    // timings.push(t1-t0); // later could do this for showing average and stats and stuff
    if (typeof bestTime == 'undefined' || last < bestTime) {
      bestTime = last;
      setBest(bestTime);
    }
    document.getElementById("keyInput").value = "";
    setKey();
  }
}
