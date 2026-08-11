/* =========================================================
   ZYPHOR'26 — statement-script.js (CLEAN REBUILD)

   Note: countdown/unlock timer is handled by the inline
   <script> in statement.html now — this file only handles
   team lookup, rendering available statements, and the
   atomic claim flow.
   ========================================================= */

import {
  DOMAIN_STATEMENTS,
  HACKATHON_NOTE
} from "./statements-data.js";

import {
  getTeamByName,
  saveTeamStatement,
  claimProblemStatement,
  getClaimedStatementIds
} from "./supabase-client.js";

let selectedTeamData = null;

/* =========================================================
   DOMAIN NORMALIZATION
   ========================================================= */

function normalizeDomain(domain) {
  const value = String(domain ?? "")
    .replace(/\u00A0/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  const AI_VALUES = ["ai", "artificial intelligence", "a.i", "a.i."];
  const IOT_VALUES = ["iot", "internet of things", "internet-of-things", "i.o.t", "i.o.t."];

  if (AI_VALUES.includes(value)) return "AI";
  if (IOT_VALUES.includes(value)) return "IoT";

  return null;
}

function getStatementsForDomain(domain) {
  const normalized = normalizeDomain(domain);

  if (normalized === "AI") {
    return { domain: "AI", statements: DOMAIN_STATEMENTS.AI || [] };
  }

  if (normalized === "IoT") {
    // statements-data.js stores this key as uppercase "IOT"
    return { domain: "IoT", statements: DOMAIN_STATEMENTS.IOT || [] };
  }

  return { domain: null, statements: [] };
}

/* =========================================================
   TEAM LOOKUP
   ========================================================= */

const teamLookupForm = document.getElementById("teamLookupForm");
const stmtTeamNameInput = document.getElementById("stmtTeamNameInput");
const btnStmtLookup = document.getElementById("btnStmtLookup");
const stmtLookupStatus = document.getElementById("stmtLookupStatus");
const stmtListSection = document.getElementById("stmtListSection");

if (teamLookupForm) {
  teamLookupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    stmtLookupStatus.textContent = "";
    stmtLookupStatus.className = "stmt-lookup-status";

    const nameVal = stmtTeamNameInput.value.trim();

    if (!nameVal) {
      stmtLookupStatus.textContent = "Please enter your team name.";
      stmtLookupStatus.classList.add("error");
      return;
    }

    btnStmtLookup.disabled = true;
    stmtLookupStatus.textContent = "Searching team database…";

    try {
      const { data, error } = await getTeamByName(nameVal);

      btnStmtLookup.disabled = false;

      if (error || !data) {
        stmtLookupStatus.textContent =
          "✗ Team not found. Please register your team in the Application page first.";
        stmtLookupStatus.classList.add("error");
        return;
      }

      selectedTeamData = data;

      console.log("RAW team.domain value from DB:", JSON.stringify(data.domain));

      const domain = normalizeDomain(data.domain);

      if (!domain) {
        stmtLookupStatus.textContent =
          `✗ Invalid team domain ("${data.domain}"). Please contact the organizer.`;
        stmtLookupStatus.classList.add("error");
        stmtListSection.hidden = true;
        stmtListSection.style.display = "none";
        return;
      }

      stmtLookupStatus.textContent = `✓ Found Team "${data.team_name}" (${domain} Domain)`;
      stmtLookupStatus.classList.add("success");

      if (data.selected_statement) {
        try {
          let savedStatement = data.selected_statement;

          if (typeof savedStatement === "string") {
            savedStatement = JSON.parse(savedStatement);
          }

          if (savedStatement && savedStatement.id) {
            showConfirmedPanel(savedStatement);
            return;
          }
        } catch (err) {
          console.warn("Saved statement could not be parsed:", err);
        }
      }

      await renderStatementsForDomain(domain);

      const displayTeamName = document.getElementById("displayTeamName");
      const displayTeamDomain = document.getElementById("displayTeamDomain");

      if (displayTeamName) displayTeamName.textContent = data.team_name;
      if (displayTeamDomain) displayTeamDomain.textContent = `${domain} Domain`;

      stmtListSection.hidden = false;
      stmtListSection.style.display = "block";
      stmtListSection.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      btnStmtLookup.disabled = false;
      stmtLookupStatus.textContent = "Lookup failed: " + (err.message || "Unknown error");
      stmtLookupStatus.classList.add("error");
    }
  });
}

/* =========================================================
   RENDER STATEMENTS (only shows statements not yet claimed)
   ========================================================= */

const stmtCardsGrid = document.getElementById("stmtCardsGrid");

async function renderStatementsForDomain(domain) {
  const result = getStatementsForDomain(domain);

  if (!result.domain || !result.statements.length) {
    stmtCardsGrid.innerHTML = `
      <div class="stmt-availability-error">
        <strong>No problem statements found for "${escapeHtml(domain)}".</strong>
        <p>Please contact the organizer.</p>
      </div>
    `;
    return;
  }

  stmtCardsGrid.innerHTML = `<div class="stmt-availability-error">Loading available statements…</div>`;

  const { data: claimedRows, error: claimedError } = await getClaimedStatementIds(domain);

  if (claimedError) {
    console.warn("Could not fetch claimed statements:", claimedError);
  }

  const claimedIds = new Set(
    (claimedRows || []).map(row => row.statement_id)
  );

  const availableStatements = result.statements.filter(
    item => !claimedIds.has(item.id)
  );

  stmtCardsGrid.innerHTML = "";

  const noteEl = document.getElementById("stmtHackathonNote");

  if (noteEl) {
    if (result.domain === "IoT") {
      noteEl.hidden = false;
      noteEl.innerHTML = `<strong>Hackathon Note:</strong> ${escapeHtml(HACKATHON_NOTE)}`;
    } else {
      noteEl.hidden = true;
      noteEl.textContent = "";
    }
  }

  if (!availableStatements.length) {
    stmtCardsGrid.innerHTML = `
      <div class="stmt-availability-error">
        <strong>All problem statements for ${escapeHtml(domain)} domain have been claimed.</strong>
        <p>Please contact the organizer.</p>
      </div>
    `;
    return;
  }

  availableStatements.forEach((item, index) => {
    const label = document.createElement("label");
    label.className = "stmt-card";
    label.setAttribute("for", `stmt_${item.id}`);

    label.innerHTML = `
      <input
        type="radio"
        name="selectedStatementId"
        id="stmt_${item.id}"
        value="${escapeHtml(item.id)}"
        class="stmt-card-radio"
        ${index === 0 ? "checked" : ""}
      >
      <div class="stmt-card-inner">
        <div class="stmt-card-code">${escapeHtml(item.id)}</div>
        <div class="stmt-card-body">
          <h3 class="stmt-card-title">${escapeHtml(item.title)}</h3>
          <p class="stmt-card-desc">${escapeHtml(item.description)}</p>
          <div class="stmt-card-meta">
            <span class="stmt-tag">${escapeHtml(item.category)}</span>
            <span class="stmt-tag">${escapeHtml(item.level)}</span>
          </div>
        </div>
        <div class="stmt-card-radio-mark"></div>
      </div>
    `;

    stmtCardsGrid.appendChild(label);
  });
}

/* =========================================================
   CONFIRM STATEMENT (atomic claim)
   ========================================================= */

const statementSelectForm = document.getElementById("statementSelectForm");
const btnConfirmStatement = document.getElementById("btnConfirmStatement");
const btnConfirmText = document.getElementById("btnConfirmText");

if (statementSelectForm) {
  statementSelectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!selectedTeamData) {
      alert("Please enter your team name first.");
      return;
    }

    const checkedRadio = document.querySelector(
      'input[name="selectedStatementId"]:checked'
    );

    if (!checkedRadio) {
      alert("Please select a problem statement.");
      return;
    }

    const stmtId = checkedRadio.value;
    const domain = normalizeDomain(selectedTeamData.domain);

    if (!domain) {
      alert("Invalid team domain.");
      return;
    }

    const result = getStatementsForDomain(domain);
    const matchObj = result.statements.find(item => item.id === stmtId);

    if (!matchObj) {
      alert("This problem statement does not belong to your registered domain.");
      return;
    }

    btnConfirmStatement.disabled = true;
    btnConfirmText.textContent = "Saving Selection…";

    try {
      const { data, error } = await claimProblemStatement(
        selectedTeamData.id,
        matchObj.id,
        matchObj
      );

      if (error) {
        alert(error.message || "This statement was just claimed by another team. Please pick another.");
        btnConfirmStatement.disabled = false;
        btnConfirmText.textContent = "Confirm & Lock Selected Statement";
        await renderStatementsForDomain(domain);
        return;
      }

      await saveTeamStatement(selectedTeamData.id, matchObj);

      showConfirmedPanel(matchObj);
    } catch (err) {
      alert("Save failed: " + err.message);
      btnConfirmStatement.disabled = false;
      btnConfirmText.textContent = "Confirm & Lock Selected Statement";
    }
  });
}

/* =========================================================
   CONFIRMED PANEL
   ========================================================= */

function showConfirmedPanel(stmtObj) {
  const lookupSection = document.getElementById("stmtLookupSection");
  const listSection = document.getElementById("stmtListSection");
  const successBox = document.getElementById("stmtSuccessBox");

  if (lookupSection) {
    lookupSection.hidden = true;
    lookupSection.style.display = "none";
  }
  if (listSection) {
    listSection.hidden = true;
    listSection.style.display = "none";
  }

  const confirmedTeamDisplay = document.getElementById("confirmedTeamDisplay");
  const confCode = document.getElementById("confCode");
  const confTitle = document.getElementById("confTitle");
  const confDesc = document.getElementById("confDesc");

  if (confirmedTeamDisplay) {
    confirmedTeamDisplay.textContent = selectedTeamData ? selectedTeamData.team_name : "";
  }
  if (confCode) confCode.textContent = stmtObj.id || "";
  if (confTitle) confTitle.textContent = stmtObj.title || "";
  if (confDesc) confDesc.textContent = stmtObj.description || "";

  if (successBox) {
    successBox.hidden = false;
    successBox.style.display = "block";
    successBox.scrollIntoView({ behavior: "smooth" });
  }
}

/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (m) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m];
  });
}