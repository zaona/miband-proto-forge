export interface Point {
  x: number;
  y: number;
}

/**
 * Solve linear equations using Gaussian elimination.
 * Ax = B
 */
function solve(A: number[][], B: number[]): number[] {
  const n = B.length;

  for (let i = 0; i < n; i++) {
    let maxEl = Math.abs(A[i][i]);
    let maxRow = i;

    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxEl) {
        maxEl = Math.abs(A[k][i]);
        maxRow = k;
      }
    }

    for (let k = i; k < n; k++) {
      const tmp = A[maxRow][k];
      A[maxRow][k] = A[i][k];
      A[i][k] = tmp;
    }
    const bTmp = B[maxRow];
    B[maxRow] = B[i];
    B[i] = bTmp;

    for (let k = i + 1; k < n; k++) {
      const c = -A[k][i] / A[i][i];
      for (let j = i; j < n; j++) {
        if (i === j) {
          A[k][j] = 0;
        } else {
          A[k][j] += c * A[i][j];
        }
      }
      B[k] += c * B[i];
    }
  }

  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = B[i] / A[i][i];
    for (let k = i - 1; k >= 0; k--) {
      B[k] -= A[k][i] * x[i];
    }
  }

  return x;
}

/**
 * Build CSS matrix3d for homography:
 * source rect: (0,0) (w,0) (w,h) (0,h)
 * points order: TL, TR, BR, BL
 */
export function getPerspectiveTransform(
  w: number,
  h: number,
  points: Point[],
): string {
  const A: number[][] = [];
  const B: number[] = [];

  const src = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ];

  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i];
    const { x: u, y: v } = points[i];

    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    B.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    B.push(v);
  }

  const [a, b, c, d, e, f, g, hParam] = solve(A, B);

  return `matrix3d(${a}, ${d}, 0, ${g}, ${b}, ${e}, 0, ${hParam}, 0, 0, 1, 0, ${c}, ${f}, 0, 1)`;
}
