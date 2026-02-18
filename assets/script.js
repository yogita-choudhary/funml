// Simple “data-driven” announcements. Edit this array.
const announcements = [
  { date: "Feb 18, 2026", text: "HW1 posted. Due next Monday at 11:59pm." },
  { date: "Feb 12, 2026", text: "Office hours moved to Wed 2–4pm this week." },
];

function renderAnnouncements() {
  const el = document.getElementById("announcements");
  if (!el) return;

  if (!announcements.length) {
    el.textContent = "No announcements yet.";
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "links";
  announcements.slice(0, 5).forEach(a => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${a.date}:</strong> ${a.text}`;
    ul.appendChild(li);
  });

  el.textContent = "";
  el.appendChild(ul);
}

function setYear() {
  const yearEls = document.querySelectorAll("#year");
  yearEls.forEach(el => el.textContent = String(new Date().getFullYear()));
}

renderAnnouncements();
setYear();
