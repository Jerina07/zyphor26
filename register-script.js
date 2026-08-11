/* =========================================================
   ZYPHOR'26 — register-script.js
   Registration form logic with Veg/Non-Veg counters & UPI verification
   ========================================================= */

import {
  getTeamByName,
  upsertRegistration,
  uploadPaymentScreenshot
} from "./supabase-client.js";

/* ----------------------------------------------------------
   Elements & State
---------------------------------------------------------- */
const form           = document.getElementById("registrationForm");
const regTeamName    = document.getElementById("regTeamName");
const regTeamStatus  = document.getElementById("regTeamStatus");
const regSubmitBtn   = document.getElementById("regSubmitBtn");
const regSubmitText  = document.getElementById("regSubmitText");
const regSpinner     = document.getElementById("regSpinner");
const regFormStatus  = document.getElementById("regFormStatus");

let resolvedTeam = null;
let currentMaxMembers = 3; // Default 3 members
let countVeg = 3;
let countNonVeg = 0;

/* ----------------------------------------------------------
   Validation helpers
---------------------------------------------------------- */
function showErr(id, msg) {
  const el = document.querySelector(`[data-error="${id}"]`);
  const fi = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add("visible"); }
  if (fi) fi.closest(".reg-field")?.classList.add("has-error");
}
function clearErr(id) {
  const el = document.querySelector(`[data-error="${id}"]`);
  const fi = document.getElementById(id);
  if (el) { el.textContent = ""; el.classList.remove("visible"); }
  if (fi) fi.closest(".reg-field")?.classList.remove("has-error");
}
function clearAllErrors() {
  document.querySelectorAll(".reg-field-error").forEach(e => { e.textContent = ""; e.classList.remove("visible"); });
  document.querySelectorAll(".has-error").forEach(e => e.classList.remove("has-error"));
}

/* ----------------------------------------------------------
   Team Name Verification
---------------------------------------------------------- */
let teamLookupTimer = null;

regTeamName.addEventListener("input", () => {
  clearErr("regTeamName");
  resolvedTeam = null;
  regTeamStatus.textContent = "";
  regTeamStatus.className = "reg-team-status";
  clearTimeout(teamLookupTimer);

  const val = regTeamName.value.trim();
  if (!val) return;

  regTeamStatus.textContent = "Verifying team…";
  regTeamStatus.className = "reg-team-status checking";

  teamLookupTimer = setTimeout(async () => {
    try {
      const { data, error } = await getTeamByName(val);
      if (error || !data) {
        regTeamStatus.textContent = "✗ Team not found — submit Problem Statement first";
        regTeamStatus.className = "reg-team-status error";
        resolvedTeam = null;
      } else {
        resolvedTeam = data;
        regTeamStatus.textContent = `✓ Found: ${data.team_name} (${data.domain} Domain)`;
        regTeamStatus.className = "reg-team-status success";
        clearErr("regTeamName");

        // Sync team members size from Problem Statement if available
        if (data.num_members) {
          const radio = document.querySelector(`input[name="numMembers"][value="${data.num_members}"]`);
          if (radio) {
            radio.checked = true;
            updateMemberCountAndPricing(parseInt(data.num_members));
          }
        }
      }
    } catch (e) {
      regTeamStatus.textContent = "Could not verify team name";
      regTeamStatus.className = "reg-team-status error";
    }
  }, 600);
});

/* ----------------------------------------------------------
   Dynamic Members & Food Counter Controls
---------------------------------------------------------- */
const numMembersRadios = document.querySelectorAll('input[name="numMembers"]');
const totalMembersTarget = document.getElementById("totalMembersTarget");
const countVegDisplay    = document.getElementById("countVegDisplay");
const countNonVegDisplay = document.getElementById("countNonVegDisplay");
const currentSumDisplay  = document.getElementById("currentSumDisplay");
const maxMembersDisplay  = document.getElementById("maxMembersDisplay");

const calcMemberCount = document.getElementById("calcMemberCount");
const calcTotalAmount = document.getElementById("calcTotalAmount");

numMembersRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    updateMemberCountAndPricing(parseInt(radio.value));
  });
});

function updateMemberCountAndPricing(members) {
  currentMaxMembers = members;
  
  // Default Veg to max, Non-Veg to 0
  countVeg = members;
  countNonVeg = 0;

  totalMembersTarget.textContent = members;
  maxMembersDisplay.textContent  = members;

  // Update Pricing: ₹250 per member
  const totalFee = members * 250;
  calcMemberCount.textContent = members;
  calcTotalAmount.textContent = `₹${totalFee}`;
  regSubmitText.textContent   = `Submit Registration · ₹${totalFee}`;

  renderFoodCounters();
}

function renderFoodCounters() {
  countVegDisplay.textContent    = countVeg;
  countNonVegDisplay.textContent = countNonVeg;
  currentSumDisplay.textContent  = countVeg + countNonVeg;

  // Button disabled states
  document.getElementById("btnVegMinus").disabled    = (countVeg <= 0);
  document.getElementById("btnVegPlus").disabled     = (countVeg + countNonVeg >= currentMaxMembers);
  document.getElementById("btnNonVegMinus").disabled = (countNonVeg <= 0);
  document.getElementById("btnNonVegPlus").disabled  = (countVeg + countNonVeg >= currentMaxMembers);
}

// Counter button listeners
document.getElementById("btnVegPlus").addEventListener("click", () => {
  if (countVeg + countNonVeg < currentMaxMembers) {
    countVeg++;
    if (countNonVeg > 0) countNonVeg--;
    renderFoodCounters();
  }
});
document.getElementById("btnVegMinus").addEventListener("click", () => {
  if (countVeg > 0) {
    countVeg--;
    countNonVeg++;
    renderFoodCounters();
  }
});
document.getElementById("btnNonVegPlus").addEventListener("click", () => {
  if (countVeg + countNonVeg < currentMaxMembers) {
    countNonVeg++;
    if (countVeg > 0) countVeg--;
    renderFoodCounters();
  }
});
document.getElementById("btnNonVegMinus").addEventListener("click", () => {
  if (countNonVeg > 0) {
    countNonVeg--;
    countVeg++;
    renderFoodCounters();
  }
});

/* ----------------------------------------------------------
   UPI Payment Submission + Screenshot Verification
---------------------------------------------------------- */

const upiInput = document.getElementById("regUpiId");
const paymentInput = document.getElementById("paymentScreenshot");
const paymentPreview = document.getElementById("paymentPreview");
const paymentUploadTitle = document.getElementById("paymentUploadTitle");

const MAX_PAYMENT_SCREENSHOT = 2 * 1024 * 1024; // 2 MB

let paymentScreenshotFile = null;


/* ----------------------------------------------------------
   PAYMENT SCREENSHOT UPLOAD
---------------------------------------------------------- */

if (paymentInput) {

    paymentInput.addEventListener("change", function () {

        const file = this.files && this.files[0];

        paymentScreenshotFile = null;

        /* No file selected */
        if (!file) {
            if (paymentPreview) {
                paymentPreview.hidden = true;
                paymentPreview.removeAttribute("src");
            }

            if (paymentUploadTitle) {
                paymentUploadTitle.textContent =
                    "Upload Payment Screenshot";
            }

            return;
        }


        /* Check image type */
        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {

            alert("Please upload a PNG, JPG or WEBP image.");

            paymentInput.value = "";

            if (paymentPreview) {
                paymentPreview.hidden = true;
                paymentPreview.removeAttribute("src");
            }

            return;
        }


        /* Check file size */
        if (file.size > MAX_PAYMENT_SCREENSHOT) {

            alert("Screenshot must be smaller than 2 MB.");

            paymentInput.value = "";

            if (paymentPreview) {
                paymentPreview.hidden = true;
                paymentPreview.removeAttribute("src");
            }

            return;
        }


        /* Store selected file */
        paymentScreenshotFile = file;


        /* Show filename */
        if (paymentUploadTitle) {
            paymentUploadTitle.textContent = file.name;
        }


        /* Preview screenshot */
        const reader = new FileReader();

        reader.onload = function (event) {

            if (paymentPreview) {

                paymentPreview.src = event.target.result;

                paymentPreview.hidden = false;
            }

        };

        reader.onerror = function () {

            alert("Could not read the screenshot. Please try another image.");

            paymentInput.value = "";
            paymentScreenshotFile = null;

        };

        reader.readAsDataURL(file);

    });

}


/* ----------------------------------------------------------
   Form Submit
   Payment is submitted for manual verification.
---------------------------------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAllErrors();
  regFormStatus.textContent = "";

  const teamNameVal  = regTeamName.value.trim();
  const studentName  = document.getElementById("regStudentName").value.trim();
  const email        = document.getElementById("regEmail").value.trim();
  const collegeName  = document.getElementById("regCollege").value.trim();
  const department   = document.getElementById("regDept").value.trim();
  const confirmCheck = document.getElementById("regConfirmCheck");
  const upiId        = upiInput?.value.trim() || "";

  let ok = true;

  if (!teamNameVal) {
    showErr("regTeamName", "Please enter your team name.");
    ok = false;
  } else if (!resolvedTeam) {
    showErr("regTeamName", "Team not found. Please complete the Problem Statement first.");
    ok = false;
  }

  if (!studentName) {
    showErr("regStudentName", "Please enter your student name.");
    ok = false;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showErr("regEmail", "Please enter a valid email address.");
    ok = false;
  }

  if (!collegeName) {
    showErr("regCollege", "Please enter your college name.");
    ok = false;
  }

  if (!department) {
    showErr("regDept", "Please enter your department.");
    ok = false;
  }

  if (!upiId || !/^[^\s@]+@[^\s@]+$/.test(upiId)) {
    showErr("regUpiId", "Please enter a valid UPI ID.");
    ok = false;
  }

  if (!paymentScreenshotFile) {
    showErr("paymentScreenshot", "Please upload your payment screenshot.");
    ok = false;
  }

  if (!confirmCheck.checked) {
    showErr("regConfirmCheck", "Please confirm that the information is correct.");
    ok = false;
  }

  if (!ok) {
    regFormStatus.textContent = "Please fix the highlighted fields.";
    document.querySelector(".has-error, .reg-field-error.visible")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const totalAmount = currentMaxMembers * 250;
  const foodSummaryText = `${countVeg} Veg, ${countNonVeg} Non-Veg`;

  regSubmitBtn.disabled = true;
  regSubmitText.textContent = "Uploading Payment Proof…";
  regSpinner.style.display = "inline-block";

  try {
    const screenshotUrl = await uploadPaymentScreenshot(
      paymentScreenshotFile,
      teamNameVal
    );

    regSubmitText.textContent = "Submitting Registration…";

    const { error: regErr } = await upsertRegistration({
      teamId: resolvedTeam.id,
      teamName: teamNameVal,
      studentName,
      email,
      collegeName,
      department,
      foodPref: foodSummaryText,
      vegCount: countVeg,
      nonVegCount: countNonVeg,
      totalAmount,
      upiId,
      paymentId: null,
      paymentScreenshotUrl: screenshotUrl,
      paymentStatus: "Pending Verification"
    });

    if (regErr) throw regErr;

    document.getElementById("regSuccessTeam").textContent = teamNameVal;
    document.getElementById("regMain").hidden = true;
    document.getElementById("regSuccessOverlay").hidden = false;

    window.scrollTo({ top: 0, behavior: "smooth" });

  } catch (err) {
    console.error("Registration save error:", err);

    regFormStatus.textContent =
      "Submission failed: " +
      (err.message || "Please try again.");

    regSubmitBtn.disabled = false;
    regSubmitText.textContent =
      `Submit Registration · ₹${totalAmount}`;

    regSpinner.style.display = "none";
  }
});

if (registrationSuccessful) {

    // Show success message
    document.getElementById("successMessage").style.display = "block";

    // Show WhatsApp invite ONLY after submission
    document.getElementById("whatsappInvite").style.display = "block";
}


/* Initial counter render */
updateMemberCountAndPricing(3);