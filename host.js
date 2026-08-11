/* =========================================================
   ZYPHOR'26 — host.js  (Admin/Host Dashboard)
   Reads from Supabase — Metrics, Table View & Actions
   ========================================================= */

import { getAllTeamsFull, deleteTeam } from "./supabase-client.js";

const HOST_PASSCODE = "ZYPHOR26HOST";

/* ----------------------------------------------------------
   Gate logic
---------------------------------------------------------- */
const gate      = document.getElementById("gate");
const dashboard = document.getElementById("dashboard");
const gateForm  = document.getElementById("gateForm");
const gateError = document.getElementById("gateError");

gateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("gatePasscode");
  const entered = (input.value || "").trim().toUpperCase();
  if (entered === HOST_PASSCODE) {
    sessionStorage.setItem("zyphor26_host", "1");
    unlockDashboard();
  } else {
    gateError.textContent = "Incorrect passcode. Please try again.";
    input.value = "";
    input.focus();
  }
});

function unlockDashboard() {
  gate.hidden = true;
  gate.style.display = "none";
  dashboard.hidden = false;
  dashboard.style.display = "block";
  loadTeams();
}

if (sessionStorage.getItem("zyphor26_host") === "1") unlockDashboard();

document.getElementById("lockBtn").addEventListener("click", () => {
  sessionStorage.removeItem("zyphor26_host");
  dashboard.hidden = true;
  dashboard.style.display = "none";
  gate.hidden = false;
  gate.style.display = "flex";
  document.getElementById("gatePasscode").value = "";
});

document.getElementById("refreshBtn")?.addEventListener("click", loadTeams);

/* ----------------------------------------------------------
   Load & Compute Metrics & Render Table
---------------------------------------------------------- */
let allTeams = [];

async function loadTeams() {
  showLoading(true);

  try {
    console.log("Loading teams from Supabase...");

    const result = await getAllTeamsFull();

    console.log("Supabase teams result:", result);

    allTeams = result || [];

    computeMetrics(allTeams);
    renderTable();

    if (allTeams.length === 0) {
      console.warn("No teams returned from Supabase.");
      showToast("No teams found in Supabase.", "info");
    }

  } catch (err) {
    console.error("Failed to load teams:", err);

    showToast(
      "Failed to load data: " + (err.message || "Unknown error"),
      "error"
    );
  } finally {
    showLoading(false);
  }
}
function showLoading(show) {
  document.getElementById("dashLoading").hidden = !show;
  document.getElementById("teamsTable").hidden  = show;
}

/* ----------------------------------------------------------
   Metrics Aggregation
---------------------------------------------------------- */
function computeMetrics(teams) {
  let teamCount = teams.length;
  let totalMembers = 0;
  let totalVeg = 0;
  let totalNonVeg = 0;

  teams.forEach(t => {
    totalMembers += (parseInt(t.num_members) || 1);

    const reg = t.registrations?.[0];
    if (reg) {
      if (reg.veg_count !== undefined && reg.veg_count !== null) {
        totalVeg += parseInt(reg.veg_count) || 0;
        totalNonVeg += parseInt(reg.non_veg_count) || 0;
      } else if (reg.food_pref) {
        if (reg.food_pref.includes("Veg")) totalVeg += (parseInt(t.num_members) || 1);
        else totalNonVeg += (parseInt(t.num_members) || 1);
      }
    }
  });

  document.getElementById("metricTeamCount").textContent   = teamCount;
  document.getElementById("metricMemberCount").textContent = totalMembers;
  document.getElementById("metricVegCount").textContent    = totalVeg;
  document.getElementById("metricNonVegCount").textContent = totalNonVeg;
}

/* ----------------------------------------------------------
   Filter & Render Table
---------------------------------------------------------- */
const searchInput  = document.getElementById("searchInput");
const domainFilter = document.getElementById("domainFilter");

[searchInput, domainFilter].forEach(el => el.addEventListener("input", renderTable));

function getFiltered() {
  const q      = searchInput.value.trim().toLowerCase();
  const domain = domainFilter.value;

  return allTeams.filter(team => {
    const reg = team.registrations?.[0];
    if (domain && team.domain !== domain) return false;
    if (!q) return true;
    const hay = [
      team.team_name, team.team_leader, team.domain,
      reg?.student_name, reg?.email, reg?.college_name, reg?.department
    ].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q);
  });
}

const tbody     = document.getElementById("teamsTableBody");
const dashEmpty = document.getElementById("dashEmpty");

function renderTable() {
  const filtered = getFiltered();
  tbody.innerHTML = "";

  dashEmpty.hidden = filtered.length !== 0;

  filtered.forEach(team => {
    const reg = team.registrations?.[0] || null;
    const members = [team.team_leader, ...(team.member_names || [])].filter(Boolean).join(", ");
    
    // Parse selected statement if any
    let stmtHtml = `<span class="team-na">Not Selected</span>`;
    if (team.selected_statement) {
      try {
        const stmtObj = typeof team.selected_statement === "string" ? JSON.parse(team.selected_statement) : team.selected_statement;
        stmtHtml = `
          <div class="tbl-stmt-badge">
            <span class="tbl-stmt-id">${escHtml(stmtObj.id)}</span>
            <span class="tbl-stmt-title">${escHtml(stmtObj.title)}</span>
          </div>
        `;
      } catch(e) {
        stmtHtml = `<span class="tbl-stmt-id">${escHtml(team.selected_statement)}</span>`;
      }
    }

    // Food breakdown
    let foodDisplay = "—";
    if (reg) {
      if (reg.veg_count !== undefined && reg.veg_count !== null) {
        foodDisplay = `🟢 ${reg.veg_count} Veg &bull; 🔴 ${reg.non_veg_count} Non-Veg`;
      } else {
        foodDisplay = escHtml(reg.food_pref || "—");
      }
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="tbl-team-title">${escHtml(team.team_name)}</div>
        <span style="font-size: 0.72rem; color: rgba(255,255,255,0.3);">${team.created_at ? new Date(team.created_at).toLocaleDateString() : ""}</span>
      </td>
      <td>
        <span class="tbl-domain-tag ${(team.domain || "").toLowerCase()}">${escHtml(team.domain || "—")}</span>
      </td>
      <td><strong>${escHtml(team.team_leader || "—")}</strong></td>
      <td>
        <div><strong>${team.num_members || 1} Members</strong></div>
        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">${escHtml(members)}</div>
      </td>
      <td>${foodDisplay}</td>
      <td>${stmtHtml}</td>
      <td>
        ${reg ? `
          <div><strong>${escHtml(reg.student_name)}</strong></div>
          <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">${escHtml(reg.email)}</div>
          <div style="font-size: 0.75rem; color: rgba(255,255,255,0.4);">${escHtml(reg.college_name)} (${escHtml(reg.department)})</div>
        ` : `<span class="team-na">Registration Pending</span>`}
      </td>
      <td>
        ${reg ? `
          <span class="tbl-pay-badge ${reg.payment_status?.toLowerCase() || "confirmed"}">${escHtml(reg.payment_status || "Confirmed")}</span>
          <div style="font-size: 0.72rem; color: var(--gold); margin-top: 0.2rem;">₹${reg.total_amount || (team.num_members * 250)}</div>
          <div style="font-size: 0.68rem; color: rgba(255,255,255,0.3);">${escHtml(reg.payment_id || "Razorpay")}</div>
        ` : `<span class="team-na">Unpaid</span>`}
      </td>
      <td>
        <button class="btn-tb-del" data-team-id="${team.id}" data-team-name="${escHtml(team.team_name)}">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Attach delete handlers
  tbody.querySelectorAll(".btn-tb-del").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const teamId   = e.currentTarget.dataset.teamId;
      const teamName = e.currentTarget.dataset.teamName;
      if (!confirm(`Remove team "${teamName}" from ZYPHOR'26? This cannot be undone.`)) return;
      try {
        await deleteTeam(teamId);
        showToast(`Team "${teamName}" removed.`, "success");
        await loadTeams();
      } catch (err) {
        showToast("Delete failed: " + err.message, "error");
      }
    });
  });
}

/* ----------------------------------------------------------
   CSV Export
---------------------------------------------------------- */
document.getElementById("exportCsvBtn").addEventListener("click", () => {
  const teams = getFiltered();
  if (teams.length === 0) { showToast("No teams to export.", "error"); return; }

  const headers = [
    "Team Name","Domain","Team Leader","No. of Members","All Members","Selected Statement",
    "Student Name","Email","College","Department","Veg Count","Non-Veg Count","Payment Status","Total Amount","Payment ID"
  ];

  const rows = teams.map(t => {
    const reg     = t.registrations?.[0] || {};
    const members = [t.team_leader, ...(t.member_names || [])].filter(Boolean).join(" | ");
    return [
      t.team_name, t.domain, t.team_leader, t.num_members, members, t.selected_statement || "Not Selected",
      reg.student_name, reg.email, reg.college_name, reg.department, reg.veg_count || 0, reg.non_veg_count || 0,
      reg.payment_status || "Pending", reg.total_amount || (t.num_members * 250), reg.payment_id || ""
    ];
  });

  const csv = [headers, ...rows].map(r => r.map(v => csvEsc(v)).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: `zyphor26-teams-${new Date().toISOString().slice(0,10)}.csv` });
  a.click();
  URL.revokeObjectURL(url);
  showToast("CSV exported!", "success");
});

/* ----------------------------------------------------------
   Helpers & Toast
---------------------------------------------------------- */
const toast = document.getElementById("toast");
let toastTimer = null;
function showToast(msg, type = "info") {
  toast.textContent = msg;
  toast.className   = `toast toast--visible`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = "toast"; }, 3500);
}

function csvEsc(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function escHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}
