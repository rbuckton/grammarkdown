/*!
 *  Copyright 2015 Ron Buckton (rbuckton@chronicles.org)
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { CancellationToken } from "prex";
import { Cancelable } from "@esfx/cancelable";
import { SyntaxKind } from "./tokens";
import { Symbol, SymbolKind, SymbolTable } from "./symbols";
import { SourceFile, Production, Parameter, Node, Declaration, Identifier } from "./nodes";
import { toCancelToken } from "./core";

export class BindingTable {
    public readonly globals: SymbolTable = new SymbolTable();

    private nodeParents: Map<Node, Node> | undefined;
    private nodeSymbols: Map<Node, Symbol> | undefined;
    private symbolDeclarations: Map<Symbol, Set<Declaration>> | undefined;
    private symbolReferences: Map<Symbol, Set<Node>> | undefined;
    private symbolLocals: Map<Symbol, SymbolTable> | undefined;

    public get isEmpty() {
        return !this.nodeParents
            && !this.nodeSymbols
            && !this.symbolReferences
            && !this.symbolLocals
            && !this.symbolDeclarations
            && this.globals.isEmpty;
    }

    public hasParent(node: Node | undefined): boolean {
        return node && this.nodeParents ? this.nodeParents.has(node) : false;
    }

    public getParent(node: Node | undefined): Node | undefined {
        return node && this.nodeParents && this.nodeParents.get(node);
    }

    public getAncestor(node: Node | undefined, kind: SyntaxKind): Node | undefined {
        for (let parent = this.getParent(node); parent; parent = this.getParent(parent)) {
            if (parent.kind === kind) {
                return parent;
            }
        }

        return undefined;
    }

    public getSourceFile(node: Node | undefined): SourceFile | undefined {
        return node?.kind === SyntaxKind.SourceFile ? node as SourceFile :
            this.getAncestor(node, SyntaxKind.SourceFile) as SourceFile | undefined;
    }

    public hasSymbol(node: Node | undefined): boolean {
        return node && this.nodeSymbols ? this.nodeSymbols.has(node) : false;
    }

    public getSymbol(node: Node | undefined): Symbol | undefined {
        return node && this.nodeSymbols && this.nodeSymbols.get(node);
    }

    public resolveSymbol(location: Node | undefined, name: string | undefined, meaning: SymbolKind): Symbol | undefined {
        if (this.symbolLocals && name) {
            while (location) {
                if (location.kind === SyntaxKind.SourceFile) {
                    const result = this.globals.resolveSymbol(name, meaning);
                    if (result) return result;
                    break;
                }

                const symbol = this.getSymbol(location);
                const locals = symbol ? this.symbolLocals.get(symbol) : undefined;
                const result = locals && locals.resolveSymbol(name, meaning);
                if (result) return result;
                location = this.getParent(location);
            }
        }

        return undefined;
    }

    public getDeclarations(symbol: Symbol | undefined): (SourceFile | Production | Parameter)[] {
        const declarations = symbol && this.symbolDeclarations && this.symbolDeclarations.get(symbol);
        return declarations ? [...declarations] : [];
    }

    public getReferences(symbol: Symbol | undefined): Node[] {
        const references = symbol && this.symbolReferences && this.symbolReferences.get(symbol);
        return references ? [...references] : [];
    }

    /* @internal */
    public copyFrom(other: BindingTable) {
        if (other === this || other.isEmpty) return;
        this.globals.copyFrom(other.globals);
        if (other.nodeParents) {
            if (!this.nodeParents) this.nodeParents = new Map<Node, Node>();
            for (const [node, parent] of other.nodeParents) {
                this.nodeParents.set(node, parent);
            }
        }

        if (other.nodeSymbols) {
            if (!this.nodeSymbols) this.nodeSymbols = new Map<Node, Symbol>();
            for (const [node, symbol] of other.nodeSymbols) {
                this.nodeSymbols.set(node, symbol);
            }
        }

        if (other.symbolDeclarations) {
            if (!this.symbolDeclarations) this.symbolDeclarations = new Map<Symbol, Set<Declaration>>();
            for (const [symbol, otherDeclarations] of other.symbolDeclarations) {
                let declarations = this.symbolDeclarations.get(symbol);
                if (!declarations) this.symbolDeclarations.set(symbol, declarations = new Set<Declaration>());
                for (const declaration of otherDeclarations) {
                    declarations.add(declaration);
                }
            }
        }

        if (other.symbolReferences) {
            if (!this.symbolReferences) this.symbolReferences = new Map<Symbol, Set<Node>>();
            for (const [symbol, otherReferences] of other.symbolReferences) {
                let references = this.symbolReferences.get(symbol);
                if (!references) this.symbolReferences.set(symbol, references = new Set<Node>());
                for (const reference of otherReferences) {
                    references.add(reference);
                }
            }
        }

        if (other.symbolLocals) {
            if (!this.symbolLocals) this.symbolLocals = new Map<Symbol, SymbolTable>();
            for (const [symbol, otherLocals] of other.symbolLocals) {
                let locals = this.symbolLocals.get(symbol);
                if (!locals) this.symbolLocals.set(symbol, locals = new SymbolTable());
                locals.copyFrom(otherLocals);
            }
        }
    }

    /* @internal */
    public setParent(node: Node | undefined, parent: Node | undefined): void {
        if (node && parent) {
            if (!this.nodeParents) this.nodeParents = new Map<Node, Node>();
            this.nodeParents.set(node, parent);
        }
    }

    /* @internal */
    public setSymbol(node: Identifier | undefined, symbol: Symbol | undefined): void {
        if (node && symbol) {
            this.setSymbolForNode(node, symbol);
            this.addReferenceToSymbol(symbol, node);
        }
    }

    /* @internal */
    public addDeclarationToSymbol(symbol: Symbol | undefined, node: SourceFile | Production | Parameter | undefined): void {
        if (symbol && node) {
            if (!this.symbolDeclarations) this.symbolDeclarations = new Map<Symbol, Set<SourceFile | Production | Parameter>>();
            let declarations = this.symbolDeclarations.get(symbol);
            if (!declarations) this.symbolDeclarations.set(symbol, declarations = new Set<SourceFile | Production | Parameter>());
            declarations.add(node);
            this.setSymbolForNode(node, symbol);
            if (node.kind !== SyntaxKind.SourceFile) {
                this.addReferenceToSymbol(symbol, (<Production | Parameter>node).name);
            }
        }
    }

    /* @internal */
    public getScope(container: Symbol): SymbolTable {
        if (!this.symbolLocals) this.symbolLocals = new Map<Symbol, SymbolTable>();
        let scope = this.symbolLocals.get(container);
        if (!scope) this.symbolLocals.set(container, scope = new SymbolTable());
        return scope;
    }

    private setSymbolForNode(node: Node, symbol: Symbol): void {
        if (!this.nodeSymbols) this.nodeSymbols = new Map<Node, Symbol>();
        this.nodeSymbols.set(node, symbol);
    }

    private addReferenceToSymbol(symbol: Symbol, node: Node): void {
        if (!this.symbolReferences) this.symbolReferences = new Map<Symbol, Set<Node>>();
        let references = this.symbolReferences.get(symbol);
        if (!references) this.symbolReferences.set(symbol, references = new Set<Node>());
        references.add(node);
    }
}

export class Binder {
    private parentNode: Node | undefined;
    private parentSymbol: Symbol | undefined;

    public bindSourceFile(file: SourceFile, bindings: BindingTable, cancelable?: Cancelable): void;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public bindSourceFile(file: SourceFile, bindings: BindingTable, cancelable?: CancellationToken | Cancelable): void;
    public bindSourceFile(file: SourceFile, bindings: BindingTable, cancelable?: CancellationToken | Cancelable): void {
        toCancelToken(cancelable)?.throwIfSignaled();

        if (bindings.globals.resolveSymbol(file.filename, SymbolKind.SourceFile)) {
            // skip files that have already been bound.
            return;
        }

        const fileBindings = new BindingTable();
        const scope = fileBindings.globals;

        const symbol = this.declareSymbol(fileBindings, scope, file.filename, file, SymbolKind.SourceFile);
        this.bindChildren(fileBindings, file, symbol, scope);
        bindings.copyFrom(fileBindings);
    }

    private bindProduction(bindings: BindingTable, scope: SymbolTable, node: Production): void {
        const symbol = this.declareSymbol(bindings, scope, node.name.text, node, SymbolKind.Production);
        const newScope = bindings.getScope(symbol);
        this.bindChildren(bindings, node, symbol, newScope);
    }

    private bindParameter(bindings: BindingTable, scope: SymbolTable, node: Parameter): void {
        const symbol = this.declareSymbol(bindings, scope, node.name.text, node, SymbolKind.Parameter);
        this.bindChildren(bindings, node, symbol, scope);
    }

    private bindChildren(bindings: BindingTable, parentNode: Node, parentSymbol: Symbol | undefined, scope: SymbolTable): void {
        const saveParentNode = this.parentNode;
        const saveParentSymbol = this.parentSymbol;
        this.parentNode = parentNode;
        this.parentSymbol = parentSymbol;

        for (const child of parentNode.children()) {
            this.bind(bindings, scope, child);
        }

        this.parentSymbol = saveParentSymbol;
        this.parentNode = saveParentNode;
    }

    private bind(bindings: BindingTable, scope: SymbolTable, node: Node): void {
        if (node) {
            bindings.setParent(node, this.parentNode);
            switch (node.kind) {
                case SyntaxKind.Production:
                    this.bindProduction(bindings, scope, <Production>node);
                    break;

                case SyntaxKind.Parameter:
                    this.bindParameter(bindings, scope, <Parameter>node);
                    break;

                default:
                    this.bindChildren(bindings, node, this.parentSymbol, scope);
                    break;
            }
        }
    }

    private declareSymbol(bindings: BindingTable, scope: SymbolTable, name: string | undefined, declaration: SourceFile | Production | Parameter, kind: SymbolKind): Symbol {
        const symbol = scope.declareSymbol(name, kind, this.parentSymbol);
        bindings.addDeclarationToSymbol(symbol, declaration);
        return symbol;
    }
}