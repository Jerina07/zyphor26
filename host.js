/* =========================================================
ZYPHOR'26 — host.js
Admin / Host Dashboard
Supabase + Payment Verification
========================================================= */

import {
  supabase,
  getAllTeamsFull,
  deleteTeam
} from "./supabase-client.js";

const HOST_PASSCODE = "ZYPHOR26HOST";

/* ----------------------------------------------------------
Elements
---------------------------------------------------------- */

const gate = document.getElementById("gate");
const dashboard = document.getElementById("dashboard");
const gateForm = document.getElementById("gateForm");
const gateError = document.getElementById("gateError");

const searchInput = document.getElementById("searchInput");
const domainFilter = document.getElementById("domainFilter");

const tbody = document.getElementById("teamsTableBody");
const dashEmpty = document.getElementById("dashEmpty");

const imgModal = document.getElementById("imgModal");
const imgModalImage = document.getElementById("imgModalImage");
const imgModalClose = document.getElementById("imgModalClose");

let allTeams = [];


/* ----------------------------------------------------------
Gate logic
---------------------------------------------------------- */

gateForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const input = document.getElementById("gatePasscode");
  const entered = (input.value || "").trim().toUpperCase();

  if (entered === HOST_PASSCODE) {
    sessionStorage.setItem("zyphor26_host", "1");
    unlockDashboard();
  } else {
    gateError.textContent =
      "Incorrect passcode. Please try again.";

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


if (sessionStorage.getItem("zyphor26_host") === "1") {
  unlockDashboard();
}


/* ----------------------------------------------------------
Lock
---------------------------------------------------------- */

document.getElementById("lockBtn")?.addEventListener("click", () => {

  sessionStorage.removeItem("zyphor26_host");

  dashboard.hidden = true;
  dashboard.style.display = "none";

  gate.hidden = false;
  gate.style.display = "flex";

  document.getElementById("gatePasscode").value = "";
});


/* ----------------------------------------------------------
Optional refresh button
---------------------------------------------------------- */

document
  .getElementById("refreshBtn")
  ?.addEventListener("click", loadTeams);


/* ----------------------------------------------------------
Load Teams
---------------------------------------------------------- */

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

      showToast(
        "No teams found in Supabase.",
        "info"
      );
    }

  } catch (err) {

    console.error(
      "Failed to load teams:",
      err
    );

    showToast(
      "Failed to load data: " +
      (err.message || "Unknown error"),
      "error"
    );

  } finally {

    showLoading(false);

  }
}


/* ----------------------------------------------------------
Loading
---------------------------------------------------------- */

function showLoading(show) {

  const loading = document.getElementById("dashLoading");
  const table = document.getElementById("teamsTable");

  if (loading) {
    loading.hidden = !show;
  }

  if (table) {
    table.hidden = show;
  }
}


/* ----------------------------------------------------------
Metrics
---------------------------------------------------------- */

function computeMetrics(teams) {

  let teamCount = teams.length;
  let totalMembers = 0;
  let totalVeg = 0;
  let totalNonVeg = 0;

  teams.forEach((team) => {

    totalMembers +=
      parseInt(team.num_members) || 1;

    const reg =
      team.registrations?.[0];

    if (!reg) return;

    if (
      reg.veg_count !== undefined &&
      reg.veg_count !== null
    ) {

      totalVeg +=
        parseInt(reg.veg_count) || 0;

      totalNonVeg +=
        parseInt(reg.non_veg_count) || 0;

    } else if (reg.food_pref) {

      if (
        reg.food_pref
          .toLowerCase()
          .includes("veg")
      ) {

        totalVeg +=
          parseInt(team.num_members) || 1;

      } else {

        totalNonVeg +=
          parseInt(team.num_members) || 1;
      }
    }
  });

  document.getElementById(
    "metricTeamCount"
  ).textContent = teamCount;

  document.getElementById(
    "metricMemberCount"
  ).textContent = totalMembers;

  document.getElementById(
    "metricVegCount"
  ).textContent = totalVeg;

  document.getElementById(
    "metricNonVegCount"
  ).textContent = totalNonVeg;
}


/* ----------------------------------------------------------
Search / Filter
---------------------------------------------------------- */

[searchInput, domainFilter]
  .filter(Boolean)
  .forEach((el) => {

    el.addEventListener(
      "input",
      renderTable
    );

  });


function getFiltered() {

  const q =
    searchInput?.value
      .trim()
      .toLowerCase() || "";

  const domain =
    domainFilter?.value || "";

  return allTeams.filter((team) => {

    const reg =
      team.registrations?.[0];

    if (
      domain &&
      team.domain !== domain
    ) {
      return false;
    }

    if (!q) {
      return true;
    }

    const hay = [

      team.team_name,
      team.team_leader,
      team.domain,

      reg?.student_name,
      reg?.email,
      reg?.college_name,
      reg?.department

    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return hay.includes(q);
  });
}


/* ----------------------------------------------------------
Render Table
---------------------------------------------------------- */

function renderTable() {

  const filtered = getFiltered();

  tbody.innerHTML = "";

  dashEmpty.hidden =
    filtered.length !== 0;


  filtered.forEach((team) => {

    const reg =
      team.registrations?.[0] || null;

    const members = [
      team.team_leader,
      ...(team.member_names || [])
    ]
      .filter(Boolean)
      .join(", ");


    /* ------------------------------------------
       Selected Statement
    ------------------------------------------ */

    let stmtHtml =
      `<span class="team-na">Not Selected</span>`;

    if (team.selected_statement) {

      try {

        const stmtObj =
          typeof team.selected_statement === "string"
            ? JSON.parse(team.selected_statement)
            : team.selected_statement;

        stmtHtml = `
          <div class="tbl-stmt-badge">

            <span class="tbl-stmt-id">
              ${escHtml(stmtObj.id || "")}
            </span>

            <span class="tbl-stmt-title">
              ${escHtml(stmtObj.title || "")}
            </span>

          </div>
        `;

      } catch (e) {

        stmtHtml = `
          <span class="tbl-stmt-id">
            ${escHtml(team.selected_statement)}
          </span>
        `;
      }
    }


    /* ------------------------------------------
       Food
    ------------------------------------------ */

    let foodDisplay = "—";

    if (reg) {

      if (
        reg.veg_count !== undefined &&
        reg.veg_count !== null
      ) {

        foodDisplay = `
          🟢 ${escHtml(reg.veg_count)} Veg
          &bull;
          🔴 ${escHtml(reg.non_veg_count)} Non-Veg
        `;

      } else {

        foodDisplay =
          escHtml(reg.food_pref || "—");
      }
    }


    /* ------------------------------------------
       Payment
    ------------------------------------------ */

    let paymentHtml = `
      <span class="team-na">
        Unpaid
      </span>
    `;


    if (reg) {

      const status =
        reg.payment_status ||
        "Pending Verification";

      const screenshotUrl =
        reg.payment_screenshot_url ||
        "";


      paymentHtml = `

        <button
          type="button"
          class="tbl-pay-badge payment-review-btn"
          data-registration-id="${escHtml(reg.id)}"
          data-team-name="${escHtml(team.team_name)}"
          data-screenshot="${escHtml(screenshotUrl)}"
          data-status="${escHtml(status)}"
        >
          ${escHtml(status)}
        </button>

        <div
          style="
            font-size:0.72rem;
            color:var(--gold);
            margin-top:0.2rem;
          "
        >
          ₹${escHtml(
            reg.total_amount ||
            (team.num_members * 250)
          )}
        </div>

        <div
          style="
            font-size:0.68rem;
            color:rgba(255,255,255,0.3);
          "
        >
          ${escHtml(
            reg.payment_id || "UPI Payment"
          )}
        </div>
      `;
    }


    /* ------------------------------------------
       Row
    ------------------------------------------ */

    const tr =
      document.createElement("tr");


    tr.innerHTML = `

      <td>

        <div class="tbl-team-title">
          ${escHtml(team.team_name)}
        </div>

        <span
          style="
            font-size:0.72rem;
            color:rgba(255,255,255,0.3);
          "
        >
          ${
            team.created_at
              ? new Date(
                  team.created_at
                ).toLocaleDateString()
              : ""
          }
        </span>

      </td>


      <td>

        <span
          class="
            tbl-domain-tag
            ${(team.domain || "").toLowerCase()}
          "
        >
          ${escHtml(team.domain || "—")}
        </span>

      </td>


      <td>
        <strong>
          ${escHtml(team.team_leader || "—")}
        </strong>
      </td>


      <td>

        <div>
          <strong>
            ${team.num_members || 1}
            Members
          </strong>
        </div>

        <div
          style="
            font-size:0.75rem;
            color:rgba(255,255,255,0.5);
          "
        >
          ${escHtml(members)}
        </div>

      </td>


      <td>
        ${foodDisplay}
      </td>


      <td>
        ${stmtHtml}
      </td>


      <td>

        ${
          reg
            ? `

              <div>
                <strong>
                  ${escHtml(
                    reg.student_name
                  )}
                </strong>
              </div>

              <div
                style="
                  font-size:0.75rem;
                  color:rgba(255,255,255,0.5);
                "
              >
                ${escHtml(reg.email)}
              </div>

              <div
                style="
                  font-size:0.75rem;
                  color:rgba(255,255,255,0.4);
                "
              >
                ${escHtml(reg.college_name)}
                (${escHtml(reg.department)})
              </div>

            `
            : `
              <span class="team-na">
                Registration Pending
              </span>
            `
        }

      </td>


      <td>
        ${paymentHtml}
      </td>


      <td>

        <button
          class="btn-tb-del"
          data-team-id="${escHtml(team.id)}"
          data-team-name="${escHtml(team.team_name)}"
        >
          Delete
        </button>

      </td>
    `;


    tbody.appendChild(tr);
  });


  attachPaymentHandlers();
  attachDeleteHandlers();
}


/* =========================================================
PAYMENT VERIFICATION
========================================================= */


/* ----------------------------------------------------------
Create Verification Controls
---------------------------------------------------------- */

function createPaymentControls() {

  let controls =
    document.getElementById(
      "paymentVerificationControls"
    );

  if (controls) {
    return controls;
  }


  controls =
    document.createElement("div");

  controls.id =
    "paymentVerificationControls";

  controls.style.cssText = `
    display:flex;
    gap:12px;
    justify-content:center;
    align-items:center;
    margin-top:16px;
    flex-wrap:wrap;
  `;


  controls.innerHTML = `

    <button
      type="button"
      id="verifyPaymentBtn"
      style="
        padding:10px 22px;
        border:0;
        border-radius:8px;
        cursor:pointer;
        background:#22c55e;
        color:white;
        font-weight:600;
      "
    >
      ✓ Verify Payment
    </button>


    <button
      type="button"
      id="rejectPaymentBtn"
      style="
        padding:10px 22px;
        border:0;
        border-radius:8px;
        cursor:pointer;
        background:#ef4444;
        color:white;
        font-weight:600;
      "
    >
      ✕ Reject Payment
    </button>

  `;


  imgModal.appendChild(controls);

  return controls;
}


/* ----------------------------------------------------------
Open Payment Screenshot
---------------------------------------------------------- */

function openPaymentModal(
  registrationId,
  teamName,
  screenshotUrl,
  status
) {

  console.log(
    "Opening payment:",
    {
      registrationId,
      teamName,
      screenshotUrl,
      status
    }
  );


  if (!screenshotUrl) {

    showToast(
      `No payment screenshot found for ${teamName}.`,
      "error"
    );

    return;
  }


  const controls =
    createPaymentControls();


  imgModalImage.src =
    screenshotUrl;

  imgModalImage.alt =
    `Payment proof - ${teamName}`;


  controls.style.display =
    "flex";


  const verifyBtn =
    document.getElementById(
      "verifyPaymentBtn"
    );

  const rejectBtn =
    document.getElementById(
      "rejectPaymentBtn"
    );


  /* ------------------------------------------
     Current Status
  ------------------------------------------ */

  const normalizedStatus =
    (status || "")
      .toLowerCase();


  if (
    normalizedStatus === "verified" ||
    normalizedStatus === "rejected"
  ) {

    verifyBtn.disabled = true;
    rejectBtn.disabled = true;

    verifyBtn.textContent =
      status === "Verified"
        ? "✓ Payment Verified"
        : "✓ Verify Payment";

    rejectBtn.textContent =
      status === "Rejected"
        ? "✕ Payment Rejected"
        : "✕ Reject Payment";

  } else {

    verifyBtn.disabled = false;
    rejectBtn.disabled = false;

    verifyBtn.textContent =
      "✓ Verify Payment";

    rejectBtn.textContent =
      "✕ Reject Payment";
  }


  /* ------------------------------------------
     Button Actions
  ------------------------------------------ */

  verifyBtn.onclick = async () => {

    await updatePaymentStatus(
      registrationId,
      teamName,
      "Verified"
    );
  };


  rejectBtn.onclick = async () => {

    const confirmed =
      confirm(
        `Reject payment for "${teamName}"?`
      );

    if (!confirmed) return;


    await updatePaymentStatus(
      registrationId,
      teamName,
      "Rejected"
    );
  };


  imgModal.hidden = false;

  imgModal.style.display =
    "flex";
}


/* ----------------------------------------------------------
Payment Button Handlers
---------------------------------------------------------- */

function attachPaymentHandlers() {

  document
    .querySelectorAll(".payment-review-btn")
    .forEach((btn) => {

      btn.addEventListener(
        "click",
        () => {

          const registrationId =
            btn.dataset.registrationId;

          const teamName =
            btn.dataset.teamName;

          const screenshot =
            btn.dataset.screenshot;

          const status =
            btn.dataset.status;


          openPaymentModal(
            registrationId,
            teamName,
            screenshot,
            status
          );
        }
      );
    });
}


/* ----------------------------------------------------------
Update Payment Status
---------------------------------------------------------- */

async function updatePaymentStatus(
  registrationId,
  teamName,
  newStatus
) {

  if (!registrationId) {

    showToast(
      "Registration ID is missing.",
      "error"
    );

    return;
  }


  try {

    console.log(
      `Updating payment ${registrationId} → ${newStatus}`
    );


    const {
      error
    } = await supabase
      .from("registrations")
      .update({
        payment_status: newStatus
      })
      .eq("id", registrationId);


    if (error) {
      throw error;
    }


    showToast(
      `${teamName} payment marked as ${newStatus}.`,
      "success"
    );


    closePaymentModal();


    /* Refresh dashboard */
    await loadTeams();


  } catch (err) {

    console.error(
      "Payment status update failed:",
      err
    );

    showToast(
      "Could not update payment: " +
      (err.message || "Unknown error"),
      "error"
    );
  }
}


/* ----------------------------------------------------------
Close Payment Modal
---------------------------------------------------------- */

function closePaymentModal() {

  if (!imgModal) return;

  imgModal.hidden = true;
  imgModal.style.display = "none";

  if (imgModalImage) {
    imgModalImage.removeAttribute("src");
  }
}


imgModalClose?.addEventListener(
  "click",
  closePaymentModal
);


imgModal?.addEventListener(
  "click",
  (e) => {

    if (e.target === imgModal) {
      closePaymentModal();
    }

  }
);


document.addEventListener(
  "keydown",
  (e) => {

    if (
      e.key === "Escape" &&
      imgModal &&
      !imgModal.hidden
    ) {

      closePaymentModal();
    }

  }
);


/* =========================================================
DELETE TEAM
========================================================= */

function attachDeleteHandlers() {

  tbody
    .querySelectorAll(".btn-tb-del")
    .forEach((btn) => {

      btn.addEventListener(
        "click",
        async (e) => {

          const teamId =
            e.currentTarget.dataset.teamId;

          const teamName =
            e.currentTarget.dataset.teamName;


          const confirmed =
            confirm(
              `Remove team "${teamName}" from ZYPHOR'26? This cannot be undone.`
            );


          if (!confirmed) return;


          try {

            const { error } =
              await deleteTeam(teamId);


            if (error) {
              throw error;
            }


            showToast(
              `Team "${teamName}" removed.`,
              "success"
            );


            await loadTeams();


          } catch (err) {

            console.error(
              "Delete failed:",
              err
            );

            showToast(
              "Delete failed: " +
              (err.message || "Unknown error"),
              "error"
            );
          }
        }
      );
    });
}


/* =========================================================
CSV EXPORT
========================================================= */

document
  .getElementById("exportCsvBtn")
  ?.addEventListener(
    "click",
    () => {

      const teams =
        getFiltered();


      if (teams.length === 0) {

        showToast(
          "No teams to export.",
          "error"
        );

        return;
      }


      const headers = [

        "Team Name",
        "Domain",
        "Team Leader",
        "No. of Members",
        "All Members",
        "Selected Statement",
        "Student Name",
        "Email",
        "College",
        "Department",
        "Veg Count",
        "Non-Veg Count",
        "Payment Status",
        "Total Amount",
        "Payment ID"

      ];


      const rows =
        teams.map((t) => {

          const reg =
            t.registrations?.[0] || {};

          const members = [

            t.team_leader,
            ...(t.member_names || [])

          ]
            .filter(Boolean)
            .join(" | ");


          return [

            t.team_name,
            t.domain,
            t.team_leader,
            t.num_members,
            members,
            t.selected_statement ||
              "Not Selected",

            reg.student_name || "",
            reg.email || "",
            reg.college_name || "",
            reg.department || "",

            reg.veg_count || 0,
            reg.non_veg_count || 0,

            reg.payment_status ||
              "Pending Verification",

            reg.total_amount ||
              ((t.num_members || 1) * 250),

            reg.payment_id || ""

          ];
        });


      const csv =
        [headers, ...rows]
          .map((row) =>
            row
              .map((v) => csvEsc(v))
              .join(",")
          )
          .join("\n");


      const blob =
        new Blob(
          [csv],
          {
            type:
              "text/csv;charset=utf-8;"
          }
        );


      const url =
        URL.createObjectURL(blob);


      const a =
        Object.assign(
          document.createElement("a"),
          {
            href: url,
            download:
              `zyphor26-teams-${new Date()
                .toISOString()
                .slice(0, 10)}.csv`
          }
        );


      a.click();

      URL.revokeObjectURL(url);


      showToast(
        "CSV exported!",
        "success"
      );
    }
  );


/* =========================================================
HELPERS
========================================================= */

function csvEsc(v) {

  const s =
    String(v ?? "");

  return /[",\n]/.test(s)
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}


function escHtml(str) {

  return String(str ?? "")
    .replace(
      /[&<>"']/g,
      (m) => {

        const map = {

          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"

        };

        return map[m];
      }
    );
}


/* =========================================================
TOAST
========================================================= */

const toast =
  document.getElementById("toast");

let toastTimer = null;


function showToast(
  msg,
  type = "info"
) {

  toast.textContent = msg;

  toast.className =
    `toast toast--visible toast--${type}`;

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(() => {

      toast.className =
        "toast";

    }, 3500);
}