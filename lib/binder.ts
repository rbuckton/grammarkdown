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
import { Dict } from "./core";
import { SyntaxKind } from "./tokens";
import { Symbol, SymbolKind, SymbolTable } from "./symbols";
import { SourceFile, Production, Parameter, Node, forEachChild } from "./nodes";

export class BindingTable {
    public globals: SymbolTable = new SymbolTable();
    
    private parentNodes: Node[];
    private nodes: Node[];
    private nodeMap: Symbol[];
    private symbolLocals: SymbolTable[];
    private symbolDeclarations: Node[][];

    public setParent(node: Node, parent: Node): void {
        if (node && parent) {
            if (!this.parentNodes) {
                this.parentNodes = [];
            }
            
            this.parentNodes[node.id] = parent;
        }
    }

    public hasParent(node: Node): boolean {
        return !!(node && this.parentNodes && node.id in this.parentNodes);
    }

    public getParent(node: Node): Node {
        return node && this.parentNodes && this.parentNodes[node.id];
    }
    
    public getAncestor(node: Node, kind: SyntaxKind): Node {
        for (let parent = this.getParent(node); parent; parent = this.getParent(parent)) {
            if (parent.kind === kind) {
                return parent;
            }
        }
        
        return undefined;
    }

    public setSymbol(node: Node, symbol: Symbol): void {
        if (node && symbol) {
            if (!this.nodeMap) {
                this.nodeMap = [];
            }
            
            this.nodeMap[node.id] = symbol;
        }
    }

    public hasSymbol(node: Node): boolean {
        return !!(node && this.nodeMap && node.id in this.nodeMap);
    }

    public getSymbol(node: Node): Symbol {
        if (node && this.nodeMap) {
            return this.nodeMap[node.id];
        }
        
        return undefined;
    }

    public addDeclarationToSymbol(symbol: Symbol, node: Node): void {
        if (symbol && node) {
            if (!this.symbolDeclarations) {
                this.symbolDeclarations = [];
            }

            let declarations: Node[];
            if (symbol.id in this.symbolDeclarations) {
                declarations = this.symbolDeclarations[symbol.id];
            }
            else {
                declarations = [];
                this.symbolDeclarations[symbol.id] = declarations;
            }

            declarations.push(node);
            this.setSymbol(node, symbol);
        }
    }

    public getDeclarations(symbol: Symbol): Node[] {
        let declarations: Node[];
        if (symbol && this.symbolDeclarations) {
            declarations = this.symbolDeclarations[symbol.id];
        }
        
        if (declarations) {
            return declarations;
        }
        
        return [];
    }
    
    public getScope(container: Symbol): SymbolTable {
        if (!this.symbolLocals) {
            this.symbolLocals = [];
        }
        
        let scope = this.symbolLocals[container.id];
        if (!scope) {
            scope = new SymbolTable();
            this.symbolLocals[container.id] = scope;
        }
        
        return scope;
    }
    
    public resolveSymbol(location: Node, name: string, meaning: SymbolKind): Symbol {
        if (this.symbolLocals) {
            while (location) {
                if (location.kind === SyntaxKind.SourceFile) {
                    let result = this.globals.resolveSymbol(name, meaning);
                    if (result) {
                        return result;
                    }
                    
                    break;
                }
                
                let symbol = this.getSymbol(location);
                let locals = symbol ? this.symbolLocals[symbol.id] : undefined;
                if (locals) {
                    let result = locals.resolveSymbol(name, meaning);
                    if (result) {
                        return result;
                    }
                }
                
                location = this.getParent(location);
            }
        }
        
        return undefined;
    }
}

export class Binder {
    private parentNode: Node;
    private parentSymbol: Symbol;
    private bindings: BindingTable;
    private scope: SymbolTable;
    
    constructor(bindings: BindingTable) {
        this.bindings = bindings;
        this.scope = bindings.globals;
    }

    public bindSourceFile(file: SourceFile): void {
        if (this.scope.resolveSymbol(file.filename, SymbolKind.SourceFile)) {
            // skip files that have already been bound.
            return;
        }
        
        let symbol = this.declareSymbol(file.filename, file, SymbolKind.SourceFile);
        this.bindChildren(file, symbol, this.scope);
    }

    private bindProduction(node: Production): void {
        let symbol = this.declareSymbol(node.name.text, node, SymbolKind.Production);
        let scope = this.bindings.getScope(symbol);
        this.bindChildren(node, symbol, scope);
    }

    private bindParameter(node: Parameter): void {
        let symbol = this.declareSymbol(node.name.text, node, SymbolKind.Parameter);
        this.bindChildren(node, this.parentSymbol, this.scope);
    }

    private bindChildren(parentNode: Node, parentSymbol: Symbol, scope: SymbolTable): void {
        let saveParentNode = this.parentNode;
        let saveParentSymbol = this.parentSymbol;
        let saveScope = this.scope;
        this.parentNode = parentNode;
        this.parentSymbol = parentSymbol;
        this.scope = scope;
        
        forEachChild(parentNode, child => this.bind(child));
        
        this.scope = saveScope;
        this.parentSymbol = saveParentSymbol;
        this.parentNode = saveParentNode;
    }

    private bind(node: Node): void {
        if (node) {
            this.bindings.setParent(node, this.parentNode);
            switch (node.kind) {
                case SyntaxKind.Production:
                    this.bindProduction(<Production>node);
                    break;

                case SyntaxKind.Parameter:
                    this.bindParameter(<Parameter>node);
                    break;

                default:
                    this.bindChildren(node, this.parentSymbol, this.scope);
                    break;
            }
        }
    }

    private declareSymbol(name: string, declaration: Node, kind: SymbolKind): Symbol {
        let symbol = this.scope.declareSymbol(name, kind, this.parentSymbol);
        this.bindings.addDeclarationToSymbol(symbol, declaration);
        return symbol;
    }
}