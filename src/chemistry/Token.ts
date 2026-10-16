export class Token {
    constructor(
        public type: TokenType,
        public value: any,
        public start: number,
        public end: number,
    ) {}
}

export enum TokenType {
    ELEMENT,
    LEFT_BRACKET,
    RIGHT_BRACKET,
    NUMBER,
    DOT,
    SEPARATOR
}