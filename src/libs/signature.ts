import { hmac } from '@noble/hashes/hmac.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';

export function generateRpcSignature(
  chain: string,
): { signature: string; timestamp: number; headers: { "x-hmac-signature": string; "x-timestamp": string; }; } {
  const timestamp = Math.floor(Date.now() / 1000);
  const stringToSign = `${chain}${timestamp}`;
  const secret = import.meta.env.VITE_RPC_SECRET_KEY;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(stringToSign);

  const signatureBytes = hmac(sha256, keyData, msgData);
  const hashHex = bytesToHex(signatureBytes);

  return {
    signature: hashHex,
    timestamp,
    headers: {
      "x-hmac-signature": hashHex,
      "x-timestamp": timestamp + "",
    },
  };
}