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

    // Fetch instances in the period
    const { data: instances, error: instError } = await supabaseAdmin
      .from("class_instances")
      .select(`
        id,
        teacherid,
        maxcount,
        teachers (name)
      `)
      .gte('date', startDateStr);

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
        .in("status", ["booked", "attended"]);
      
      if (bookError) {
        console.error("Bookings Fetch Error:", bookError);
        throw bookError;
      }
      bookings = bookingsData || [];
    }

    // Aggregate performance by teacher
    const teacherStats = new Map();
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
      stats.total_bookings += bookings.filter(b => b.classid === inst.id).length;
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
