const domkey = document.getElementById("key");
const domerr = document.getElementById("err");
const dominput = document.getElementById("input");
const domoutput = document.getElementById("output");
const inputs = [domkey, dominput, domoutput];
const clearbtn = document.getElementById("clear");
const encryptbtn = document.getElementById("encrypt");

const clear = () => {
  for (let inp of inputs) {
    inp.value = "";
  }
};

const encode = (text) => new TextEncoder().encode(text);

const genCounter = () => window.crypto.getRandomValues(new Uint8Array(16));

const genKey_ = async () => window.crypto.subtle.generateKey(
  {name: "AES-CTR", length: 256}, true, ["encrypt", "decrypt"]);

const genKey = async () => {
  const key = await genKey_();
  const exported = await window.crypto.subtle.exportKey("jwk", key);
  domkey.value = exported.k;
  return key;
};

const getKey = async () => {
  let key = null;
  if (domkey.value.length > 0) {
    try {
      key = await window.crypto.subtle.importKey(
        "jwk", {k: domkey.value, kty: "oct"}, "AES-CTR", true,
        ["encrypt", "decrypt"]);
    } catch (e) {
      domerr.textContent = `Unable to import key. ${e}`;
    }
  } else {
    key = await genKey();
  }
  return key;
};

const encrypt_ = (key, text) => window.crypto.subtle.encrypt(
  {name: "AES-CTR", counter: genCounter(), length: 64}, key, text);

const arrayBufferToBase64 = (buffer) => btoa(
  String.fromCharCode(...new Uint8Array(buffer)));

const encrypt = async () => {
  let r = encode(dominput.value);
  getKey().then((key) => encrypt_(key, r)).then((a) => {
    domoutput.value = arrayBufferToBase64(a);
  });
};

encryptbtn.addEventListener("click", encrypt);
clearbtn.addEventListener("click", clear);
