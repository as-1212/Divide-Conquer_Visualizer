 (function(){
function dist2(a, b){
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx*dx + dy*dy;
}

function makeStep({ phase, message, points, highlight, lines, legend }){
  return {
    kind: "canvas",
    phase,
    message,
    points,
    highlight: highlight || {},
    lines: lines || [],
    legend: legend || "",
  };
}

function closestPairSteps(points){
  const pts = points.map(p => ({ x: p.x, y: p.y }));
  const idx = pts.map((_, i) => i);
  idx.sort((i, j) => pts[i].x - pts[j].x || pts[i].y - pts[j].y);

  const steps = [];
  steps.push(makeStep({
    phase: "idle",
    message: "Initial points. We’ll find the closest pair using divide and conquer.",
    points: pts,
    legend: "White: points • Green: left half • Blue: right half • Yellow: best pair so far",
  }));

  function brute(indices){
    let best = { d2: Infinity, i: -1, j: -1 };
    for(let a=0;a<indices.length;a++){
      for(let b=a+1;b<indices.length;b++){
        const i = indices[a], j = indices[b];
        const d = dist2(pts[i], pts[j]);
        steps.push(makeStep({
          phase: "conquer",
          message: `Brute force compare points ${i} and ${j}.`,
          points: pts,
          highlight: { activeIndices: [i, j], pair: [pts[i], pts[j]] },
        }));
        if(d < best.d2) best = { d2: d, i, j };
      }
    }
    return best;
  }

  function rec(indices){
    if(indices.length <= 3){
      return brute(indices);
    }

    const mid = Math.floor(indices.length / 2);
    const left = indices.slice(0, mid);
    const right = indices.slice(mid);
    const midX = pts[indices[mid]].x;

    steps.push(makeStep({
      phase: "divide",
      message: `Divide by x: left (${left.length} pts) and right (${right.length} pts).`,
      points: pts,
      highlight: {
        leftIndices: left,
        rightIndices: right,
      },
      lines: [{
        a: { x: midX, y: 20 },
        b: { x: midX, y: 500 },
        color: "rgba(255,255,255,0.45)",
      }],
      legend: "Vertical line is the divide boundary.",
    }));

    const bestL = rec(left);
    const bestR = rec(right);
    let best = bestL.d2 <= bestR.d2 ? bestL : bestR;

    steps.push(makeStep({
      phase: "combine",
      message: `Combine: current best distance² = ${best.d2.toFixed(2)} from pair (${best.i}, ${best.j}).`,
      points: pts,
      highlight: { pair: [pts[best.i], pts[best.j]] },
    }));

    // strip within sqrt(best.d2) of midX
    const strip = indices.filter(i => (pts[i].x - midX) * (pts[i].x - midX) < best.d2);
    strip.sort((i, j) => pts[i].y - pts[j].y);

    steps.push(makeStep({
      phase: "combine",
      message: `Check the strip: points within √d of the boundary (strip size = ${strip.length}).`,
      points: pts,
      highlight: { activeIndices: strip },
      lines: [{
        a: { x: midX, y: 20 },
        b: { x: midX, y: 500 },
        color: "rgba(255,255,255,0.45)",
      }],
      legend: "In the strip, we only need a few comparisons per point (by y-order).",
    }));

    for(let a=0;a<strip.length;a++){
      for(let b=a+1;b<strip.length && (pts[strip[b]].y - pts[strip[a]].y) * (pts[strip[b]].y - pts[strip[a]].y) < best.d2; b++){
        const i = strip[a], j = strip[b];
        const d = dist2(pts[i], pts[j]);
        steps.push(makeStep({
          phase: "combine",
          message: `Strip compare: points ${i} and ${j}.`,
          points: pts,
          highlight: { activeIndices: [i, j], pair: [pts[i], pts[j]] },
        }));
        if(d < best.d2) best = { d2: d, i, j };
      }
    }

    steps.push(makeStep({
      phase: "combine",
      message: `After strip: best pair is (${best.i}, ${best.j}) with distance = ${Math.sqrt(best.d2).toFixed(2)}.`,
      points: pts,
      highlight: { pair: [pts[best.i], pts[best.j]] },
    }));

    return best;
  }

  const best = rec(idx);
  steps.push(makeStep({
    phase: "combine",
    message: `Done: closest pair is (${best.i}, ${best.j}) with distance = ${Math.sqrt(best.d2).toFixed(2)}.`,
    points: pts,
    highlight: { pair: [pts[best.i], pts[best.j]] },
    legend: "Yellow segment is the closest pair.",
  }));

  return steps;
}

const algo = {
  id: "closestpair",
  name: "Closest Pair of Points",
  vizTitle: "Canvas (Closest Pair)",
  explanation:
`Closest Pair (2D) via divide-and-conquer:

Divide: sort by x and split into left/right halves.
Conquer: recursively find closest pair in each half.
Combine: let d be the best distance so far. Only points within d of the boundary can beat it.
        Sort that “strip” by y and compare only nearby neighbors.`,
  recurrence: "T(n) = 2T(n/2) + O(n) (after sorting)",
  complexity: "Time: O(n log n)  •  Space: O(n)",
  generateInput(){
    const n = 26;
    const pad = 40;
    const w = 920, h = 520;
    const points = Array.from({ length: n }, () => ({
      x: Math.floor(pad + Math.random() * (w - 2*pad)),
      y: Math.floor(pad + Math.random() * (h - 2*pad)),
    }));
    return { points };
  },
  getInitialStep(input){
    return {
      kind: "canvas",
      phase: "idle",
      message: "Initial points.",
      points: input.points,
      legend: "White: points",
    };
  },
  getSteps(input){
    return closestPairSteps(input.points);
  },
};

window.DC_ALGOS = window.DC_ALGOS || [];
window.DC_ALGOS.push(algo);
})();
