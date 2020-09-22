/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { Cancelable } from "@esfx/cancelable";
import { SyntaxKind } from "./tokens";
import { Symbol, SymbolKind, SymbolTable } from "./symbols";
import { SourceFile, Production, Parameter, Node, Declaration, Identifier } from "./nodes";

/** {@docCategory Bind} */
export class BindingTable {
    public readonly globals: SymbolTable = new SymbolTable();

    private _nodeParents: Map<Node, Node> | undefined;
    private _nodeSymbols: Map<Node, Symbol> | undefined;
    private _symbolDeclarations: Map<Symbol, Set<Declaration>> | undefined;
    private _symbolReferences: Map<Symbol, Set<Node>> | undefined;
    private _symbolLocals: Map<Symbol, SymbolTable> | undefined;

    /**
     * Gets a value indicating whether this `BindingTable` is empty.
     */
    public get isEmpty() {
        return !this._nodeParents
            && !this._nodeSymbols
            && !this._symbolReferences
            && !this._symbolLocals
            && !this._symbolDeclarations
            && this.globals.isEmpty;
    }

    /**
     * Returns whether the provided `Node` has a parent.
     */
    public hasParent(node: Node | undefined): boolean {
        return node && this._nodeParents ? this._nodeParents.has(node) : false;
    }

    /**
     * Gets the parent of the provided `Node`.
     */
    public getParent(node: Node | undefined): Node | undefined {
        return node && this._nodeParents?.get(node);
    }

    /**
     * Gets the nearest ancestor of `node` with the provided `kind`.
     */
    public getAncestor(node: Node | undefined, kind: SyntaxKind): Node | undefined {
        for (let parent = this.getParent(node); parent; parent = this.getParent(parent)) {
            if (parent.kind === kind) {
                return parent;
            }
        }

        return undefined;
    }

    /**
     * Gets the `SourceFile` containing `node`.
     */
    public getSourceFile(node: Node | undefined): SourceFile | undefined {
        return node?.kind === SyntaxKind.SourceFile ? node as SourceFile :
            this.getAncestor(node, SyntaxKind.SourceFile) as SourceFile | undefined;
    }

    /**
     * Returns whether `node` has been bound to a `Symbol`.
     */
    public hasSymbol(node: Node | undefined): boolean {
        return node && this._nodeSymbols ? this._nodeSymbols.has(node) : false;
    }

    /**
     * Gets the `Symbol` bound to `node`.
     */
    public getSymbol(node: Node | undefined): Symbol | undefined {
        return node && this._nodeSymbols?.get(node);
    }

    /**
     * Resolves a `Symbol` for the provided `name` at the given `location` that has the provided `meaning`.
     */
    public resolveSymbol(location: Node | undefined, name: string | undefined, meaning: SymbolKind): Symbol | undefined {
        if (this._symbolLocals && name) {
            while (location) {
                if (location.kind === SyntaxKind.SourceFile) {
                    const result = this.globals.resolveSymbol(name, meaning);
                    if (result) return result;
                    break;
                }

                const symbol = this.getSymbol(location);
                const locals = symbol ? this._symbolLocals.get(symbol) : undefined;
                const result = locals?.resolveSymbol(name, meaning);
                if (result) return result;
                location = this.getParent(location);
            }
        }

        return undefined;
    }

    /**
     * Gets the declarations for the provided `symbol`.
     */
    public getDeclarations(symbol: Symbol | undefined): (SourceFile | Production | Parameter)[] {
        const declarations = symbol && this._symbolDeclarations?.get(symbol);
        return declarations ? [...declarations] : [];
    }

    /**
     * Gets the references to the provided `symbol`.
     */
    public getReferences(symbol: Symbol | undefined): Node[] {
        const references = symbol && this._symbolReferences?.get(symbol);
        return references ? [...references] : [];
    }

    /* @internal */
    public _copyFrom(other: BindingTable) {
        if (other === this || other.isEmpty) return;
        this.globals.copyFrom(other.globals);
        if (other._nodeParents) {
            this._nodeParents ??= new Map();
            for (const [node, parent] of other._nodeParents) {
                this._nodeParents.set(node, parent);
            }
        }

        if (other._nodeSymbols) {
            this._nodeSymbols ??= new Map();
            for (const [node, symbol] of other._nodeSymbols) {
                this._nodeSymbols.set(node, symbol);
            }
        }

        if (other._symbolDeclarations) {
            this._symbolDeclarations ??= new Map();
            for (const [symbol, otherDeclarations] of other._symbolDeclarations) {
                let declarations = this._symbolDeclarations.get(symbol);
                if (!declarations) this._symbolDeclarations.set(symbol, declarations = new Set());
                for (const declaration of otherDeclarations) {
                    declarations.add(declaration);
                }
            }
        }

        if (other._symbolReferences) {
            this._symbolReferences ??= new Map();
            for (const [symbol, otherReferences] of other._symbolReferences) {
                let references = this._symbolReferences.get(symbol);
                if (!references) this._symbolReferences.set(symbol, references = new Set());
                for (const reference of otherReferences) {
                    references.add(reference);
                }
            }
        }

        if (other._symbolLocals) {
            this._symbolLocals ??= new Map();
            for (const [symbol, otherLocals] of other._symbolLocals) {
                let locals = this._symbolLocals.get(symbol);
                if (!locals) this._symbolLocals.set(symbol, locals = new SymbolTable());
                locals.copyFrom(otherLocals);
            }
        }
    }

    /* @internal */
    public _setParent(node: Node | undefined, parent: Node | undefined): void {
        if (node && parent) {
            this._nodeParents ??= new Map();
            this._nodeParents.set(node, parent);
        }
    }

    /* @internal */
    public _setSymbol(node: Identifier | undefined, symbol: Symbol | undefined): void {
        if (node && symbol) {
            this._setSymbolForNode(node, symbol);
            this._addReferenceToSymbol(symbol, node);
        }
    }

    /* @internal */
    public _addDeclarationToSymbol(symbol: Symbol | undefined, node: SourceFile | Production | Parameter | undefined): void {
        if (symbol && node) {
            this._symbolDeclarations ??= new Map();
            let declarations = this._symbolDeclarations.get(symbol);
            if (!declarations) this._symbolDeclarations.set(symbol, declarations = new Set());
            declarations.add(node);
            this._setSymbolForNode(node, symbol);
            if (node.kind !== SyntaxKind.SourceFile) {
                this._addReferenceToSymbol(symbol, node.name);
            }
        }
    }

    /* @internal */
    public _getScope(container: Symbol): SymbolTable {
        this._symbolLocals ??= new Map();
        let scope = this._symbolLocals.get(container);
        if (!scope) this._symbolLocals.set(container, scope = new SymbolTable());
        return scope;
    }

    private _setSymbolForNode(node: Node, symbol: Symbol): void {
        this._nodeSymbols ??= new Map();
        this._nodeSymbols.set(node, symbol);
    }

    private _addReferenceToSymbol(symbol: Symbol, node: Node): void {
        this._symbolReferences ??= new Map();
        let references = this._symbolReferences.get(symbol);
        if (!references) this._symbolReferences.set(symbol, references = new Set());
        references.add(node);
    }
}

/** {@docCategory Bind} */
export class Binder {
    private _parentNode: Node | undefined;
    private _parentSymbol: Symbol | undefined;

    /**
     * Binds a `SourceFile` in the provided `BindingTable`.
     */
    public bindSourceFile(file: SourceFile, bindings: BindingTable, cancelable?: Cancelable): void {
        Cancelable.throwIfSignaled(cancelable);
        if (bindings.globals.resolveSymbol(file.filename, SymbolKind.SourceFile)) {
            // skip files that have already been bound.
            return;
        }

        const fileBindings = new BindingTable();
        const scope = fileBindings.globals;

        const symbol = this._declareSymbol(fileBindings, scope, file.filename, file, SymbolKind.SourceFile);
        this._bindChildren(fileBindings, file, symbol, scope);
        bindings._copyFrom(fileBindings);
    }

    private _bindProduction(bindings: BindingTable, scope: SymbolTable, node: Production): void {
        const symbol = this._declareSymbol(bindings, scope, node.name.text, node, SymbolKind.Production);
        const newScope = bindings._getScope(symbol);
        this._bindChildren(bindings, node, symbol, newScope);
    }

    private _bindParameter(bindings: BindingTable, scope: SymbolTable, node: Parameter): void {
        const symbol = this._declareSymbol(bindings, scope, node.name.text, node, SymbolKind.Parameter);
        this._bindChildren(bindings, node, symbol, scope);
    }

    private _bindChildren(bindings: BindingTable, parentNode: Node, parentSymbol: Symbol | undefined, scope: SymbolTable): void {
        const saveParentNode = this._parentNode;
        const saveParentSymbol = this._parentSymbol;
        this._parentNode = parentNode;
        this._parentSymbol = parentSymbol;

        for (const child of parentNode.children()) {
            this._bind(bindings, scope, child);
        }

        this._parentSymbol = saveParentSymbol;
        this._parentNode = saveParentNode;
    }

    private _bind(bindings: BindingTable, scope: SymbolTable, node: Node): void {
        if (node) {
            bindings._setParent(node, this._parentNode);
            switch (node.kind) {
                case SyntaxKind.Production:
                    this._bindProduction(bindings, scope, <Production>node);
                    break;

                case SyntaxKind.Parameter:
                    this._bindParameter(bindings, scope, <Parameter>node);
                    break;

                default:
                    this._bindChildren(bindings, node, this._parentSymbol, scope);
                    break;
            }
        }
    }

    private _declareSymbol(bindings: BindingTable, scope: SymbolTable, name: string | undefined, declaration: SourceFile | Production | Parameter, kind: SymbolKind): Symbol {
        const symbol = scope.declareSymbol(name, kind, this._parentSymbol);
        bindings._addDeclarationToSymbol(symbol, declaration);
        return symbol;
    }
}