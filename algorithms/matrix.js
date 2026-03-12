 (function(){
function randInt(a, b){ return Math.floor(a + Math.random() * (b - a + 1)); }

function zero(n){
  return Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
}

function add(A, B){
  const n = A.length;
  const C = zero(n);
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) C[i][j] = A[i][j] + B[i][j];
  return C;
}

function split(A){
  const n = A.length;
  const m = n / 2;
  const A11 = zero(m), A12 = zero(m), A21 = zero(m), A22 = zero(m);
  for(let i=0;i<m;i++){
    for(let j=0;j<m;j++){
      A11[i][j] = A[i][j];
      A12[i][j] = A[i][j+m];
      A21[i][j] = A[i+m][j];
      A22[i][j] = A[i+m][j+m];
    }
  }
  return { A11, A12, A21, A22 };
}

function join(C11, C12, C21, C22){
  const m = C11.length;
  const n = m * 2;
  const C = zero(n);
  for(let i=0;i<m;i++){
    for(let j=0;j<m;j++){
      C[i][j] = C11[i][j];
      C[i][j+m] = C12[i][j];
      C[i+m][j] = C21[i][j];
      C[i+m][j+m] = C22[i][j];
    }
  }
  return C;
}

function dcMultiply(A, B, steps){
  const n = A.length;
  if(n === 1){
    const C = [[A[0][0] * B[0][0]]];
    steps.push({
      kind: "matrix",
      phase: "conquer",
      message: `Base case 1×1: ${A[0][0]} × ${B[0][0]} = ${C[0][0]}.`,
      A, B, C,
      activeA: [[0,0]],
      activeB: [[0,0]],
      activeC: [[0,0]],
    });
    return C;
  }

  steps.push({
    kind: "matrix",
    phase: "divide",
    message: `Divide: split matrices into 4 blocks of size ${n/2}×${n/2}.`,
    A, B, C: zero(n),
    activeA: [],
    activeB: [],
    activeC: [],
  });

  const { A11, A12, A21, A22 } = split(A);
  const { A11: B11, A12: B12, A21: B21, A22: B22 } = split(B);

  steps.push({
    kind: "matrix",
    phase: "conquer",
    message: `Conquer: recursively compute C11, C12, C21, C22 using 8 sub-multiplications.`,
    A, B, C: zero(n),
  });

  // C11 = A11B11 + A12B21
  const M1 = dcMultiply(A11, B11, steps);
  const M2 = dcMultiply(A12, B21, steps);
  const C11 = add(M1, M2);

  // C12 = A11B12 + A12B22
  const M3 = dcMultiply(A11, B12, steps);
  const M4 = dcMultiply(A12, B22, steps);
  const C12 = add(M3, M4);

  // C21 = A21B11 + A22B21
  const M5 = dcMultiply(A21, B11, steps);
  const M6 = dcMultiply(A22, B21, steps);
  const C21 = add(M5, M6);

  // C22 = A21B12 + A22B22
  const M7 = dcMultiply(A21, B12, steps);
  const M8 = dcMultiply(A22, B22, steps);
  const C22 = add(M7, M8);

  const C = join(C11, C12, C21, C22);
  steps.push({
    kind: "matrix",
    phase: "combine",
    message: `Combine: assemble 4 blocks into the final ${n}×${n} result matrix C.`,
    A, B, C,
  });
  return C;
}

function normalizeTo4x4(M){
  // renderer expects square; we keep it 4×4 for consistent layout
  return M;
}

const algo = {
  id: "matrix",
  name: "Matrix Multiplication (D&C)",
  vizTitle: "Matrices (Divide and Conquer)",
  explanation:
`Divide-and-conquer matrix multiplication splits A and B into 4 quadrants.

Divide: A → (A11, A12, A21, A22), B → (B11, B12, B21, B22)
Conquer: compute each C block recursively.
Combine: C is assembled from (C11, C12, C21, C22).

This approach mirrors the standard block-matrix formula, but uses recursion.`,
  recurrence: "T(n) = 8T(n/2) + O(n²)",
  complexity: "Time: O(n³)  •  Space: O(n²) (for intermediate matrices)",
  generateInput(){
    const n = 4; // keep small so steps are readable
    const A = Array.from({ length: n }, () => Array.from({ length: n }, () => randInt(-3, 6)));
    const B = Array.from({ length: n }, () => Array.from({ length: n }, () => randInt(-3, 6)));
    return { A, B };
  },
  getInitialStep(input){
    const A = normalizeTo4x4(input.A);
    const B = normalizeTo4x4(input.B);
    return { kind: "matrix", phase: "idle", message: "Initial matrices A and B.", A, B, C: zero(A.length) };
  },
  getSteps(input){
    const A = normalizeTo4x4(input.A);
    const B = normalizeTo4x4(input.B);
    const steps = [ { kind: "matrix", phase: "idle", message: "Initial matrices A and B.", A, B, C: zero(A.length) } ];
    const C = dcMultiply(A, B, steps);
    steps.push({ kind: "matrix", phase: "combine", message: "Done: product matrix C = A × B.", A, B, C });
    return steps;
  },
};

window.DC_ALGOS = window.DC_ALGOS || [];
window.DC_ALGOS.push(algo);
})();
