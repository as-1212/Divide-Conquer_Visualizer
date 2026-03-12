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

  function maxCrossing(arr, l, m, r, steps){
    let sum = 0;
    let leftSum = -Infinity;
    let maxLeft = m;
    for(let i=m;i>=l;i--){
      sum += arr[i];
      steps.push(makeArrayStep({
        phase: "combine",
        message: `Crossing: accumulate left from m=${m} to i=${i} (sum=${sum}).`,
        array: arr,
        highlights: { activeIndices: [i, m] },
      }));
      if(sum > leftSum){
        leftSum = sum;
        maxLeft = i;
      }
    }

    sum = 0;
    let rightSum = -Infinity;
    let maxRight = m + 1;
    for(let j=m+1;j<=r;j++){
      sum += arr[j];
      steps.push(makeArrayStep({
        phase: "combine",
        message: `Crossing: accumulate right from m+1=${m+1} to j=${j} (sum=${sum}).`,
        array: arr,
        highlights: { activeIndices: [j, m+1] },
      }));
      if(sum > rightSum){
        rightSum = sum;
        maxRight = j;
      }
    }

    return { sum: leftSum + rightSum, l: maxLeft, r: maxRight };
  }

  function maxSubarraySteps(values){
    const steps = [];
    const arr = values.slice();

    function rec(l, r){
      steps.push(makeArrayStep({
        phase: "divide",
        message: `Solve max-subarray for range [${l}, ${r}].`,
        array: arr,
        highlights: { activeIndices: [l, r] },
      }));

      if(l === r){
        steps.push(makeArrayStep({
          phase: "conquer",
          message: `Base case: single element subarray sum = ${arr[l]} at index ${l}.`,
          array: arr,
          highlights: { activeIndices: [l], goodIndices: [l] },
        }));
        return { sum: arr[l], l, r };
      }

      const m = Math.floor((l + r) / 2);
      steps.push(makeArrayStep({
        phase: "divide",
        message: `Divide at mid=${m}: left [${l}, ${m}], right [${m+1}, ${r}].`,
        array: arr,
        highlights: { activeIndices: [l, m, m+1, r] },
      }));

      const left = rec(l, m);
      const right = rec(m + 1, r);
      const cross = maxCrossing(arr, l, m, r, steps);

      const best = [left, right, cross].reduce((a,b) => (b.sum > a.sum ? b : a));
      steps.push(makeArrayStep({
        phase: "combine",
        message: `Combine: best of left(${left.sum}), right(${right.sum}), crossing(${cross.sum}) is ${best.sum} for [${best.l}, ${best.r}].`,
        array: arr,
        highlights: {
          goodIndices: Array.from({ length: best.r - best.l + 1 }, (_, i) => best.l + i),
          dimIndices: Array.from({ length: arr.length }, (_, i) => i).filter(i => i < best.l || i > best.r),
        },
      }));
      return best;
    }

    const best = rec(0, arr.length - 1);
    steps.push(makeArrayStep({
      phase: "combine",
      message: `Done: maximum subarray sum = ${best.sum} on indices [${best.l}, ${best.r}].`,
      array: arr,
      highlights: {
        goodIndices: Array.from({ length: best.r - best.l + 1 }, (_, i) => best.l + i),
        dimIndices: Array.from({ length: arr.length }, (_, i) => i).filter(i => i < best.l || i > best.r),
      },
    }));
    return steps;
  }

  const algo = {
    id: "maxsubarray",
    name: "Largest Subarray Sum",
    vizTitle: "Array bars (Max Subarray Sum)",
    explanation:
`This is the divide-and-conquer solution to the Maximum Subarray problem.

Divide: split at the midpoint.
Conquer: compute best subarray entirely in the left half and in the right half.
Combine: compute the best subarray that crosses the midpoint, then take the best of the three.`,
    recurrence: "T(n) = 2T(n/2) + O(n)",
    complexity: "Time: O(n log n)  •  Space: O(log n) (recursion stack)",
    generateInput(){
      const n = 18;
      const values = Array.from({ length: n }, () => Math.floor(-15 + Math.random() * 35));
      return { values };
    },
    getInitialStep(input){
      return { kind: "array", phase: "idle", message: "Initial array (may include negatives).", array: input.values.slice(), highlights: {} };
    },
    getSteps(input){
      return maxSubarraySteps(input.values);
    },
  };

  window.DC_ALGOS = window.DC_ALGOS || [];
  window.DC_ALGOS.push(algo);
})();

