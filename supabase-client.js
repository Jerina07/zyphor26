/* =========================================================
   ZYPHOR'26 — supabase-client.js
   Shared Supabase client + CRUD helpers
   ========================================================= */
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL  = "https://qcgobbldrystrplllckj.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZ29iYmxkcnlzdHJwbGxsY2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMzM4MzMsImV4cCI6MjEwMTkwOTgzM30.23oNCrGiPrUztp_qsrkABrzJ3JgAFoN73VJsvZQmSAA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

/* -------------------------------------------------------
   TEAMS
------------------------------------------------------- */
export async function upsertTeam({
  teamName,
  domain,
  teamLeader,
  numMembers,
  memberNames,
  selectedStatement = null
}) {
  return supabase
    .from("teams")
    .upsert(
      {
        team_name: teamName,
        domain,
        team_leader: teamLeader,
        num_members: numMembers,
        member_names: memberNames,
        selected_statement: selectedStatement
      },
      { onConflict: "team_name" }
    )
    .select()
    .single();
}


/* -------------------------------------------------------
   GET TEAM BY NAME
------------------------------------------------------- */
export async function getTeamByName(teamName) {
  const norm = (teamName || "").trim();

  if (!norm) {
    return {
      data: null,
      error: null
    };
  }

  return supabase
    .from("teams")
    .select("*")
    .ilike("team_name", norm)
    .maybeSingle();
}
export async function getAuthenticatedTeam() {

    // Check whether a user is logged in
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            data: null,
            error: authError || new Error("Not logged in")
        };
    }

    // Find the team belonging to the logged-in user
    const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

    if (error) {
        return {
            data: null,
            error
        };
    }

    if (!data) {
        return {
            data: null,
            error: new Error(
                "Your account is not linked to a registered team."
            )
        };
    }

    // Check whether this team is actually registered
    const { data: registration, error: registrationError } =
        await supabase
            .from("registrations")
            .select("id, team_id, team_name, payment_status")
            .eq("team_id", data.id)
            .maybeSingle();

    if (registrationError) {
        return {
            data: null,
            error: registrationError
        };
    }

    if (!registration) {
        return {
            data: null,
            error: new Error(
                "Your team is not registered."
            )
        };
    }

    return {
        data,
        registration,
        error: null
    };
}

export async function saveTeamStatement(teamId, statementObj) {
  return supabase.from("teams").update({
    selected_statement: JSON.stringify(statementObj)
  }).eq("id", teamId).select().single();
}

/* -------------------------------------------------------
   DOMAIN ANSWERS (legacy support)
------------------------------------------------------- */
export async function upsertDomainAnswers(teamId, answers) {
  await supabase.from("domain_answers").delete().eq("team_id", teamId);
  if (!answers || answers.length === 0) return { data: [], error: null };
  return supabase.from("domain_answers").insert(answers.map(({ question, answer }) => ({ team_id: teamId, question, answer }))).select();
}

export async function getDomainAnswers(teamId) {
  return supabase.from("domain_answers").select("*").eq("team_id", teamId).order("id");
}

/* -------------------------------------------------------
   REGISTRATIONS
------------------------------------------------------- */
export async function upsertRegistration({
  teamId, teamName, studentName,phone, email, collegeName, department,
  foodPref, vegCount = 0, nonVegCount = 0, totalAmount = 0,
  upiId = "", paymentScreenshotUrl = "", paymentId = null,
  paymentStatus = "Pending Verification"
}) {
  return supabase.from("registrations").upsert(
    {
      team_id: teamId,
      team_name: teamName,
      student_name: studentName,
      phone: phone,
      email,
      college_name: collegeName,
      department,
      food_pref: foodPref,
      veg_count: vegCount,
      non_veg_count: nonVegCount,
      total_amount: totalAmount,
      upi_id: upiId,
      payment_id: paymentId,
      payment_screenshot_url: paymentScreenshotUrl || "",
      payment_status: paymentStatus
    },
    { onConflict: "team_name" }
  ).select().single();
}

export async function uploadPaymentScreenshot(file, teamName) {
  try {
    const ext  = file.name.split(".").pop() || "jpg";
    const path = `${normalizeKey(teamName)}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("payment-screenshots").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("payment-screenshots").getPublicUrl(path);
      return data.publicUrl;
    }
    console.warn("Storage upload notice:", error.message || error);
  } catch (e) {
    console.warn("Storage upload exception, falling back to Data URL:", e);
  }

  // Fallback: Convert image file to base64 Data URL if bucket does not exist or upload fails
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/* -------------------------------------------------------
   ADMIN / HOST DATA
------------------------------------------------------- */
export async function getAllTeamsFull() {
  const { data, error } = await supabase
    .from("teams")
    .select(`
      *,
      domain_answers(*),
      registrations(*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllTeamsFull Supabase error:", error);
    throw error;
  }

  console.log("getAllTeamsFull data:", data);

  return data || [];
}

export async function deleteTeam(teamId) {
  return supabase.from("teams").delete().eq("id", teamId);
}

export function normalizeKey(name) {
  return (name || "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}


/* -------------------------------------------------------
   PROBLEM STATEMENT CLAIMS
   The database function makes the statement claim atomic,
   so the same statement cannot be locked by two teams.
------------------------------------------------------- */
export async function getClaimedStatementIds(domain) {
  let query = supabase
    .from("statement_claims")
    .select("statement_id");

  if (domain) query = query.eq("domain", domain);

  return query;
}

export async function claimProblemStatement(teamId, statementId, statementObj) {
  return supabase.rpc("claim_problem_statement", {
    p_team_id: teamId,
    p_statement_id: statementId,
    p_statement: statementObj
  });
}

export async function getRegistrationStatusByTeam(teamId) {
  return supabase
    .from("registrations")
    .select("payment_status")
    .eq("team_id", teamId)
    .maybeSingle();
}