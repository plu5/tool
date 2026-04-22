const encode = (text) => new TextEncoder().encode(text);

const genCounter = () => window.crypto.getRandomValues(new Uint8Array(16));

const genKey_ = async () => window.crypto.subtle.generateKey(
  {name: "AES-CTR", length: 256}, true, ["encrypt", "decrypt"]);

const genKey = async () => {
  const key = await genKey_();
  const exported = await window.crypto.subtle.exportKey("jwk", key);
  document.getElementById("key").value = exported.k;
  return key;
};

const getKey = async () => {
  let key = null;
  const element = document.getElementById("key");
  if (element.value.length > 0) {
    try {
      key = await window.crypto.subtle.importKey(
        "jwk", {k: element.value, kty: "oct"}, "AES-CTR", true,
        ["encrypt", "decrypt"]);
    } catch (e) {
      document.getElementById("err").
        textContent = `Unable to import key. ${e}`;
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
  let r = encode(document.getElementById("input").value);
  getKey().then((key) => encrypt_(key, r)).then((a) => {
    document.getElementById("output").value = arrayBufferToBase64(a);
  });
};

document.getElementById("encrypt").addEventListener("click", encrypt);
