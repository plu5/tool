function e(id) {
  return document.getElementById(id);
}

function pad2(num) {
  s = num.toString();
  return s.length == 2 ? s : '0' + s;
}

function clear() {
  e("input").value = "";
}

function set() {
  const s = e('input').value;
  const now = s ? new Date(s) : new Date();
  const localeStr = `${now.getFullYear()}-${pad2(now.getMonth()+1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`
  const epochStr = `${now.getTime()/1000}`
  const template = `${localeStr},${epochStr}`;
  e("output").value = template;
  if (e("input").value == '') e("input").value = localeStr;
}

e("clear").addEventListener("click", clear);
e("set").addEventListener("click", set);

set()
