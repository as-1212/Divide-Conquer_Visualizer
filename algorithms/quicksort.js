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

  function quickSteps(arr){
    const steps = [];

    function partition(l, r){
      const pivot = arr[r];
      steps.push(makeArrayStep({
        phase: "divide",
        message: `Choose pivot = arr[${r}] = ${pivot}. Partition range [${l}, ${r}].`,
        array: arr,
        highlights: { pivotIndex: r, activeIndices: [l, r] },
      }));

      let i = l;
      for(let j = l; j < r; j++){
        steps.push(makeArrayStep({
          phase: "conquer",
          message: `Compare arr[${j}] = ${arr[j]} with pivot ${pivot}.`,
          array: arr,
          highlights: { pivotIndex: r, activeIndices: [j, i] },
        }));

        if(arr[j] < pivot){
          if(i !== j){
            [arr[i], arr[j]] = [arr[j], arr[i]];
            steps.push(makeArrayStep({
              phase: "conquer",
              message: `Swap to move smaller element left (swap indices ${i} and ${j}).`,
              array: arr,
              highlights: { pivotIndex: r, activeIndices: [i, j] },
            }));
          }
          i++;
        }
      }

      [arr[i], arr[r]] = [arr[r], arr[i]];
      steps.push(makeArrayStep({
        phase: "combine",
        message: `Place pivot at its final position (swap indices ${i} and ${r}).`,
        array: arr,
        highlights: { pivotIndex: i, activeIndices: [i] },
      }));
      return i;
    }

    function qs(l, r){
      if(l >= r){
        if(l === r){
          steps.push(makeArrayStep({
            phase: "conquer",
            message: `Base case: single element at index ${l}.`,
            array: arr,
            highlights: { activeIndices: [l] },
          }));
        }
        return;
      }

      steps.push(makeArrayStep({
        phase: "divide",
        message: `Divide: sort subarray range [${l}, ${r}].`,
        array: arr,
        highlights: { activeIndices: [l, r] },
      }));

      const p = partition(l, r);
      qs(l, p - 1);
      qs(p + 1, r);
    }

    qs(0, arr.length - 1);
    steps.push(makeArrayStep({
      phase: "combine",
      message: "Done: array is fully sorted.",
      array: arr,
      highlights: { goodIndices: Array.from({ length: arr.length }, (_, i) => i) },
    }));
    return steps;
  }

  const algo = {
    id: "quicksort",
    name: "Quick Sort",
    vizTitle: "Array bars (Quick Sort)",
    explanation:
`Quick Sort uses divide-and-conquer around a pivot.

Divide: pick a pivot and partition elements into “< pivot” and “≥ pivot”.
Conquer: recursively sort left and right partitions.
Combine: no explicit merge; the pivot ends in its final position after partitioning.`,
    recurrence: "Average: T(n) = T(n/2) + T(n/2) + n  (balanced partitions)",
    complexity: "Average: O(n log n)  •  Worst: O(n²)  •  Space: O(log n) (recursion stack)",
    generateInput(){
      const n = 18;
      return { values: Array.from({ length: n }, () => Math.floor(10 + Math.random() * 90)) };
    },
    getInitialStep(input){
      return { kind: "array", phase: "idle", message: "Initial array.", array: input.values.slice(), highlights: {} };
    },
    getSteps(input){
      const arr = input.values.slice();
      return quickSteps(arr);
    },
  };

  window.DC_ALGOS = window.DC_ALGOS || [];
  window.DC_ALGOS.push(algo);
})();

