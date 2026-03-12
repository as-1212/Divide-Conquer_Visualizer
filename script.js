const algorithms = (window.DC_ALGOS || []).slice();
if(!algorithms.length){
  // If this happens, scripts did not load (check script tags / paths).
  throw new Error("No algorithms registered. Expected window.DC_ALGOS to be populated.");
}

const els = {
  algorithmSelect: document.getElementById("algorithmSelect"),
  generateBtn: document.getElementById("generateBtn"),
  startBtn: document.getElementById("startBtn"),
  resetBtn: document.getElementById("resetBtn"),
  speed: document.getElementById("speed"),
  speedLabel: document.getElementById("speedLabel"),
  phaseBadge: document.getElementById("phaseBadge"),
  stepText: document.getElementById("stepText"),
  explanation: document.getElementById("explanation"),
  recurrence: document.getElementById("recurrence"),
  complexity: document.getElementById("complexity"),
  vizTitle: document.getElementById("vizTitle"),

  arrayViz: document.getElementById("arrayViz"),
  matrixViz: document.getElementById("matrixViz"),
  matrixA: document.getElementById("matrixA"),
  matrixB: document.getElementById("matrixB"),
  matrixC: document.getElementById("matrixC"),
  canvasWrap: document.getElementById("canvasWrap"),
  canvas: document.getElementById("canvas"),
  canvasLegend: document.getElementById("canvasLegend"),
};

let selected = algorithms[0];
let initialInput = null;
let currentInput = null;

let steps = [];
let stepIndex = 0;
let running = false;
let runToken = 0;

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

function speedMultiplier(){
  return clamp(Number(els.speed.value || 1), 0.25, 2.5);
}

function stepDelayMs(kind){
  const base = kind === "canvas" ? 420 : kind === "matrix" ? 520 : 330;
  return Math.round(base / speedMultiplier());
}

function setPhaseBadge(phase){
  const p = phase || "idle";
  els.phaseBadge.classList.remove("divide", "conquer", "combine");
  if(p === "divide") els.phaseBadge.classList.add("divide");
  if(p === "conquer") els.phaseBadge.classList.add("conquer");
  if(p === "combine") els.phaseBadge.classList.add("combine");
  els.phaseBadge.textContent = p === "idle" ? "Idle" : p[0].toUpperCase() + p.slice(1);
}

function showMode(mode){
  els.arrayViz.classList.toggle("hidden", mode !== "array");
  els.matrixViz.classList.toggle("hidden", mode !== "matrix");
  els.canvasWrap.classList.toggle("hidden", mode !== "canvas");
}

function fillSidePanel(){
  els.explanation.textContent = selected.explanation;
  els.recurrence.textContent = selected.recurrence;
  els.complexity.textContent = selected.complexity;
}

function buildSelect(){
  els.algorithmSelect.innerHTML = "";
  for(const a of algorithms){
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.name;
    els.algorithmSelect.appendChild(opt);
  }
  els.algorithmSelect.value = selected.id;
}

function renderArray(values, highlights = {}){
  const maxV = Math.max(...values, 1);
  els.arrayViz.innerHTML = "";
  values.forEach((v, i) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    const h = Math.max(10, Math.round((v / maxV) * 480));
    bar.style.height = `${h}px`;
    bar.textContent = String(v);

    const active = new Set(highlights.activeIndices || []);
    const dim = highlights.dimIndices && highlights.dimIndices.includes(i);
    const pivot = highlights.pivotIndex === i;
    const good = highlights.goodIndices && highlights.goodIndices.includes(i);
    const bad = highlights.badIndices && highlights.badIndices.includes(i);
    if(dim) bar.classList.add("dim");
    if(active.has(i)) bar.classList.add("active");
    if(pivot) bar.classList.add("pivot");
    if(good) bar.classList.add("good");
    if(bad) bar.classList.add("bad");

    els.arrayViz.appendChild(bar);
  });
}

function renderMatrix(matrix, activeCells = []){
  const n = matrix.length;
  return { n, html: matrix.flatMap((row, r) => row.map((v, c) => ({ v, r, c }))) , activeCells };
}

function drawMatrixInto(el, matrix, active){
  el.innerHTML = "";
  el.style.gridTemplateColumns = `repeat(${matrix.length}, 1fr)`;
  const activeKey = new Set((active || []).map(([r, c]) => `${r},${c}`));
  for(let r=0;r<matrix.length;r++){
    for(let c=0;c<matrix.length;c++){
      const cell = document.createElement("div");
      cell.className = "cell";
      if(activeKey.has(`${r},${c}`)) cell.classList.add("active");
      cell.textContent = String(matrix[r][c]);
      el.appendChild(cell);
    }
  }
}

function clearCanvas(){
  const ctx = els.canvas.getContext("2d");
  ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
}

function drawCanvas(step){
  const ctx = els.canvas.getContext("2d");
  const w = els.canvas.width;
  const h = els.canvas.height;
  ctx.clearRect(0, 0, w, h);

  const pts = step.points || [];
  const lines = step.lines || [];
  const highlight = step.highlight || {};

  // background grid
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  for(let x=40;x<w;x+=40){
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for(let y=40;y<h;y+=40){
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.restore();

  // lines (segments / hull)
  ctx.save();
  ctx.lineWidth = 2;
  for(const ln of lines){
    ctx.strokeStyle = ln.color || "rgba(124,92,255,0.95)";
    ctx.beginPath();
    ctx.moveTo(ln.a.x, ln.a.y);
    ctx.lineTo(ln.b.x, ln.b.y);
    ctx.stroke();
  }
  ctx.restore();

  // closest pair highlight
  if(highlight.pair){
    ctx.save();
    ctx.strokeStyle = "rgba(255,183,3,0.95)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(highlight.pair[0].x, highlight.pair[0].y);
    ctx.lineTo(highlight.pair[1].x, highlight.pair[1].y);
    ctx.stroke();
    ctx.restore();
  }

  // points
  const activeIdx = new Set(highlight.activeIndices || []);
  const leftIdx = new Set(highlight.leftIndices || []);
  const rightIdx = new Set(highlight.rightIndices || []);
  pts.forEach((p, i) => {
    const isActive = activeIdx.has(i);
    const isLeft = leftIdx.has(i);
    const isRight = rightIdx.has(i);
    const r = isActive ? 7 : 5;
    ctx.beginPath();
    ctx.fillStyle = isActive ? "rgba(255,77,109,0.95)"
      : isLeft ? "rgba(56,176,0,0.95)"
      : isRight ? "rgba(90,166,255,0.95)"
      : "rgba(255,255,255,0.85)";
    ctx.arc(p.x, p.y, r, 0, Math.PI*2);
    ctx.fill();
  });

  els.canvasLegend.textContent = step.legend || "";
}

function renderStep(step){
  setPhaseBadge(step.phase || "idle");
  els.stepText.textContent = step.message || "";

  if(step.kind === "array"){
    showMode("array");
    renderArray(step.array, step.highlights || {});
    return;
  }
  if(step.kind === "matrix"){
    showMode("matrix");
    drawMatrixInto(els.matrixA, step.A, step.activeA);
    drawMatrixInto(els.matrixB, step.B, step.activeB);
    drawMatrixInto(els.matrixC, step.C, step.activeC);
    return;
  }
  if(step.kind === "canvas"){
    showMode("canvas");
    drawCanvas(step);
    return;
  }
}

function setInput(newInput){
  // structuredClone isn't supported in some older browsers; fallback to JSON for simple data.
  const clone = (x) => (typeof structuredClone === "function" ? structuredClone(x) : JSON.parse(JSON.stringify(x)));
  initialInput = clone(newInput);
  currentInput = clone(newInput);

  fillSidePanel();
  steps = selected.getSteps(currentInput);
  stepIndex = 0;
  setPhaseBadge("idle");
  els.stepText.textContent = "Ready. Press Start to animate steps.";
  els.vizTitle.textContent = selected.vizTitle || "Visualization";

  // show initial render
  const first = steps[0] || selected.getInitialStep(currentInput);
  if(first) renderStep(first);
}

async function runAnimation(){
  if(running) return;
  running = true;
  const myToken = ++runToken;
  els.startBtn.disabled = true;
  els.generateBtn.disabled = true;
  els.algorithmSelect.disabled = true;

  try{
    while(myToken === runToken && stepIndex < steps.length){
      const step = steps[stepIndex];
      renderStep(step);
      stepIndex += 1;
      await sleep(stepDelayMs(step.kind));
    }
  } finally {
    if(myToken === runToken){
      running = false;
      els.startBtn.disabled = false;
      els.generateBtn.disabled = false;
      els.algorithmSelect.disabled = false;
    }
  }
}

function reset(){
  runToken += 1; // cancels any running loop
  running = false;
  els.startBtn.disabled = false;
  els.generateBtn.disabled = false;
  els.algorithmSelect.disabled = false;

  if(initialInput){
    setInput(initialInput);
  } else {
    setInput(selected.generateInput());
  }
}

function generate(){
  reset();
}

function onAlgorithmChange(){
  const id = els.algorithmSelect.value;
  selected = algorithms.find(a => a.id === id) || algorithms[0];
  setInput(selected.generateInput());
}

function init(){
  buildSelect();
  els.speed.addEventListener("input", () => {
    els.speedLabel.textContent = `${speedMultiplier().toFixed(2)}×`;
  });
  els.speed.dispatchEvent(new Event("input"));

  els.algorithmSelect.addEventListener("change", onAlgorithmChange);
  els.generateBtn.addEventListener("click", () => setInput(selected.generateInput()));
  els.startBtn.addEventListener("click", runAnimation);
  els.resetBtn.addEventListener("click", reset);

  setInput(selected.generateInput());
  clearCanvas();
}

init();