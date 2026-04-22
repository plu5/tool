const encode = (text) => new TextEncoder().encode(text);

const genCounter = () => window.crypto.getRandomValues(new Uint8Array(16));

const genKey = () => window.crypto.subtle.generateKey(
  {name: "AES-CTR", length: 256}, true, ["encrypt", "decrypt"])

const encrypt_ = (key, text) => window.crypto.subtle.encrypt(
  {name: "AES-CTR", counter: genCounter(), length: 64}, key, text);

const arrayBufferToBase64 = (buffer) => btoa(
  String.fromCharCode(...new Uint8Array(buffer)));

const encrypt = () => {
  let r = encode(document.getElementById("input").value);
  genKey().then((key) => encrypt_(key, r)).then((a) => {
    document.getElementById("output").textContent = arrayBufferToBase64(a);
  });
};

document.getElementById("encrypt").addEventListener("click", encrypt);
