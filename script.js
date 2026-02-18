// Intel Sustainability Summit Check-In 

const GOAL = 50;
const STORAGE_KEY = "intel_summit_checkin_v1";

// Elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greetingEl = document.getElementById("greeting");

const attendeeCountEl = document.getElementById("attendeeCount");
const progressBarEl = document.getElementById("progressBar");

const waterCountEl = document.getElementById("waterCount");
const zeroCountEl = document.getElementById("zeroCount");
const powerCountEl = document.getElementById("powerCount");

const celebrationEl = document.getElementById("celebration");
const attendeeListEl = document.getElementById("attendeeList");

// State
let state = {
  total: 0,
  teams: {
    water: 0,
    zero: 0,
    power: 0,
  },
  attendees: [], // { name, team, teamLabel, time }
};

// ---------------------------
// Storage
// ---------------------------
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("localStorage save failed:", e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);

    // basic validation
    if (
      typeof parsed.total === "number" &&
      parsed.teams &&
      Array.isArray(parsed.attendees)
    ) {
      state = parsed;
    }
  } catch (e) {
    console.warn("localStorage load failed:", e);
  }
}

// ---------------------------
// Helpers
// ---------------------------
function cleanName(str) {
  return str.trim().replace(/\s+/g, " ");
}

function teamLabel(teamValue) {
  if (teamValue === "water") return "Team Water Wise";
  if (teamValue === "zero") return "Team Net Zero";
  if (teamValue === "power") return "Team Renewables";
  return "Unknown Team";
}

function updateCountsUI() {
  attendeeCountEl.textContent = state.total;

  waterCountEl.textContent = state.teams.water;
  zeroCountEl.textContent = state.teams.zero;
  powerCountEl.textContent = state.teams.power;
}

function updateProgressUI() {
  const percent = Math.min(100, Math.round((state.total / GOAL) * 100));
  progressBarEl.style.width = percent + "%";
}

function updateGreeting(name, teamText) {
  greetingEl.textContent = `Welcome, ${name}! ✅ You’re checked in for ${teamText}.`;
  greetingEl.classList.add("success-message");
}


function renderAttendeeList() {
  if (!attendeeListEl) return;

  attendeeListEl.innerHTML = "";

  // newest first
  const newestFirst = [...state.attendees].reverse();

  newestFirst.forEach((a) => {
    const row = document.createElement("div");
    row.className = "attendee-row";

    const left = document.createElement("span");
    left.className = "attendee-name";
    left.textContent = a.name;

    const right = document.createElement("span");
right.className = "attendee-team";
right.textContent = a.teamLabel;
right.classList.add(a.team); // add team-specific class for styling (e.g., color)

    row.appendChild(left);
    row.appendChild(right);
    attendeeListEl.appendChild(row);
  });
}

function winningTeam() {
  const entries = [
    { key: "water", label: "Team Water Wise", count: state.teams.water },
    { key: "zero", label: "Team Net Zero", count: state.teams.zero },
    { key: "power", label: "Team Renewables", count: state.teams.power },
  ].sort((a, b) => b.count - a.count);

  const top = entries[0];
  const second = entries[1];

  const tie = top.count !== 0 && top.count === second.count;
  return { ...top, tie };
}

function renderCelebrationIfGoalReached() {
  if (!celebrationEl) return;

  if (state.total < GOAL) {
    celebrationEl.textContent = "";
    celebrationEl.classList.add("hidden");
    return;
  }

  const win = winningTeam();
  celebrationEl.classList.remove("hidden");

  if (win.tie) {
    celebrationEl.textContent =
      "🎉 Attendance goal reached! It’s currently a tie for first place — keep it going!";
  } else {
    celebrationEl.textContent = `🎉 Attendance goal reached! Winning team: ${win.label} 🏆`;
  }
}

function renderAll() {
  updateCountsUI();
  updateProgressUI();
  renderAttendeeList();
  renderCelebrationIfGoalReached();
}

// ---------------------------
// Check-in handler
// ---------------------------
function handleCheckIn(event) {
  event.preventDefault();

  const name = cleanName(nameInput.value);
  const team = teamSelect.value;

if (!name) {
  greetingEl.classList.remove("success-message");   // 🔹 remove blue success styling
  greetingEl.textContent = "Please enter a name.";
  return;
}

if (!team) {
  greetingEl.classList.remove("success-message");   // 🔹 remove blue success styling
  greetingEl.textContent = "Please select a team.";
  return;
}

  // Update state
  state.total += 1;

  if (state.teams[team] === undefined) state.teams[team] = 0;
  state.teams[team] += 1;

  const label = teamLabel(team);
  state.attendees.push({
    name,
    team,
    teamLabel: label,
    time: new Date().toISOString(),
  });

  // UI updates
  updateGreeting(name, label);
  renderAll();

  // Persist
  saveState();

  // Reset form fields
  form.reset();
  nameInput.focus();
}

// ---------------------------
// Init
// ---------------------------
loadState();
renderAll();
const resetBtn = document.getElementById("resetBtn");

function resetAllData() {
  localStorage.removeItem(STORAGE_KEY);

  state = {
    total: 0,
    teams: {
      water: 0,
      zero: 0,
      power: 0,
    },
    attendees: [],
  };

  renderAll();
}

if (resetBtn) {
  resetBtn.addEventListener("click", resetAllData);
}

form.addEventListener("submit", handleCheckIn);
