const e = (id) => document.getElementById(id);

const domkey = document.getElementById("key");
const domerr = document.getElementById("err");
const domencrypt = {
  btn: e("encrypt"), in: e("in"), out: e("out"), iv: e("iv"),
};
const domdecrypt = {
  btn: e("decrypt"), in: e("in2"), out: e("out2"), iv: e("iv2"),
  transfer: e("transfer"),
};
const inputs = [domkey,
                domencrypt.in, domencrypt.out, domencrypt.iv,
                domdecrypt.in, domdecrypt.out, domdecrypt.iv];
const clearbtn = document.getElementById("clear");

const clear = () => {
  for (let inp of inputs) {
    inp.value = "";
  }
};

const transfer = () => {
  domdecrypt.in.value = domencrypt.out.value;
  domdecrypt.iv.value = domencrypt.iv.value;
}

const encode = (text) => new TextEncoder().encode(text);
const decode = (text) => new TextDecoder().decode(text);

const genCounter = () => window.crypto.getRandomValues(new Uint8Array(16));

const genKey_ = () => window.crypto.subtle.generateKey(
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

const encryptBuffer = (key, iv, buffer) => window.crypto.subtle.encrypt(
  {name: "AES-CTR", counter: iv, length: 64}, key, buffer);
const decryptBuffer = (key, iv, buffer) => window.crypto.subtle.decrypt(
  {name: "AES-CTR", counter: iv, length: 64}, key, buffer);

const arrayBufferToBase64 = (buffer) => btoa(
  String.fromCharCode(...new Uint8Array(buffer)));
const base64ToArrayBuffer = (base64) => Uint8Array.from(
  atob(base64), c => c.charCodeAt(0));

const encrypt = async () => {
  const iv = genCounter();
  domencrypt.iv.value = arrayBufferToBase64(iv);
  domencrypt.out.value = arrayBufferToBase64(
    await encryptBuffer(await getKey(), iv, encode(domencrypt.in.value)));
};

const decrypt = async () => {
  const iv = base64ToArrayBuffer(domdecrypt.iv.value);
  domdecrypt.out.value = decode(
    await decryptBuffer(await getKey(), iv,
                        base64ToArrayBuffer(domdecrypt.in.value)));
};

clearbtn.addEventListener("click", clear);
domencrypt.btn.addEventListener("click", encrypt);
domdecrypt.btn.addEventListener("click", decrypt);
domdecrypt.transfer.addEventListener("click", transfer);
