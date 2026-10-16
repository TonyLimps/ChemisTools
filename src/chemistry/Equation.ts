import {Formula} from "./AST.ts";

export class Equation {
    public reactants: Map<Formula, number> = new Map();
    public products: Map<Formula, number> = new Map();
    constructor(reactants: Formula[], products: Formula[]) {
        this.reactants = new Map();
        this.products = new Map();
        reactants.forEach(x => this.reactants.set(x, 1));
        products.forEach(x => this.products.set(x, 1));
    }
    public balance() {
        let reactantAtomCounts = new Map<Formula, Map<string, number>>();
        let productAtomCounts = new Map<Formula, Map<string, number>>();
        for (let node of this.reactants.keys()) {
            let counts: Map<string, number> = new Map();
            node.getAtomCounts(counts);
            reactantAtomCounts.set(node, counts);
        }
        for (let node of this.products.keys()) {
            let counts: Map<string, number> = new Map();
            node.getAtomCounts(counts);
            productAtomCounts.set(node, counts);
        }


        let totalElements: Set<string> = new Set();
        for (let counts of reactantAtomCounts.values()) {
            for (let element of counts.keys()) {
                totalElements.add(element);
            }
        }
        for (let counts of productAtomCounts.values()) {
            for (let element of counts.keys()) {
                totalElements.add(element);
            }
        }

        let A: number[][] = [];

        totalElements.forEach(element => {
            let equation: number[] = [];
            for (let counts of reactantAtomCounts.values()) {
                let count = counts.get(element);
                equation.push(count === undefined ? 0 : count);
            }
            for (let counts of productAtomCounts.values()) {
                let count = counts.get(element);
                equation.push(count === undefined ? 0 : -count);
            }
            A.push(equation);
        });

        let b: number[] = new Array(A.length).fill(0);
        let c = new Array(A[0].length-1).fill(0);
        c.push(1);
        A.push(c);
        b.push(1);

        const factors: number[] = gaussianElimination(A, b)!;
        simplifyRatios(factors);

        if (factors === null) {
            throw new BalanceError("方程组无唯一解");
        }

        let i = 0;
        for (let node of this.reactants.keys()) {
            this.reactants.set(node, factors[i++]);
        }
        for (let node of this.products.keys()) {
            this.products.set(node, factors[i++]);
        }
    }
    public toString() {
        let reactants: string[] = [];
        this.reactants.forEach((factor, node) => {
            reactants.push(`${factor !== 1 ? factor : ''}${node.toString()}`);
        });
        let products:string[] = [];
        this.products.forEach((factor, node) => {
            products.push(`${factor !== 1 ? factor : ''}${node.toString()}`);
        });
        return `${reactants.join(' + ')} --> ${products.join(' + ')}`;
    }
}

export class BalanceError extends Error {}

function toBigInt(value: number): bigint {
    if (!Number.isInteger(value)) {
        throw new BalanceError(`输入必须是整数，实际为 ${value}`);
    }
    if (!Number.isSafeInteger(value)) {
        throw new BalanceError(`输入整数 ${value} 超出安全整数范围，请直接使用 bigint`);
    }
    return BigInt(value);
}
/*
function gaussianElimination(A: number[][], b: number[]): number[] | null {
    const n = A.length;

    // 校验输入维度
    if (b.length !== n) {
        throw new BalanceError(`系数矩阵 ${JSON.stringify(A)} 的行数与常数向量 ${JSON.stringify(b)} 的长度不匹配`);
    }
    for (let i = 0; i < n; i++) {
        if (A[i].length !== n) {
            throw new BalanceError(`系数矩阵 ${JSON.stringify(A)} 不是方阵`);
        }
    }

    // 构造增广矩阵 [A | b] 的 bigint 副本
    const aug: bigint[][] = A.map((row, i) => [
        ...row.map(toBigInt),
        toBigInt(b[i]),
    ]);

    // 高斯消元：前向消元
    for (let col = 0; col < n; col++) {
        // 1. 选主元：在当前列中找绝对值最大的行
        let maxRow = col;
        let maxVal = absBigInt(aug[col][col]);
        for (let row = col + 1; row < n; row++) {
            const val = absBigInt(aug[row][col]);
            if (val > maxVal) {
                maxVal = val;
                maxRow = row;
            }
        }

        // 如果主元为 0，说明矩阵奇异
        if (maxVal === 0n) {
            return null;
        }

        // 2. 交换当前行与主元行
        if (maxRow !== col) {
            [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
        }

        // 3. 消去当前列下方所有行的该列元素（使用整数交叉相乘避免分数）
        const pivot = aug[col][col];
        for (let row = col + 1; row < n; row++) {
            const factor = aug[row][col];
            if (factor === 0n) continue;
            for (let j = col; j <= n; j++) {
                // aug[row][j] = aug[row][j] * pivot - factor * aug[col][j]
                aug[row][j] = aug[row][j] * pivot - factor * aug[col][j];
            }
        }
    }

    // 回代求解
    const x: bigint[] = new Array(n).fill(0n);
    for (let i = n - 1; i >= 0; i--) {
        let sum = aug[i][n];
        for (let j = i + 1; j < n; j++) {
            sum -= aug[i][j] * x[j];
        }
        // 此时 aug[i][i] 是整数，sum 也是整数，但除法可能不整除
        // 若需要精确分数，应在此处保留分数形式；这里做整除并抛出警告
        x[i] = sum / aug[i][i];
    }

    // 将 bigint 结果转回 number（如果解是整数且安全）
    return x.map((v) => {
        if (v > BigInt(Number.MAX_SAFE_INTEGER) || v < BigInt(Number.MIN_SAFE_INTEGER)) {
            throw new BalanceError(`解 ${v} 超出安全整数范围，无法安全转换为 number`);
        }
        return Number(v);
    });
}

 */
function gaussianElimination(A: number[][], b: number[]): number[] | null {
    const n = A.length;

    // 校验输入维度
    if (b.length !== n) {
        throw new BalanceError(`系数矩阵 ${JSON.stringify(A)} 的行数与常数向量 ${JSON.stringify(b)} 的长度不匹配`);
    }
    for (let i = 0; i < n; i++) {
        if (A[i].length !== n) {
            throw new BalanceError(`系数矩阵 ${JSON.stringify(A)} 不是方阵`);
        }
    }

    // 构造增广矩阵 [A | b] 的副本，避免修改原数组
    const aug: number[][] = A.map((row, i) => [...row, b[i]]);

    // 高斯消元：前向消元
    for (let col = 0; col < n; col++) {
        // 1. 选主元：在当前列中找绝对值最大的行
        let maxRow = col;
        let maxVal = Math.abs(aug[col][col]);
        for (let row = col + 1; row < n; row++) {
            const val = Math.abs(aug[row][col]);
            if (val > maxVal) {
                maxVal = val;
                maxRow = row;
            }
        }

        // 如果主元接近 0，说明矩阵奇异
        if (maxVal < 1e-12) {
            return null;
        }

        // 2. 交换当前行与主元行
        if (maxRow !== col) {
            [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
        }

        // 3. 消去当前列下方所有行的该列元素
        const pivot = aug[col][col];
        for (let row = col + 1; row < n; row++) {
            const factor = aug[row][col] / pivot;
            for (let j = col; j <= n; j++) {
                aug[row][j] -= factor * aug[col][j];
            }
        }
    }

    // 回代求解
    const x: number[] = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = aug[i][n];
        for (let j = i + 1; j < n; j++) {
            sum -= aug[i][j] * x[j];
        }
        x[i] = sum / aug[i][i];
    }

    return x;
}
function absBigInt(v: bigint): bigint {
    return v < 0n ? -v : v;
}

function simplifyRatios(ratios: number[]): void {
    if (ratios.length === 0) return;

    // 1. 将每个小数转换为整数（通过乘以 10 的幂）
    //    找出每个小数所需的最大小数位数
    let maxDecimals = 0;
    for (const num of ratios) {
        const str = num.toString();
        const decimalIndex = str.indexOf('.');
        if (decimalIndex !== -1) {
            const decimals = str.length - decimalIndex - 1;
            if (decimals > maxDecimals) {
                maxDecimals = decimals;
            }
        }
    }

    // 2. 将所有数乘以 10^maxDecimals，转换为整数
    const multiplier = Math.pow(10, maxDecimals);
    const integers = ratios.map(num => Math.round(num * multiplier));

    // 3. 计算所有整数的最大公约数 (GCD)
    const gcd = (a: number, b: number): number => {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    };

    const gcdOfArray = (arr: number[]): number => {
        let result = arr[0];
        for (let i = 1; i < arr.length; i++) {
            result = gcd(result, arr[i]);
        }
        return result;
    };

    const commonDivisor = gcdOfArray(integers);

    // 4. 除以最大公约数，得到最简整数比，并直接修改原数组
    for (let i = 0; i < ratios.length; i++) {
        ratios[i] = integers[i] / commonDivisor;
    }
}