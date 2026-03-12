 (function(){
function orient(a, b, c){
  // cross product (b-a) x (c-a)
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function distLine(a, b, p){
  // proportional to area; no sqrt needed for argmax
  return Math.abs(orient(a, b, p));
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

function quickHullSteps(points){
  const pts = points.map(p => ({ x: p.x, y: p.y }));
  const steps = [];

  steps.push(makeStep({
    phase: "idle",
    message: "Initial points. We’ll compute the convex hull using QuickHull (divide and conquer).",
    points: pts,
    legend: "White: points • Purple: current hull edges • Red: active point/edge",
  }));

  // find extremes
  let minI = 0, maxI = 0;
  for(let i=1;i<pts.length;i++){
    if(pts[i].x < pts[minI].x) minI = i;
    if(pts[i].x > pts[maxI].x) maxI = i;
  }
  const A = minI, B = maxI;

  const hullEdges = [];

  function addEdge(i, j){
    hullEdges.push([i, j]);
  }

  function currentLines(extra){
    const lines = hullEdges.map(([i, j]) => ({
      a: pts[i],
      b: pts[j],
      color: "rgba(124,92,255,0.95)",
    }));
    if(extra) lines.push(extra);
    return lines;
  }

  const leftSet = [];
  const rightSet = [];
  for(let i=0;i<pts.length;i++){
    if(i === A || i === B) continue;
    const o = orient(pts[A], pts[B], pts[i]);
    if(o > 0) leftSet.push(i);
    else if(o < 0) rightSet.push(i);
  }

  steps.push(makeStep({
    phase: "divide",
    message: `Divide: pick extreme points A=${A} (leftmost) and B=${B} (rightmost), split points into two sets.`,
    points: pts,
    highlight: { activeIndices: [A, B], leftIndices: leftSet, rightIndices: rightSet },
    lines: [{
      a: pts[A],
      b: pts[B],
      color: "rgba(255,183,3,0.95)",
    }],
    legend: "Green points are above AB; blue points are below AB.",
  }));

  function buildHull(iA, iB, set, side){
    // side: +1 means points to left of AB, -1 means to right
    if(set.length === 0){
      addEdge(iA, iB);
      steps.push(makeStep({
        phase: "combine",
        message: `Combine: edge (${iA} → ${iB}) is part of the hull (no points outside it).`,
        points: pts,
        highlight: { activeIndices: [iA, iB] },
        lines: currentLines({ a: pts[iA], b: pts[iB], color: "rgba(255,183,3,0.95)" }),
      }));
      return;
    }

    // find farthest point from line AB
    let far = set[0];
    let best = -1;
    for(const i of set){
      const d = distLine(pts[iA], pts[iB], pts[i]);
      if(d > best){ best = d; far = i; }
    }

    steps.push(makeStep({
      phase: "conquer",
      message: `Conquer: pick farthest point ${far} from edge (${iA} → ${iB}).`,
      points: pts,
      highlight: { activeIndices: [iA, iB, far] },
      lines: currentLines({ a: pts[iA], b: pts[iB], color: "rgba(255,77,109,0.95)" }),
    }));

    // split set into points outside triangles
    const set1 = [];
    const set2 = [];
    for(const i of set){
      if(i === far) continue;
      const o1 = orient(pts[iA], pts[far], pts[i]);
      const o2 = orient(pts[far], pts[iB], pts[i]);
      if(side * o1 > 0) set1.push(i);
      else if(side * o2 > 0) set2.push(i);
    }

    steps.push(makeStep({
      phase: "divide",
      message: `Divide: split remaining points into two subproblems around point ${far}.`,
      points: pts,
      highlight: { activeIndices: [far], leftIndices: set1, rightIndices: set2 },
      lines: [
        ...currentLines(),
        { a: pts[iA], b: pts[far], color: "rgba(255,183,3,0.95)" },
        { a: pts[far], b: pts[iB], color: "rgba(255,183,3,0.95)" },
      ],
      legend: "We recurse on edges (A → far) and (far → B) with their outside point sets.",
    }));

    buildHull(iA, far, set1, side);
    buildHull(far, iB, set2, side);
  }

  // Build upper and lower hull
  buildHull(A, B, leftSet, +1);
  buildHull(B, A, rightSet, +1); // reverse direction for lower side

  steps.push(makeStep({
    phase: "combine",
    message: "Done: hull edges shown in purple (convex hull boundary).",
    points: pts,
    lines: currentLines(),
    legend: "QuickHull is divide-and-conquer: split by an edge, pick farthest point, recurse on two subproblems.",
  }));

  return steps;
}

const algo = {
  id: "convexhull",
  name: "Convex Hull (QuickHull)",
  vizTitle: "Canvas (Convex Hull)",
  explanation:
`QuickHull is a divide-and-conquer convex hull algorithm.

Divide: choose the leftmost and rightmost points, forming a baseline AB. Split points into those above and below AB.
Conquer: for each side, pick the farthest point from AB; this point must be on the hull.
        Then the problem splits into two smaller subproblems on edges (A → far) and (far → B).
Combine: the union of all discovered edges forms the convex hull boundary.`,
  recurrence: "Average: roughly T(n) ≈ T(k) + T(n-k) + O(n) (depends on point distribution)",
  complexity: "Average: O(n log n)  •  Worst: O(n²) (adversarial distributions)",
  generateInput(){
    const n = 30;
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
    return quickHullSteps(input.points);
  },
};

window.DC_ALGOS = window.DC_ALGOS || [];
window.DC_ALGOS.push(algo);
})();
