import { Dict } from "./core";

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
    private nameMap: Dict<Symbol>[];

    public resolveSymbol(name: string, kind: SymbolKind): Symbol {
        if (name) {
            let symbols = this.getSymbols(kind, /*create*/ false);
            if (symbols) {
                return Dict.get(symbols, name);
            }
        }
        
        return undefined;
    }

    public declareSymbol(name: string, kind: SymbolKind): Symbol {
        let symbol: Symbol;
        if (name) {
            let symbols = this.getSymbols(kind, /*create*/ true);
            if (Dict.has(symbols, name)) {
                symbol = Dict.get(symbols, name);
            }
            else {
                symbol = new Symbol(kind, name);
                symbols[name] = symbol;
            }
        }
        else {
            symbol = new Symbol(kind, "*missing*");
        }
        
        return symbol;
    }        

    private getSymbols(kind: SymbolKind, create: boolean): Dict<Symbol> {
        if (!this.nameMap) {
            if (!create) {
                return;
            }
            this.nameMap = [];
        }

        if (create && !(kind in this.nameMap)) {
            this.nameMap[kind] = new Dict<Symbol>();
        }

        return this.nameMap[kind];
    }
}