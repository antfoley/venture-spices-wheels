const groups = Object.keys(QUESTIONS);
let state = {}; groups.forEach(g=> state[g] = new Array(QUESTIONS[g].length).fill(null));
let currentGroupIndex = 0;

const questionList = document.getElementById('questionList');
const currentGroupTitle = document.getElementById('currentGroupTitle');
const progress = document.getElementById('progress');
const summary = document.getElementById('summary');

function renderGroup(i){
  currentGroupIndex = i;
  const group = groups[i];
  currentGroupTitle.textContent = group;
  questionList.innerHTML = '';
  QUESTIONS[group].forEach((q, idx)=>{
    const div = document.createElement('div');
    div.className = 'bg-slate-700/40 rounded-lg p-2';
    div.innerHTML = `<p class='text-sm mb-2'>${q}</p>`;
    const scale = document.createElement('div');
    scale.className = 'flex gap-1';
    for(let v=1; v<=5; v++){
      const btn = document.createElement('button');
      btn.textContent = v;
      btn.className = `flex-1 py-1 rounded-md text-sm ${state[group][idx]===v ? 'bg-violet-500 text-black font-bold':'bg-slate-600 text-slate-300'}`;
      btn.onclick = ()=>{ state[group][idx]=v; saveState(); renderGroup(currentGroupIndex); updateProgress(); };
      scale.appendChild(btn);
    }
    div.appendChild(scale);
    questionList.appendChild(div);
  });
  updateProgress();
}

function updateProgress(){
  let answered=0,total=0;
  groups.forEach(g=>{ total+=state[g].length; answered+=state[g].filter(Boolean).length });
  progress.textContent = `${answered}/${total} answered`;
}

document.getElementById('prevGroup').onclick = ()=> renderGroup(Math.max(0,currentGroupIndex-1));
document.getElementById('nextGroup').onclick = ()=> renderGroup(Math.min(groups.length-1,currentGroupIndex+1));
document.getElementById('showWheel').onclick = ()=> computeAndDraw();

function saveState(){ localStorage.setItem('spices_state', JSON.stringify(state)); }
function loadState(){ const s=localStorage.getItem('spices_state'); if(s) state=JSON.parse(s); }
loadState(); renderGroup(0);

const canvas=document.getElementById('wheelCanvas');
const ctx=canvas.getContext('2d');

function computeAverages(){ return groups.map(g=> state[g].reduce((a,b)=>a+(b||0),0)/(QUESTIONS[g].length*5)); }

function computeAndDraw(){ const avgs=computeAverages(); drawRadar(avgs); renderSummary(avgs); }

function drawRadar(values){
  const w=canvas.width=360,h=canvas.height=360;const cx=w/2,cy=h/2,radius=w*0.36;ctx.clearRect(0,0,w,h);
  ctx.save();ctx.translate(cx,cy);
  ctx.strokeStyle='rgba(255,255,255,0.1)';for(let r=1;r<=5;r++){ctx.beginPath();ctx.arc(0,0,radius*(r/5),0,Math.PI*2);ctx.stroke();}
  const step=(Math.PI*2)/groups.length;
  groups.forEach((g,i)=>{const ang=-Math.PI/2+i*step;const x=Math.cos(ang)*radius,y=Math.sin(ang)*radius;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle='white';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(g,Math.cos(ang)*(radius+20),Math.sin(ang)*(radius+20));});
  ctx.beginPath();values.forEach((v,i)=>{const ang=-Math.PI/2+i*step;const r=radius*v;const x=Math.cos(ang)*r,y=Math.sin(ang)*r;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.closePath();ctx.fillStyle='rgba(139,92,246,0.3)';ctx.fill();ctx.strokeStyle='rgba(139,92,246,0.9)';ctx.lineWidth=2;ctx.stroke();
  ctx.restore();
}

function renderSummary(avgs){
  summary.innerHTML='';
  groups.forEach((g,i)=>{
    const pill=document.createElement('div');
    pill.className='px-2 py-1 rounded-full bg-slate-700 text-xs';
    pill.textContent=`${g}: ${(avgs[i]*5).toFixed(1)}/5`;
    summary.appendChild(pill);
  });
}

document.getElementById('downloadPNG').onclick=()=>{
  const link=document.createElement('a');link.download='spices-wheel.png';link.href=canvas.toDataURL('image/png');link.click();
};
document.getElementById('screenshotMode').onclick=()=>{document.querySelectorAll('button, #questionList').forEach(el=>el.classList.toggle('hidden'));};

computeAndDraw();