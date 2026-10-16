import {Token, TokenType} from './Token.ts';
import {Formula, Term, Element} from './AST.ts';

export class ParseError extends Error {
    public readonly start: number;
    public readonly end: number;
    constructor(message: string, start: number, end: number) {
        super(message);
        this.start = start;
        this.end = end;
    }
}

export default class Parser {
    static tokenizer(text: string): Token[] {
        const tokens: Token[] = [];
        const chars = Array.from(text);
        const length = chars.length;
        for (let i = 0; i < length;) {
            const ch = chars[i];
            const start = i;
            let end: number;
            let token: Token;
            if (isUpper(ch)) {
                const nextChar = chars[++i];
                let end = nextChar === undefined ? length : i;
                if (nextChar !== undefined && isLower(nextChar)) {
                    end++;
                    i++;
                }
                const element = text.substring(start, end);
                token = new Token(TokenType.ELEMENT, element, start, end);
            }
            else if (isDigit(ch)) {
                do {
                    i++;
                } while (i < length && isDigit(chars[i]));
                end = i;
                const num = parseInt(text.substring(start, end));
                token = new Token(TokenType.NUMBER, num, start, end);
            }
            else if (isLeftBracket(ch)) {
                end = ++i;
                token = new Token(TokenType.LEFT_BRACKET, ch, start, end);
            }
            else if (isRightBracket(ch)) {
                end = ++i;
                token = new Token(TokenType.RIGHT_BRACKET, ch, start, end);
            }
            else if (isDot(ch)) {
                end = ++i;
                token = new Token(TokenType.DOT, ch, start, end);
            }
            else if (isSeparator(ch)) {
                do {
                    i++;
                } while (i < length && isDigit(chars[i]));
                end = i;
                const sep = parseInt(text.substring(start, end));
                token = new Token(TokenType.SEPARATOR, sep, start, end);
            }
            else {
                throw new ParseError("未知的标识", i,i+1);
            }
            tokens.push(token);
        }
        return tokens;
    }
    static parse(text: string): Formula {
        const tokens = Parser.tokenizer(text);
        let context = new ParseContext(tokens,0);
        return parseFormula(context);
    }
}

class ParseContext {
    constructor(
        public tokens: Token[],
        public current: number
    ) {}
}


function parseFormula(c: ParseContext): Formula {
    let formula: Formula = new Formula();
    while (c.current < c.tokens.length) {
        let currentToken = c.tokens[c.current];
        if (currentToken.type === TokenType.ELEMENT) {
            const element = new Element(currentToken.value);
            let factor = peekFactor(c);
            formula.nodes.set(element, factor);
            c.current++;
        }
        else if (currentToken.type === TokenType.LEFT_BRACKET) {
            const bracketPairs: Record<string, string> = {
                '(': ')',
                '[': ']'
            };
            const rightBracket = bracketPairs[currentToken.value];
            c.current++;
            const subTerm = parseTerm(c);
            currentToken = c.tokens[c.current];
            if (currentToken.value !== rightBracket) {
                throw new ParseError(`应为 '${rightBracket}'`, currentToken.start, currentToken.end);
            }
            let factor = peekFactor(c);
            formula.nodes.set(subTerm, factor);
            c.current++;
        }
        else if (currentToken.type === TokenType.DOT) {
            let factor = peekFactor(c);
            c.current++;
            if (c.current >= c.tokens.length) {
                throw new ParseError("缺少元素或数字", currentToken.start, currentToken.end);
            }
            const subFormula = parseFormula(c);
            formula.nodes.set(subFormula, factor);
            c.current++;
        }
        else if (currentToken.type === TokenType.RIGHT_BRACKET) {
            break;
        }
        else {
            throw new ParseError("应为元素或括号", currentToken.start, currentToken.end);
        }
    }
    return formula;
}

function parseTerm(c: ParseContext): Term {
    let term: Term = new Term();
    while (c.current < c.tokens.length) {
        let currentToken = c.tokens[c.current];
        if (currentToken.type === TokenType.ELEMENT) {
            const element = new Element(currentToken.value);
            let factor = peekFactor(c);
            term.nodes.set(element, factor);
            c.current++;
        }
        else if (currentToken.type === TokenType.LEFT_BRACKET) {
            const bracketPairs: Record<string, string> = {
                '(': ')',
                '[': ']'
            };
            const rightBracket = bracketPairs[currentToken.value];
            c.current++;
            const subTerm = parseTerm(c);
            currentToken = c.tokens[c.current];
            if (currentToken.value !== rightBracket) {
                throw new ParseError(`应为 '${rightBracket}'`, currentToken.start, currentToken.end);
            }
            let factor = peekFactor(c);
            term.nodes.set(subTerm, factor);
            c.current++;
        }
        else if (currentToken.type === TokenType.DOT) {
            c.current++;
            if (c.current >= c.tokens.length) {
                throw new ParseError("缺少元素或数字", currentToken.start, currentToken.end);
            }
            currentToken = c.tokens[c.current];
            let factor = peekFactor(c);
            const subFormula = parseFormula(c);
            term.nodes.set(subFormula, factor);
            c.current++;
        }
        else if (currentToken.type === TokenType.RIGHT_BRACKET) {
            break;
        }
        else {
            throw new ParseError("应为元素或括号", currentToken.start, currentToken.end);
        }
    }
    return term;
}

function peekFactor(c: ParseContext): number {
    const peek = c.tokens[c.current + 1];
    let factor = 1;
    if (peek === undefined) {
        factor = 1;
    }
    else if (peek.type === TokenType.NUMBER) {
        factor = peek.value;
        c.current++;
    }
    return factor;
}

function isDigit(ch: string): boolean {
    const code = ch.charCodeAt(0);
    return code >= 48 && code <= 57;
}

function isUpper(ch: string): boolean {
    const code = ch.charCodeAt(0);
    return code >= 65 && code <= 90;
}

function isLower(ch: string): boolean {
    const code = ch.charCodeAt(0);
    return code >= 97 && code <= 122;
}

function isSeparator(ch: string): boolean {
    return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
}

function isDot(ch: string): boolean {
    return ch === '·' || ch === '.';
}

function isLeftBracket(ch: string): boolean {
    return ch === '(' || ch === '[';
}

function isRightBracket(ch: string): boolean {
    return ch === ')' || ch === ']';
}
