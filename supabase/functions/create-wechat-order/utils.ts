import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

/**
 * Sign a message using RSA-SHA256 (RSASSA-PKCS1-v1_5)
 */
export async function sign(message: string, privateKeyPem: string): Promise<string> {
  const pemContents = privateKeyPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  
  const binaryDerString = atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(message)
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * Generate a random nonce string
 */
export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 17);
}

/**
 * Get current unix timestamp in seconds
 */
export function getTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

/**
 * Build WeChat Pay V3 Authorization header
 */
export async function buildAuthHeader(
  method: string,
  url: string,
  body: string,
  mchId: string,
  serialNo: string,
  privateKey: string
): Promise<string> {
  const nonce = generateNonce();
  const timestamp = getTimestamp();
  const message = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`;
  const signature = await sign(message, privateKey);

  return `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${serialNo}"`;
}
