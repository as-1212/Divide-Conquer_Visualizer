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
function sub(A, B){
  const n = A.length;
  const C = zero(n);
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) C[i][j] = A[i][j] - B[i][j];
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

function strassenMultiply(A, B, steps){
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
    message: `Divide: split into quadrants (Strassen).`,
    A, B, C: zero(n),
  });

  const { A11, A12, A21, A22 } = split(A);
  const { A11: B11, A12: B12, A21: B21, A22: B22 } = split(B);

  steps.push({
    kind: "matrix",
    phase: "conquer",
    message: `Conquer: compute 7 products (P1..P7) instead of 8.`,
    A, B, C: zero(n),
  });

  // Strassen's 7 products
  const P1 = strassenMultiply(A11, sub(B12, B22), steps);
  const P2 = strassenMultiply(add(A11, A12), B22, steps);
  const P3 = strassenMultiply(add(A21, A22), B11, steps);
  const P4 = strassenMultiply(A22, sub(B21, B11), steps);
  const P5 = strassenMultiply(add(A11, A22), add(B11, B22), steps);
  const P6 = strassenMultiply(sub(A12, A22), add(B21, B22), steps);
  const P7 = strassenMultiply(sub(A11, A21), add(B11, B12), steps);

  // Combine into C blocks
  const C11 = add(sub(add(P5, P4), P2), P6);
  const C12 = add(P1, P2);
  const C21 = add(P3, P4);
  const C22 = sub(sub(add(P5, P1), P3), P7);

  const C = join(C11, C12, C21, C22);
  steps.push({
    kind: "matrix",
    phase: "combine",
    message: `Combine: build C from quadrants using P1..P7.`,
    A, B, C,
  });
  return C;
}

const algo = {
  id: "strassen",
  name: "Strassen Matrix Multiplication",
  vizTitle: "Matrices (Strassen)",
  explanation:
`Strassen improves divide-and-conquer matrix multiplication by reducing recursive multiplications from 8 to 7.

Divide: split A and B into 4 quadrants.
Conquer: compute 7 cleverly chosen products (P1..P7).
Combine: form C11..C22 from these products using additions/subtractions.

This reduces the exponent from 3 to about 2.807.`,
  recurrence: "T(n) = 7T(n/2) + O(n²)",
  complexity: "Time: O(n^{log2(7)}) ≈ O(n^{2.807})  •  Space: O(n²) (more additions/intermediates)",
  generateInput(){
    const n = 4;
    const A = Array.from({ length: n }, () => Array.from({ length: n }, () => randInt(-3, 6)));
    const B = Array.from({ length: n }, () => Array.from({ length: n }, () => randInt(-3, 6)));
    return { A, B };
  },
  getInitialStep(input){
    const n = input.A.length;
    return { kind: "matrix", phase: "idle", message: "Initial matrices A and B.", A: input.A, B: input.B, C: zero(n) };
  },
  getSteps(input){
    const steps = [ { kind: "matrix", phase: "idle", message: "Initial matrices A and B.", A: input.A, B: input.B, C: zero(input.A.length) } ];
    const C = strassenMultiply(input.A, input.B, steps);
    steps.push({ kind: "matrix", phase: "combine", message: "Done: product matrix C = A × B (Strassen).", A: input.A, B: input.B, C });
    return steps;
  },
};

window.DC_ALGOS = window.DC_ALGOS || [];
window.DC_ALGOS.push(algo);
})();
