(function(){
  function copy(a){ return a.slice(); }

  function makeArrayStep({ phase, message, array, highlights }){
    return {
      kind: "array",
      phase,
      message,
      array: copy(array),
      highlights: highlights || {},
    };
  }

  function minMaxSteps(values){
    const steps = [];
    const a = values.slice();

    function rec(l, r){
      steps.push(makeArrayStep({
        phase: "divide",
        message: `Consider range [${l}, ${r}].`,
        array: a,
        highlights: { activeIndices: [l, r] },
      }));

      if(l === r){
        steps.push(makeArrayStep({
          phase: "conquer",
          message: `Base case: min = max = a[${l}] = ${a[l]}.`,
          array: a,
          highlights: { activeIndices: [l], goodIndices: [l] },
        }));
        return { min: a[l], max: a[l] };
      }

      if(r === l + 1){
        const mn = Math.min(a[l], a[r]);
        const mx = Math.max(a[l], a[r]);
        steps.push(makeArrayStep({
          phase: "conquer",
          message: `Two elements: compare a[${l}] = ${a[l]} and a[${r}] = ${a[r]}.`,
          array: a,
          highlights: { activeIndices: [l, r] },
        }));
        return { min: mn, max: mx };
      }

      const m = Math.floor((l + r) / 2);
      steps.push(makeArrayStep({
        phase: "divide",
        message: `Divide into [${l}, ${m}] and [${m+1}, ${r}].`,
        array: a,
        highlights: { activeIndices: [l, m, m+1, r] },
      }));

      const left = rec(l, m);
      const right = rec(m + 1, r);

      const mn = Math.min(left.min, right.min);
      const mx = Math.max(left.max, right.max);

      steps.push(makeArrayStep({
        phase: "combine",
        message: `Combine: min = min(${left.min}, ${right.min}) = ${mn}, max = max(${left.max}, ${right.max}) = ${mx}.`,
        array: a,
        highlights: { activeIndices: [l, r] },
      }));

      return { min: mn, max: mx };
    }

    const result = rec(0, a.length - 1);
    steps.push(makeArrayStep({
      phase: "combine",
      message: `Done: global min = ${result.min}, global max = ${result.max}.`,
      array: a,
      highlights: {},
    }));
    return steps;
  }

  const algo = {
    id: "minmax",
    name: "Min & Max (Divide and Conquer)",
    vizTitle: "Array bars (Min/Max)",
    explanation:
`We can find min and max using divide-and-conquer:

Divide: split the array into two halves.
Conquer: recursively find (min,max) in each half.
Combine: the overall min is min(left.min, right.min), and overall max is max(left.max, right.max).`,
    recurrence: "T(n) = 2T(n/2) + O(1)",
    complexity: "Time: O(n)  •  Comparisons: about 3n/2 (better than 2n in a simple scan)",
    generateInput(){
      const n = 18;
      return { values: Array.from({ length: n }, () => Math.floor(10 + Math.random() * 90)) };
    },
    getInitialStep(input){
      return { kind: "array", phase: "idle", message: "Initial array.", array: input.values.slice(), highlights: {} };
    },
    getSteps(input){
      return minMaxSteps(input.values);
    },
  };

  window.DC_ALGOS = window.DC_ALGOS || [];
  window.DC_ALGOS.push(algo);
})();

