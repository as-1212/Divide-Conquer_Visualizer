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

  function mergeSteps(arr){
    const steps = [];

    function mergeSort(l, r){
      if(l >= r){
        steps.push(makeArrayStep({
          phase: "conquer",
          message: `Base case: single element at index ${l}.`,
          array: arr,
          highlights: { activeIndices: [l] },
        }));
        return;
      }

      const m = Math.floor((l + r) / 2);
      steps.push(makeArrayStep({
        phase: "divide",
        message: `Divide: split range [${l}, ${r}] into [${l}, ${m}] and [${m+1}, ${r}].`,
        array: arr,
        highlights: { activeIndices: [l, m, m+1, r] },
      }));

      mergeSort(l, m);
      mergeSort(m + 1, r);

      steps.push(makeArrayStep({
        phase: "combine",
        message: `Combine: merge two sorted halves [${l}, ${m}] and [${m+1}, ${r}].`,
        array: arr,
        highlights: { activeIndices: Array.from({ length: r - l + 1 }, (_, i) => l + i) },
      }));

      const left = arr.slice(l, m + 1);
      const right = arr.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;

      while(i < left.length && j < right.length){
        if(left[i] <= right[j]) arr[k] = left[i++];
        else arr[k] = right[j++];

        steps.push(makeArrayStep({
          phase: "combine",
          message: `Write merged value at index ${k}.`,
          array: arr,
          highlights: { activeIndices: [k] },
        }));
        k++;
      }

      while(i < left.length){
        arr[k] = left[i++];
        steps.push(makeArrayStep({
          phase: "combine",
          message: `Left remainder: write at index ${k}.`,
          array: arr,
          highlights: { activeIndices: [k] },
        }));
        k++;
      }
      while(j < right.length){
        arr[k] = right[j++];
        steps.push(makeArrayStep({
          phase: "combine",
          message: `Right remainder: write at index ${k}.`,
          array: arr,
          highlights: { activeIndices: [k] },
        }));
        k++;
      }
    }

    mergeSort(0, arr.length - 1);
    steps.push(makeArrayStep({
      phase: "combine",
      message: "Done: array is fully sorted.",
      array: arr,
      highlights: { goodIndices: Array.from({ length: arr.length }, (_, i) => i) },
    }));
    return steps;
  }

  const algo = {
    id: "mergesort",
    name: "Merge Sort",
    vizTitle: "Array bars (Merge Sort)",
    explanation:
`Merge Sort is a classic divide-and-conquer sorting algorithm.

Divide: split the array into two halves.
Conquer: recursively sort each half.
Combine: merge the two sorted halves into one sorted array.`,
    recurrence: "T(n) = 2T(n/2) + n",
    complexity: "Time: O(n log n)  •  Space: O(n) (extra merge arrays)",
    generateInput(){
      const n = 18;
      return { values: Array.from({ length: n }, () => Math.floor(10 + Math.random() * 90)) };
    },
    getInitialStep(input){
      return { kind: "array", phase: "idle", message: "Initial array.", array: input.values.slice(), highlights: {} };
    },
    getSteps(input){
      const arr = input.values.slice();
      return mergeSteps(arr);
    },
  };

  window.DC_ALGOS = window.DC_ALGOS || [];
  window.DC_ALGOS.push(algo);
})();

