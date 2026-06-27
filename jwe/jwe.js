let jose;

function e(id) {
  return document.getElementById(id);
}

const domkey = e("key");
const domerr = e("err");
const domencrypt = {
  btn: e("encrypt"), in: e("in"), out: e("out"),
};
const domdecrypt = {
  btn: e("decrypt"), in: e("in2"), out: e("out2"),
  transfer: e("transfer"),
};
const inputs = [domkey,
                domencrypt.in, domencrypt.out,
                domdecrypt.in, domdecrypt.out];
const clearbtn = e("clear");
const encselect = e("enc-select")
const algselect = e("alg-select")

function clear() {
  for (let inp of inputs) {
    inp.value = "";
  }
  domerr.textContent = "";
}

function transfer() {
  domdecrypt.in.value = domencrypt.out.value;
}

function encode(text) {
  return new TextEncoder().encode(text);
}

function decode(text) {
  return new TextDecoder().decode(text);
}

function error(text) {
  domerr.textContent += `${new Date().toTimeString().slice(0, 8)} ${text}\n`;
  console.log(text);
}

async function genKey_(alg) {
  let key = null;
  try {
    key = await jose.generateSecret(alg, {extractable: true});
  } catch (e) {
    error(`Unable to generate key. ${e}`);
  }
  return key;
}

async function genKey(alg) {
  const key = await genKey_(alg);
  try {
  const exported = await jose.exportJWK(key);
    domkey.value = exported.k;
  } catch (e) {
    error(`Unable to export key. ${e}`);
  }
  return key;
}

async function getKey(alg) {
  let key = null;
  const derivation = alg.startsWith('PBES2');
  if (domkey.value.length > 0) {
    try {
      if (derivation) return encode(domkey.value);
      key = await jose.importJWK({k: domkey.value, kty: "oct"});
    } catch (e) {
      error(`Unable to import key (you can clear the field to generate a new one). ${e}`);
      return;
    }
    if (key == null) throw new Error("getKey: Key import failed");
  } else {
    key = await genKey(derivation ? "A256CBC-HS512" : alg);
    if (key == null) throw new Error("getKey: Key generation failed");
  }
  return key;
}

async function encrypt() {
  const alg = algselect.value;
  const enc = encselect.value;
  const key = await getKey(alg == 'dir' ? enc : alg);
  try {
    domencrypt.out.value = await new jose.CompactEncrypt(
      encode(domencrypt.in.value))
      .setProtectedHeader({alg, enc})
      .encrypt(key);
  } catch (e) {
    error(`Unable to encrypt. ${e}`);
  }
}

async function decrypt(e, dom=domdecrypt) {
  const alg = algselect.value;
  const enc = encselect.value;
  const key = await getKey(alg == 'dir' ? enc : alg);
  try {
    const {plaintext, protectedHeader} = await jose.compactDecrypt(
      dom.in.value, key, {keyManagementAlgorithms: [alg]});
    dom.out.value = decode(plaintext);
  } catch (e) {
    error(`Unable to decrypt. ${e}`);
  }
}

clearbtn.addEventListener("click", clear);
domencrypt.btn.addEventListener("click", encrypt);
domdecrypt.btn.addEventListener("click", decrypt);
domdecrypt.transfer.addEventListener("click", transfer);

void async function main() {
  jose = await import("https://cdn.jsdelivr.net/npm/jose@6/+esm");
}();
