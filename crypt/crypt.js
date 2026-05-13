/* Contents
 *
 * (1) main encrypt/decrypt logic
 * (2) alginfo
 */

/*
 * (1) main encrypt/decrypt logic
 */

const e = (id) => document.getElementById(id);

const domkey = e("key");
const domerr = e("err");
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
const clearbtn = e("clear");
const algselect = e("alg-select")

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

const genKey_ = (alg) => window.crypto.subtle.generateKey(
  {name: alg, length: 256}, true, ["encrypt", "decrypt"]);

const genKey = async (alg) => {
  const key = await genKey_(alg);
  const exported = await window.crypto.subtle.exportKey("jwk", key);
  domkey.value = exported.k;
  return key;
};

const getKey = async (alg) => {
  let key = null;
  if (domkey.value.length > 0) {
    try {
      key = await window.crypto.subtle.importKey(
        "jwk", {k: domkey.value, kty: "oct"}, alg, true,
        ["encrypt", "decrypt"]);
    } catch (e) {
      domerr.textContent = `Unable to import key (you can clear the field to generate a new one). ${e}`;
    }
  } else {
    key = await genKey(alg);
  }
  return key;
};

const arrayBufferToBase64 = (buffer) => btoa(
  String.fromCharCode(...new Uint8Array(buffer)));
const base64ToArrayBuffer = (base64) => Uint8Array.from(
  atob(base64), c => c.charCodeAt(0));

const getParams = (alg, iv) => {
  let params = {name: algselect.value};
  if (params.name == "AES-CTR") {
    params.counter = iv;
    params.length = 64;
  } else if (params.name == "AES-GCM") {
    params.iv = iv;
  }
  return params;
}

const encrypt = async () => {
  const alg = algselect.value;
  const iv = genCounter();
  domencrypt.iv.value = arrayBufferToBase64(iv);
  try {
    domencrypt.out.value = arrayBufferToBase64(
      await window.crypto.subtle.encrypt(
        getParams(alg, iv), await getKey(alg),
        encode(domencrypt.in.value)));
  } catch (e) {
    domerr.textContent = `Unable to encrypt. ${e}`;
  }
};

const decrypt = async () => {
  const alg = algselect.value;
  const iv = base64ToArrayBuffer(domdecrypt.iv.value);
  try {
    domdecrypt.out.value = decode(
      await window.crypto.subtle.decrypt(
        getParams(alg, iv), await getKey(alg),
        base64ToArrayBuffer(domdecrypt.in.value)));
  } catch (e) {
    domerr.textContent = `Unable to decrypt. ${e}`;
  }
};

clearbtn.addEventListener("click", clear);
domencrypt.btn.addEventListener("click", encrypt);
domdecrypt.btn.addEventListener("click", decrypt);
domdecrypt.transfer.addEventListener("click", transfer);

/*
 * (2) alginfo
 */

const alginfo = e("alg-specific-info")

let domfindiv;

const updateAlginfo = () => {
  if (algselect.value == 'AES-CTR') {
    alginfo.innerHTML = `<h2>∗ ∗ ∗</h2><h2>Addendum</h2>A few notable things about AES-CTR and demonstrations thereof: (1) like one time-pads with no method of authentication/verification, it is possible to modify the plaintext by modifying the ciphertext without knowing the key. (2) if the same key+IV combination are used to encrypt more than one message, and the plaintext for one of the messages is known, it is possible to decrypt the others without knowing the key (this is the same as reusing a one-time pad). (3) if the key is known and part of the plaintext is known, it is possible to find the iv. this means if you forget or neglect to store the iv you can still decrypt so long as you know some of the message (16+ bytes; AES block size) and have the key and the ciphertext. this is not considered a vulnerability because the iv is not a secret and is often transmitted along with the ciphertext. keeping it a secret offers no additional security.
<textarea id="in3" placeholder="Input (ciphertext, base64)"></textarea>
<button id="transfer2">Transfer down the values from Encrypt output</button>
<br/>
<textarea id="in4" placeholder="Known partial plaintext (16+ characters)"></textarea>
<button id="findivbtn">Find IV</button>
<textarea id="out3" placeholder="IV (base64)"></textarea>`;
    // field for ciphertext, field for 16 byte plaintext, key i will take from the top rather than have another input
    domfindiv = {
      ciphertext: e('in3'), partialplaintext: e('in4'), btn: e('findivbtn'),
      iv: e('out3'), transfer: e('transfer2'),
    };
    domfindiv.btn.addEventListener("click", findiv);
    domfindiv.transfer.addEventListener("click", transfer2);
  } else {
    alginfo.innerHTML = "";
  }
}

// * cbc with iv 0 for one block is equivalent to ecb
// * webcrypto cbc decryption validates PKCS #7 padding, it must be
//   present to be able to decrypt. for 1 block in the plaintext it will
//   always be 16 bytes of value 16.
// * key must be generated/imported with name "AES-CBC" or subtlecrypto
//   will error with "A parameter or an operation is not supported by
//   the underlying object"
const decryptSingleAesBlock = async (key, block) => {
  const pad = new Uint8Array(16).fill(16);  // plaintext padding block
  // Find what the ciphertext of the padding block would have been
  const xor = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    xor[i] = pad[i] ^ block[i];
  }
  const encryptedpad = await crypto.subtle.encrypt(
    {name: "AES-CBC", iv: new Uint8Array(16)},  // iv 0
    key, xor
  );
  // [ block ] [ encryptedpad ]
  const forged = new Uint8Array(32);
  forged.set(block.slice(0, 16), 0);
  forged.set(new Uint8Array(encryptedpad).slice(0, 16), 16);
  const decrypted = await crypto.subtle.decrypt(
    {name: "AES-CBC", iv: new Uint8Array(16)},
    key, forged
  );
  return decrypted;
}

const xor = (a, b) => a.map((v, i) => v ^ b[i]);

const findiv = async () => {
  const a = base64ToArrayBuffer(domfindiv.ciphertext.value).slice(0, 16);
  const b = encode(domfindiv.partialplaintext.value).slice(0, 16);
  const keystream = xor(a, b);
  const r = await decryptSingleAesBlock(await getKey("AES-CBC"), keystream);
  domfindiv.iv.value = arrayBufferToBase64(r);
}

const transfer2 = () => {
  domfindiv.ciphertext.value = domencrypt.out.value;
  domfindiv.partialplaintext.value = domencrypt.in.value;
}

algselect.addEventListener("change", updateAlginfo);

updateAlginfo();
