import FingerprintJS from "@fingerprintjs/fingerprintjs";

export async function getBrowserId() {
  const fp = await FingerprintJS.load();
  const fpGet = await fp.get();
  return fpGet.visitorId;
}
