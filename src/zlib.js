import { Base64 } from "js-base64";
import pako from "pako";

export const inflateBase64 = (str) => {
  const decoded = Base64.toUint8Array(str);
  const plain = pako.inflateRaw(decoded, { to: "string" });
  return plain;
};

export const deflateBase64 = (plain) => {
  const compressed = pako.deflateRaw(plain, { to: "string" });
  const encoded = Base64.fromUint8Array(compressed);
  return encoded;
};
