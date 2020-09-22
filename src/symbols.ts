/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

let nextSymbolId = 0;

/** {@docCategory Bind} */
export enum SymbolKind {
    SourceFile,
    Production,
    Parameter
}

/** {@docCategory Bind} */
export class Symbol {
    public id: number = ++nextSymbolId;
    public name: string;
    public kind: SymbolKind;
    public parent: Symbol | undefined;
    public locals: SymbolTable | undefined;

    constructor(kind: SymbolKind, name: string) {
        this.kind = kind;
        this.name = name;
    }
}

/** {@docCategory Bind} */
export class SymbolTable {
    private nameMap: Map<SymbolKind, Map<string, Symbol>> | undefined;

    get isEmpty() { return !this.nameMap; }

    public resolveSymbol(name: string, kind: SymbolKind): Symbol | undefined {
        if (name) {
            return this.getSymbols(kind, /*create*/ false)?.get(name);
        }

        return undefined;
    }

    public * symbolsOfKind(kind: SymbolKind) {
        const symbols = this.nameMap?.get(kind);
        if (symbols) {
            yield* symbols.values();
        }
    }

    /* @internal */
    public copyFrom(other: SymbolTable) {
        if (other === this || !other.nameMap) return;
        for (const [kind, otherSymbols] of other.nameMap) {
            this.nameMap ??= new Map<SymbolKind, Map<string, Symbol>>();
            let symbols = this.nameMap.get(kind);
            if (!symbols) this.nameMap.set(kind, symbols = new Map<string, Symbol>());
            for (const [name, symbol] of otherSymbols) {
                symbols.set(name, symbol);
            }
        }
    }

    /* @internal */
    public declareSymbol(name: string | undefined, kind: SymbolKind, parent?: Symbol): Symbol {
        let symbol: Symbol | undefined;
        if (name) {
            const symbols = this.getSymbols(kind, /*create*/ true);
            symbol = symbols.get(name);
            if (!symbol) {
                symbol = new Symbol(kind, name);
                symbols.set(name, symbol);
            }
        }
        else {
            symbol = new Symbol(kind, "*missing*");
        }

        symbol.parent = parent;
        return symbol;
    }

    private getSymbols(kind: SymbolKind, create: true): Map<string, Symbol>;
    private getSymbols(kind: SymbolKind, create: boolean): Map<string, Symbol> | undefined;
    private getSymbols(kind: SymbolKind, create: boolean): Map<string, Symbol> | undefined {
        let symbols = this.nameMap?.get(kind);
        if (!symbols && create) (this.nameMap ??= new Map()).set(kind, symbols = new Map<string, Symbol>());
        return symbols;
    }
}