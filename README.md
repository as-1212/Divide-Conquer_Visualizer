# Divide and Conquer Algorithm Visualizer

A student-friendly web project that **visualizes divide-and-conquer algorithms** with:
- step-by-step animations
- clear **Divide → Conquer → Combine** labeling
- recurrence relations and time complexity analysis
- array visualizations (colored bars) and geometry visualizations (canvas)

## Algorithms implemented

1. Merge Sort
2. Quick Sort
3. Min & Max (Divide and Conquer)
4. Largest Subarray Sum (Divide and Conquer)
5. Matrix Multiplication (Divide and Conquer / block recursion)
6. Strassen Matrix Multiplication
7. Closest Pair of Points
8. Convex Hull (QuickHull)

## Divide, Conquer, Combine (what you’ll see)

- **Divide**: split the input into smaller subproblems (halves, partitions, quadrants, subsets, etc.).
- **Conquer**: solve subproblems recursively (base cases become obvious and easy).
- **Combine**: merge / assemble results into the final answer (merge arrays, assemble matrix blocks, update best pair/hull edges).

The UI shows the current phase as a badge and explains each step in the side panel.

## Time complexity table (high-level)

| Algorithm | Recurrence (typical) | Time Complexity |
|---|---|---|
| Merge Sort | \(T(n)=2T(n/2)+n\) | \(O(n\log n)\) |
| Quick Sort | balanced: \(T(n)=2T(n/2)+n\) | avg \(O(n\log n)\), worst \(O(n^2)\) |
| Min & Max (D&C) | \(T(n)=2T(n/2)+O(1)\) | \(O(n)\) |
| Max Subarray (D&C) | \(T(n)=2T(n/2)+O(n)\) | \(O(n\log n)\) |
| Matrix Mult (D&C) | \(T(n)=8T(n/2)+O(n^2)\) | \(O(n^3)\) |
| Strassen | \(T(n)=7T(n/2)+O(n^2)\) | \(O(n^{\log_2 7})\approx O(n^{2.807})\) |
| Closest Pair | \(T(n)=2T(n/2)+O(n)\) | \(O(n\log n)\) |
| Convex Hull (QuickHull) | depends on distribution | avg \(O(n\log n)\), worst \(O(n^2)\) |

## How to run

### Option A (simplest)
1. Download or clone the repository
2. Open `index.html` in your browser

### Option B (recommended if your browser blocks local modules)
Because this project uses ES modules (`<script type="module">`), some browsers may restrict loading from `file://`.
Run a local server instead:

- **VS Code / Cursor**: install “Live Server” and click “Go Live”
- Or Python:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Project structure

```
divide-conquer-visualizer
├── index.html
├── style.css
├── script.js
├── algorithms
│   ├── mergesort.js
│   ├── quicksort.js
│   ├── minmax.js
│   ├── maxsubarray.js
│   ├── matrix.js
│   ├── strassen.js
│   ├── closestpair.js
│   └── convexhull.js
└── README.md
```