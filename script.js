const pages = Array.from(document.querySelectorAll('.page'));
const total = pages.length;
const progressBar = document.getElementById('progressBar');
const pageCount = document.getElementById('pageCount');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let current = 0;
let startY = 0;
let isDragging = false;
let isAnimating = false;

// ⚠️ REPLACE THIS with your real Formspree endpoint
const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

function update() {
  pages.forEach((page, i) => {
    page.style.transform = `translateY(${(i - current) * 100}%)`;
    page.classList.toggle('active', i === current);
  });

  progressBar.style.width = ((current + 1) / total) * 100 + '%';
  pageCount.textContent = `${current + 1} / ${total}`;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === total - 1;
}

function goTo(index) {
  if (index < 0 || index >= total || isAnimating) return;
  isAnimating = true;
  current = index;
  update();
  setTimeout(() => { isAnimating = false; }, 620);
}

function next() { if (current < total - 1) goTo(current + 1); }
function prev() { if (current > 0) goTo(current - 1); }

function onStart(e) {
  if (isAnimating || document.body.classList.contains('outcome-open')) return;
  isDragging = true;
  startY = e.touches ? e.touches[0].clientY : e.clientY;
}

function onEnd(e) {
  if (!isDragging || isAnimating) return;
  isDragging = false;
  const endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
  const diff = startY - endY;
  if (Math.abs(diff) > 50) {
    if (diff > 0) next();
    else prev();
  }
}

const pagesEl = document.getElementById('pages');
pagesEl.addEventListener('touchstart', onStart, { passive: true });
pagesEl.addEventListener('touchend', onEnd, { passive: true });
pagesEl.addEventListener('touchmove', (e) => { if (isDragging) e.preventDefault(); }, { passive: false });
pagesEl.addEventListener('mousedown', onStart);
pagesEl.addEventListener('mouseup', onEnd);
pagesEl.addEventListener('mouseleave', () => { isDragging = false; });

window.addEventListener('keydown', (e) => {
  if (document.body.classList.contains('outcome-open')) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
});

prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);

// ---------- Formspree + Outcomes ----------
function showOutcome(id) {
  document.body.classList.add('outcome-open');
  document.getElementById(id).classList.add('active');
}

function hideOutcomes() {
  document.body.classList.remove('outcome-open');
  document.querySelectorAll('.outcome').forEach(el => el.classList.remove('active'));
}

async function sendAnswer(answer) {
  try {
    await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ answer: answer, page: "This Is Us Letter" })
    });
  } catch (err) {
    console.log("Could not send, but continuing...");
  }
}

document.getElementById('btnYes').addEventListener('click', async () => {
  await sendAnswer("Yes");
  showOutcome('outcomeYes');
});

document.getElementById('btnNo').addEventListener('click', async () => {
  await sendAnswer("No");
  showOutcome('outcomeNo');
});

document.getElementById('btnTime').addEventListener('click', () => {
  showOutcome('outcomeTime');
});

document.getElementById('restartYes').addEventListener('click', () => { hideOutcomes(); goTo(0); });
document.getElementById('restartNo').addEventListener('click', () => { hideOutcomes(); goTo(0); });
document.getElementById('restartTime').addEventListener('click', () => { hideOutcomes(); goTo(0); });

update();