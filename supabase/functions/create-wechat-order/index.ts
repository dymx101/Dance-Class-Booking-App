import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { buildAuthHeader, generateNonce, getTimestamp, sign } from "./utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    // Get the session user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Retrieve OpenID from metadata
    const openid = user.user_metadata?.wechat_openid || user.user_metadata?.openid;
    if (!openid) {
      return new Response(
        JSON.stringify({ error: "User OpenID not found in metadata. Please re-login." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Parse request body
    const { card_id } = await req.json();
    if (!card_id) {
      return new Response(JSON.stringify({ error: "card_id is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Fetch card price from payment_cards
    const { data: card, error: cardError } = await supabaseClient
      .from("payment_cards")
      .select("*")
      .eq("id", card_id)
      .single();

    if (cardError || !card) {
      return new Response(JSON.stringify({ error: "Card not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // WeChat Pay Config
    const mchId = Deno.env.get("WECHAT_MCH_ID");
    const appId = Deno.env.get("WECHAT_APP_ID");
    const serialNo = Deno.env.get("WECHAT_SERIAL_NO");
    const privateKey = Deno.env.get("WECHAT_PRIVATE_KEY");
    const notifyUrl = Deno.env.get("WECHAT_NOTIFY_URL");

    if (!mchId || !appId || !serialNo || !privateKey || !notifyUrl) {
      throw new Error("Missing WeChat Pay configuration in environment variables");
    }

    const outTradeNo = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const amountInCents = Math.round(card.price * 100); // price is usually in dollars/yuan, WeChat needs cents

    const body = {
      appid: appId,
      mchid: mchId,
      description: `Purchase: ${card.title}`,
      out_trade_no: outTradeNo,
      notify_url: notifyUrl,
      attach: `${user.id}:${card_id}`,
      amount: {
        total: amountInCents,
        currency: "CNY",
      },
      payer: {
        openid: openid,
      },
    };

    const urlPath = "/v3/pay/transactions/jsapi";
    const authHeader = await buildAuthHeader(
      "POST",
      urlPath,
      JSON.stringify(body),
      mchId,
      serialNo,
      privateKey
    );

    // Call WeChat Pay V3 JSAPI
    const response = await fetch(`https://api.mch.weixin.qq.com${urlPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("WeChat Pay API error:", result);
      return new Response(
        JSON.stringify({ error: result.message || "Failed to create WeChat Pay order" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status,
        }
      );
    }

    const prepayId = result.prepay_id;
    const timeStamp = getTimestamp();
    const nonceStr = generateNonce();
    const packageStr = `prepay_id=${prepayId}`;
    const signType = "RSA";

    // Generate final signature for requestPayment
    const paySignMessage = `${appId}\n${timeStamp}\n${nonceStr}\n${packageStr}\n`;
    const paySign = await sign(paySignMessage, privateKey);

    return new Response(
      JSON.stringify({
        appId,
        timeStamp,
        nonceStr,
        package: packageStr,
        signType,
        paySign,
        out_trade_no: outTradeNo, // Useful for client to track
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Internal Server Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
