const groups = Object.keys(QUESTIONS);
let state = {}; 
groups.forEach(g => state[g] = new Array(QUESTIONS[g].length).fill(null));
let currentGroupIndex = 0;

const questionList = document.getElementById('questionList');
const currentGroupTitle = document.getElementById('currentGroupTitle');
const progress = document.getElementById('progress');
const summary = document.getElementById('summary');

function renderGroup(i) {
  currentGroupIndex = i;
  const group = groups[i];
  currentGroupTitle.textContent = group;
  questionList.innerHTML = '';
  QUESTIONS[group].forEach((q, idx) => {
    const div = document.createElement('div');
    div.className = 'bg-slate-700/40 rounded-lg p-2';
    div.innerHTML = `<p class='text-sm mb-2'>${q}</p>`;
    const scale = document.createElement('div');
    scale.className = 'flex gap-1';
    for (let v = 1; v <= 5; v++) {
      const btn = document.createElement('button');
      btn.textContent = v;
      btn.className = `flex-1 py-1 rounded-md text-sm ${state[group][idx] === v ? 'bg-violet-500 text-black font-bold' : 'bg-slate-600 text-slate-300'}`;
      btn.onclick = () => { 
        state[group][idx] = v; 
        saveState(); 
        renderGroup(currentGroupIndex); 
        updateProgress(); 
      };
      scale.appendChild(btn);
    }
    div.appendChild(scale);
    questionList.appendChild(div);
  });
  updateProgress();
}

function updateProgress() {
  let answered = 0, total = 0;
  groups.forEach(g => { 
    total += state[g].length; 
    answered += state[g].filter(Boolean).length; 
  });
  progress.textContent = `${answered}/${total} answered`;
}

document.getElementById('prevGroup').onclick = () => renderGroup(Math.max(0, currentGroupIndex - 1));
document.getElementById('nextGroup').onclick = () => renderGroup(Math.min(groups.length - 1, currentGroupIndex + 1));
document.getElementById('showWheel').onclick = () => computeAndDraw();

function saveState() { 
  localStorage.setItem('spices_state', JSON.stringify(state)); 
}
function loadState() { 
  const s = localStorage.getItem('spices_state'); 
  if (s) state = JSON.parse(s); 
}
loadState(); 
renderGroup(0);

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');

function computeAverages() { 
  return groups.map(g => state[g].reduce((a, b) => a + (b || 0), 0) / (QUESTIONS[g].length * 5)); 
}

function computeAndDraw() { 
  const avgs = computeAverages(); 
  drawRadar(avgs); 
  renderSummary(avgs); 
}

function drawRadar(values) {
  const w = canvas.width = 360;
  const h = canvas.height = 360;
  const cx = w / 2;
  const cy = h / 2;
  const radius = w * 0.36;
  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.translate(cx, cy);

  // Define group colors
  const groupColors = {
    Social: 'red',
    Physical: 'green',
    Intellectual: 'blue',
    Character: 'gray',
    Emotional: 'purple',
    Spiritual: 'orange',
  };

  // Calculate total number of questions
  const totalQuestions = groups.reduce((sum, group) => sum + QUESTIONS[group].length, 0);
  const step = (Math.PI * 2) / totalQuestions;

  // Draw background grid
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  for (let r = 1; r <= 5; r++) {
    ctx.beginPath();
    ctx.arc(0, 0, radius * (r / 5), 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw radar shape with group-specific colors
  let questionIndex = 0;
  groups.forEach((group) => {
    QUESTIONS[group].forEach((_, questionIdx) => {
      const angle1 = -Math.PI / 2 + questionIndex * step;
      const value1 = state[group][questionIdx] ? state[group][questionIdx] / 5 : 0;
      const x1 = Math.cos(angle1) * radius * value1;
      const y1 = Math.sin(angle1) * radius * value1;

      const nextQuestionIndex = (questionIndex + 1) % totalQuestions;
      const nextGroup = groups.find((g, idx) => {
        const questionCount = QUESTIONS[g].length;
        return nextQuestionIndex < questionCount + groups.slice(0, idx).reduce((sum, g) => sum + QUESTIONS[g].length, 0);
      });
      const nextQuestionIdx = nextQuestionIndex - groups.slice(0, groups.indexOf(nextGroup)).reduce((sum, g) => sum + QUESTIONS[g].length, 0);
      const angle2 = -Math.PI / 2 + nextQuestionIndex * step;
      const value2 = state[nextGroup][nextQuestionIdx] ? state[nextGroup][nextQuestionIdx] / 5 : 0;
      const x2 = Math.cos(angle2) * radius * value2;
      const y2 = Math.sin(angle2) * radius * value2;

      // Draw the line segment
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = groupColors[group];
      ctx.lineWidth = 2;
      ctx.stroke();

      questionIndex++;
    });
  });

  ctx.restore();
}

function renderSummary(avgs) {
  summary.innerHTML = '';
  groups.forEach((g, i) => {
    const totalQuestions = QUESTIONS[g].length;
    const totalScore = state[g].reduce((a, b) => a + (b || 0), 0); // Calculate total score for the group
    const maxScore = totalQuestions * 5; // Maximum possible score for the group
    const percentage = ((totalScore / maxScore) * 100).toFixed(1); // Calculate percentage and round to 1 decimal place
    const pill = document.createElement('div');
    pill.className = 'px-2 py-1 rounded-full bg-slate-700 text-xs';
    pill.textContent = `${g}: ${percentage}%`; // Display percentage
    summary.appendChild(pill);
  });
}

document.getElementById('downloadPNG').onclick = () => {
  const link = document.createElement('a');
  link.download = 'spices-wheel.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
};
document.getElementById('screenshotMode').onclick = () => {
  document.querySelectorAll('button, #questionList').forEach(el => el.classList.toggle('hidden'));
};

computeAndDraw();