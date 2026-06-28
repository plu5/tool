function pad2(num) {
  s = num.toString();
  return s.length == 2 ? s : '0' + s;
}

const now = new Date();

// ,2026-06-26 11:28:16,1782462496.5603962,2026-06-27 03:24:25,1782519865.7709942
// (,creation,creation epoch,modification,modification epoch)
// In our case making creation and modification all be current time
const localeStr = `${now.getFullYear()}-${pad2(now.getMonth()+1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`
const epochStr = `${now.getTime()/1000}`
const template = `,${localeStr},${epochStr},${localeStr},${epochStr}`;

document.getElementById("output").textContent = template;
