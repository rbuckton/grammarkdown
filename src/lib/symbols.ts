import { Dictionary } from "./core";

let nextSymbolId = 0;

export enum SymbolKind {
    SourceFile,
    Production,
    Parameter
}

export class Symbol {
    public id: number = ++nextSymbolId;
    public name: string;
    public kind: SymbolKind;
    public parent: Symbol;
    public locals: SymbolTable;

    constructor(kind: SymbolKind, name: string) {
        this.kind = kind;
        this.name = name;
    }
}

export class SymbolTable {
    private nameMap: Dictionary<Symbol>[];

    public resolveSymbol(name: string, kind: SymbolKind): Symbol {
        if (name) {
            const symbols = this.getSymbols(kind, /*create*/ false);
            if (symbols) {
                return Dictionary.get(symbols, name);
            }
        }

        return undefined;
    }

    public declareSymbol(name: string, kind: SymbolKind, parent?: Symbol): Symbol {
        let symbol: Symbol;
        if (name) {
            const symbols = this.getSymbols(kind, /*create*/ true);
            if (Dictionary.has(symbols, name)) {
                symbol = Dictionary.get(symbols, name);
            }
            else {
                symbol = new Symbol(kind, name);
                symbols[name] = symbol;
            }
        }
        else {
            symbol = new Symbol(kind, "*missing*");
        }

        symbol.parent = parent;
        return symbol;
    }

    private getSymbols(kind: SymbolKind, create: boolean): Dictionary<Symbol> {
        if (!this.nameMap) {
            if (!create) {
                return;
            }
            this.nameMap = [];
        }

        if (create && !(kind in this.nameMap)) {
            this.nameMap[kind] = new Dictionary<Symbol>();
        }

        return this.nameMap[kind];
    }
}