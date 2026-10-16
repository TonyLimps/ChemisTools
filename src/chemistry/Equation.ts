import {Formula} from "./AST.ts";
import {findSmallestPositiveSolution, Frac, nullspace} from "./Util.ts";


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
        const reactantList = [...this.reactants.keys()];
        const productList = [...this.products.keys()];
        const allFormulas = [...reactantList, ...productList];
        const numReactants = reactantList.length;
        const numCols = allFormulas.length;

        // 每个分子的元素计数
        const compositions = allFormulas.map(f => {
            const counts = new Map<string, number>();
            f.getAtomCounts(counts);
            return counts;
        });

        // 收集所有元素
        const elementSet = new Set<string>();
        for (const comp of compositions) {
            for (const el of comp.keys()) elementSet.add(el);
        }
        const elementList = [...elementSet];
        const numRows = elementList.length;

        // 构造 A：行=元素，列=分子；反应物 +，生成物 -
        const A: Frac[][] = [];
        for (let i = 0; i < numRows; i++) {
            const row: Frac[] = [];
            for (let j = 0; j < numCols; j++) {
                const count = compositions[j].get(elementList[i]) ?? 0;
                const sign = j < numReactants ? 1 : -1;
                row.push(new Frac(BigInt(count * sign)));
            }
            A.push(row);
        }

        // 求零空间
        const basis = nullspace(A, numCols);
        if (basis.length === 0) {
            throw new BalanceError("零空间为空：该方程式无解");
        }

        // 找最小正整数解
        const solution = findSmallestPositiveSolution(basis);

        // 写回系数
        let idx = 0;
        for (const node of this.reactants.keys()) {
            this.reactants.set(node, Number(solution[idx++]));
        }
        for (const node of this.products.keys()) {
            this.products.set(node, Number(solution[idx++]));
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