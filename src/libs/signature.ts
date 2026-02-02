export async function generateRpcSignature(
  chain: string,
): Promise<{ signature: string, timestamp: number; headers: { "x-hmac-signature": string; "x-timestamp": number; }; }> {
  const timestamp = Math.floor(Date.now() / 1000);
  const stringToSign = `${chain}${timestamp}`;
  const secret = 'a123';

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(stringToSign);

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    msgData
  );

  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return {
    signature: hashHex,
    timestamp,
    headers: {
      "x-hmac-signature": hashHex,
      "x-timestamp": timestamp,
    },
  };
}
