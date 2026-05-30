import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

/**
 * Decrypt WeChat Pay V3 notification resource using AES-256-GCM
 */
async function decryptResource(
  ciphertext: string,
  nonce: string,
  associatedData: string,
  apiV3Key: string
): Promise<any> {
  const keyBytes = new TextEncoder().encode(apiV3Key);
  const nonceBytes = new TextEncoder().encode(nonce);
  const adBytes = new TextEncoder().encode(associatedData);
  
  // Base64 decode the ciphertext
  const encryptedBytes = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    "AES-GCM",
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: nonceBytes,
      additionalData: adBytes,
      tagLength: 128,
    },
    key,
    encryptedBytes
  );

  return JSON.parse(new TextDecoder().decode(decrypted));
}

/**
 * Verify WeChat Pay V3 signature
 */
async function verifySignature(
  publicKeyPem: string,
  signature: string,
  timestamp: string,
  nonce: string,
  body: string
): Promise<boolean> {
  const message = `${timestamp}\n${nonce}\n${body}\n`;
  const signatureBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));

  const pemContents = publicKeyPem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s/g, "");
  
  const binaryDerString = atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  const key = await crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["verify"]
  );

  return await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signatureBytes,
    new TextEncoder().encode(message)
  );
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const signature = req.headers.get("wechatpay-signature");
    const timestamp = req.headers.get("wechatpay-timestamp");
    const nonce = req.headers.get("wechatpay-nonce");
    const serial = req.headers.get("wechatpay-serial");

    if (!signature || !timestamp || !nonce || !serial) {
      console.error("Missing WeChat Pay headers");
      return new Response(JSON.stringify({ code: "FAIL", message: "Missing headers" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const bodyText = await req.text();
    const platformPublicKey = Deno.env.get("WECHAT_PLATFORM_PUBLIC_KEY");
    const apiV3Key = Deno.env.get("WECHAT_APIV3_KEY");

    if (!platformPublicKey || !apiV3Key) {
      throw new Error("Missing WeChat Pay configuration (Public Key or APIv3 Key)");
    }

    // 1. Verify Signature
    const isSignatureValid = await verifySignature(
      platformPublicKey,
      signature,
      timestamp,
      nonce,
      bodyText
    );

    if (!isSignatureValid) {
      console.error("Invalid WeChat Pay signature");
      return new Response(JSON.stringify({ code: "FAIL", message: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = JSON.parse(bodyText);
    const resource = body.resource;

    if (!resource || resource.algorithm !== "AEAD_AES_256_GCM") {
      throw new Error("Unsupported encryption algorithm");
    }

    // 2. Decrypt Resource
    const decryptedData = await decryptResource(
      resource.ciphertext,
      resource.nonce,
      resource.associated_data,
      apiV3Key
    );

    console.log("Decrypted notification data:", decryptedData);

    const { transaction_id, out_trade_no, attach, trade_state } = decryptedData;

    if (trade_state === "SUCCESS") {
      if (!attach) {
        throw new Error("Missing attach data in notification");
      }

      const [userId, cardId] = attach.split(":");
      if (!userId || !cardId) {
        throw new Error(`Invalid attach format: ${attach}`);
      }

      // 3. Fulfill Purchase via RPC
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await supabase.rpc("fulfill_purchase", {
        p_user_id: userId,
        p_card_id: cardId,
        p_stripe_payment_id: transaction_id || out_trade_no, // Use transaction_id as the unique payment ID
      });

      if (error) {
        console.error("Error calling fulfill_purchase RPC:", error);
        throw error;
      }

      console.log("Purchase fulfilled successfully:", data);
    } else {
      console.log(`Payment not successful. Trade state: ${trade_state}`);
    }

    // WeChat Pay expects a 200 OK with specific JSON body
    return new Response(JSON.stringify({ code: "SUCCESS", message: "OK" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(JSON.stringify({ code: "FAIL", message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
