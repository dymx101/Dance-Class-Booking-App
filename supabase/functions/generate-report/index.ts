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
    // 0. Authorization Check
    const authHeader = req.headers.get('Authorization');
    let isAuthorized = false;

    // A. Check for Secret (Cron/Internal)
    if (authHeader === `Bearer ${Deno.env.get('REPORT_SECRET')}`) {
      isAuthorized = true;
    } 
    // B. Check for valid Supabase user JWT (Manual trigger)
    else if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );
      
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (!userError && user && user.email === Deno.env.get('OWNER_EMAIL')) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Get request body
    const body = await req.json().catch(() => ({}));
    const rawType = body.type || 'Weekly';
    const type = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();

    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Fetch Revenue Stats
    const { data: revenueData, error: revError } = await supabaseAdmin
      .from("view_revenue_stats")
      .select("*")
      .limit(type === 'Weekly' ? 1 : 4);

    if (revError) {
      console.error("Revenue Data Error:", revError);
      throw revError;
    }

    // 2. Fetch Teacher Performance (Filtered by period)
    const days = type === 'Weekly' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    // Fetch instances in the period
    const { data: instances, error: instError } = await supabaseAdmin
      .from("class_instances")
      .select(`
        id,
        teacherid,
        maxcount,
        teachers (name)
      `)
      .gte('date', startDateStr)
      .lte('date', todayStr);

    if (instError) {
      console.error("Instances Fetch Error:", instError);
      throw instError;
    }

    // Fetch bookings for these instances
    const instanceIds = instances?.map(i => i.id) || [];
    let bookings = [];
    if (instanceIds.length > 0) {
      const { data: bookingsData, error: bookError } = await supabaseAdmin
        .from("bookings")
        .select("classid, status")
        .in("classid", instanceIds)
        .in("status", ["booked", "attended"])
        .lte('created_at', todayStr + 'T23:59:59Z');
      
      if (bookError) {
        console.error("Bookings Fetch Error:", bookError);
        throw bookError;
      }
      bookings = bookingsData || [];
    }

    // Aggregate performance by teacher
    const teacherStats = new Map();
    const bookingsByClass = new Map();
    bookings.forEach(b => {
      bookingsByClass.set(b.classid, (bookingsByClass.get(b.classid) || 0) + 1);
    });

    instances?.forEach(inst => {
      const teacherId = inst.teacherid;
      const teacherName = inst.teachers?.name || "Unknown";
      
      if (!teacherStats.has(teacherId)) {
        teacherStats.set(teacherId, {
          teacher_name: teacherName,
          total_bookings: 0,
          total_capacity: 0
        });
      }
      
      const stats = teacherStats.get(teacherId);
      stats.total_capacity += inst.maxcount || 0;
      stats.total_bookings += bookingsByClass.get(inst.id) || 0;
    });

    const teacherData = Array.from(teacherStats.values()).map(stats => ({
      teacher_name: stats.teacher_name,
      total_bookings: stats.total_bookings,
      avg_fill_rate: stats.total_capacity > 0 
        ? (stats.total_bookings / stats.total_capacity) * 100 
        : 0
    })).sort((a, b) => b.avg_fill_rate - a.avg_fill_rate);

    // 3. Generate HTML
    const html = generateEmailHtml({
      reportType: type,
      revenueData: revenueData || [],
      teacherData: teacherData,
    });

    // 4. Deliver via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Studio Reports <onboarding@resend.dev>",
        to: [Deno.env.get("OWNER_EMAIL")],
        subject: `${type} Performance Report | ${new Date().toLocaleDateString()}`,
        html: html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API Error:", error);
      throw new Error(`Failed to deliver email: ${error}`);
    }

    return new Response(JSON.stringify({ message: "Report generated and delivered" }), {
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
