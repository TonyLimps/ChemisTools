import {Token, TokenType} from './Token.ts';

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
