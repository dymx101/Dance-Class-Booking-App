import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateEmailHtml } from "./template.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get request body
    const body = await req.json().catch(() => ({}));
    const { type = 'Weekly' } = body;

    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Fetch Revenue Stats
    // For Weekly, we take the latest 1 week
    // For Monthly, we take the latest 4 weeks (approximation)
    const { data: revenueData, error: revError } = await supabaseAdmin
      .from("view_revenue_stats")
      .select("*")
      .limit(type === 'Weekly' ? 1 : 4);

    if (revError) {
      console.error("Revenue Data Error:", revError);
      throw revError;
    }

    // 2. Fetch Teacher Performance
    const { data: teacherData, error: teachError } = await supabaseAdmin
      .from("view_teacher_performance")
      .select("*")
      .order('avg_fill_rate', { ascending: false });

    if (teachError) {
      console.error("Teacher Data Error:", teachError);
      throw teachError;
    }

    // 3. Generate HTML
    const html = generateEmailHtml({
      reportType: type,
      revenueData: revenueData || [],
      teacherData: teacherData || [],
    });

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
