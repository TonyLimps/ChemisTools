import {BalanceError} from "./Equation.ts";

/* ==================== BigInt 有理数工具 ==================== */

export function gcdBigInt(a: bigint, b: bigint): bigint {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b !== 0n) {
        const t = a % b;
        a = b;
        b = t;
    }
    return a;
}

export function lcmBigInt(a: bigint, b: bigint): bigint {
    if (a === 0n || b === 0n) return 0n;
    return (a / gcdBigInt(a, b)) * b;
}

export class Frac {
    n: bigint;
    d: bigint;
    constructor(n: bigint, d: bigint = 1n) {
        if (d === 0n) throw new Error("分母为零");
        if (d < 0n) { n = -n; d = -d; }
        const g = gcdBigInt(n, d);
        this.n = n / g;
        this.d = d / g;
    }
    static zero() { return new Frac(0n); }
    static one() { return new Frac(1n); }
    add(o: Frac) { return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o: Frac) { return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o: Frac) { return new Frac(this.n * o.n, this.d * o.d); }
    div(o: Frac) { return new Frac(this.n * o.d, this.d * o.n); }
    neg() { return new Frac(-this.n, this.d); }
    isZero() { return this.n === 0n; }
}

/* ==================== 矩阵 / 零空间 ==================== */

/** 对矩阵做行最简形（RREF），返回 RREF 与主元列号 */
export function rref(A: Frac[][]): { R: Frac[][]; pivots: number[] } {
    const rows = A.length;
    const cols = rows > 0 ? A[0].length : 0;
    const R: Frac[][] = A.map(row => row.map(f => new Frac(f.n, f.d)));
    const pivots: number[] = [];
    let r = 0;
    for (let c = 0; c < cols && r < rows; c++) {
        // 找主元
        let pivot = -1;
        for (let i = r; i < rows; i++) {
            if (!R[i][c].isZero()) { pivot = i; break; }
        }
        if (pivot === -1) continue;

        [R[r], R[pivot]] = [R[pivot], R[r]];

        // 归一化主元行
        const pv = R[r][c];
        for (let j = c; j < cols; j++) R[r][j] = R[r][j].div(pv);

        // 消去其他行的该列
        for (let i = 0; i < rows; i++) {
            if (i === r) continue;
            const f = R[i][c];
            if (f.isZero()) continue;
            for (let j = c; j < cols; j++) {
                R[i][j] = R[i][j].sub(f.mul(R[r][j]));
            }
        }
        pivots.push(c);
        r++;
    }
    return { R, pivots };
}

/** 求 A 的零空间一组基（每个基向量都是 Frac 数组，长度为列数） */
export function nullspace(A: Frac[][], numCols: number): Frac[][] {
    const { R, pivots } = rref(A);
    const pivotSet = new Set(pivots);
    const freeCols: number[] = [];
    for (let c = 0; c < numCols; c++) {
        if (!pivotSet.has(c)) freeCols.push(c);
    }
    const basis: Frac[][] = [];
    for (const freeCol of freeCols) {
        const v: Frac[] = new Array(numCols).fill(null).map(() => Frac.zero());
        v[freeCol] = Frac.one();
        for (let i = 0; i < pivots.length; i++) {
            v[pivots[i]] = R[i][freeCol].neg();
        }
        basis.push(v);
    }
    return basis;
}

/* ==================== 找最小正整数解 ==================== */

/** 把一个（有理）向量缩放成最简正整数向量；若含 0 或符号不一致，返回 null */
export function scaleToPositiveIntegers(v: Frac[]): bigint[] | null {
    let L = 1n;
    for (const f of v) L = lcmBigInt(L, f.d);
    let ints = v.map(f => f.n * (L / f.d));

    if (ints.some(x => x === 0n)) return null;

    const hasPos = ints.some(x => x > 0n);
    const hasNeg = ints.some(x => x < 0n);
    if (hasPos && hasNeg) return null;
    if (hasNeg) ints = ints.map(x => -x);

    let g = 0n;
    for (const x of ints) g = gcdBigInt(g, x);
    if (g > 1n) ints = ints.map(x => x / g);
    return ints;
}

export function findSmallestPositiveSolution(basis: Frac[][]): bigint[] {
    const k = basis.length;
    const m = basis[0].length;

    // 零空间一维：直接缩放即最简
    if (k === 1) {
        const sol = scaleToPositiveIntegers(basis[0]);
        if (sol === null) throw new BalanceError("无法得到正整数解（含 0 或符号不一致）");
        return sol;
    }

    // 零空间多维：在自由变量上做小范围枚举，找"元素和最小"的正整数解
    // 解形如 x = Σ c_i · basis[i]
    const MAX = 10;
    let best: bigint[] | null = null;
    let bestSum = 0n;
    const c = new Array(k).fill(0);

    const tryCombination = (): bigint[] | null => {
        const x: Frac[] = new Array(m).fill(null).map(() => Frac.zero());
        for (let i = 0; i < k; i++) {
            if (c[i] === 0) continue;
            const ci = new Frac(BigInt(c[i]));
            for (let j = 0; j < m; j++) {
                x[j] = x[j].add(basis[i][j].mul(ci));
            }
        }
        return scaleToPositiveIntegers(x);
    };

    const recurse = (depth: number): void => {
        if (depth === k) {
            const sol = tryCombination();
            if (sol) {
                const sum = sol.reduce((a, b) => a + b, 0n);
                if (best === null || sum < bestSum) {
                    best = sol;
                    bestSum = sum;
                }
            }
            return;
        }
        for (let v = -MAX; v <= MAX; v++) {
            if (v === 0) continue;
            c[depth] = v;
            recurse(depth + 1);
        }
    };
    recurse(0);

    if (best === null) throw new BalanceError("在搜索范围内找不到正整数解");
    return best;
}