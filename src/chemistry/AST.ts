export enum NodeType {
    EQUATION, FORMULA, TERM, ELEMENT
}

export abstract class ASTNode {
    public type: NodeType;
    protected constructor (type: NodeType) {
        this.type = type;
    }
    public abstract getAtomCounts(counts: Map<string, number>, mul: number): void;
}

export class Formula extends ASTNode {
    public nodes: Map<ASTNode, number> = new Map();
    constructor() {
        super(NodeType.FORMULA);
    }

    public toString(): string {
        let result = '';
        this.nodes.forEach((factor, node) => {
            if (node.type === NodeType.ELEMENT) {
                result += `${node.toString()}${factorToSubscript(factor)}`;
            } else if (node.type === NodeType.FORMULA) {
                result += `·${factor == 1 ? '' : factor}${node.toString()}`;
            } else if (node.type === NodeType.TERM) {
                result += `(${node.toString()})${factorToSubscript(factor)}`;
            }
        });
        return result;
    }

    public getAtomCounts(counts: Map<string, number>, mul: number = 1) {
        this.nodes.forEach((factor, node) => {
            node.getAtomCounts(counts, factor*mul);
        });
    }
}

export class Term extends ASTNode {
    public nodes: Map<ASTNode, number> = new Map();
    constructor() {
        super(NodeType.TERM);
    }

    public toString(): string {
        let result = '';
        this.nodes.forEach((factor, node) => {
            if (node.type === NodeType.ELEMENT) {
                result += `${node.toString()}${factorToSubscript(factor)}`;
            } else if (node.type === NodeType.FORMULA) {
                result += `·${factor == 1 ? '' : factor}${node.toString()}`;
            } else if (node.type === NodeType.TERM) {
                result += `(${node.toString()})${factorToSubscript(factor)}`;
            }
        });
        return result;
    }

    public getAtomCounts(counts: Map<string, number>, mul: number = 1) {
        this.nodes.forEach((factor, node) => {
            node.getAtomCounts(counts, factor*mul);
        });
    }
}

export class Element extends ASTNode {
    public symbol: string;
    constructor(symbol: string) {
        super(NodeType.ELEMENT);
        this.symbol = symbol;
    }

    public toString(): string {
        return this.symbol;
    }

    public getAtomCounts(counts: Map<string, number>, mul: number = 1) {
        let count = counts.get(this.symbol);
        counts.set(this.symbol, count === undefined
            ? mul
            : counts.get(this.symbol)!+mul
        );
    }
}

export function factorToSubscript(num: number): string {
    const mapping: Record<string, string> = {
        '0': '₀',
        '1': '₁',
        '2': '₂',
        '3': '₃',
        '4': '₄',
        '5': '₅',
        '6': '₆',
        '7': '₇',
        '8': '₈',
        '9': '₉'
    };
    const result = String(num)
        .split('')
        .map(char => mapping[char] || char)
        .join('');
    return result == '₁' ? '' : result;
}