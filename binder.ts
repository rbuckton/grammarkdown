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
import { SyntaxKind } from "./core";
import { 
    BindingTable,
    SymbolKind, 
    SymbolTable,
    SourceFile,
    Production,
    Definition,
    Import,
    Parameter,
    Node,
    forEachChild
} from "./nodes";

export class Binder {
    private parent: Node;
    private bindings: BindingTable;
    private scope: SymbolTable;

    constructor(bindings: BindingTable) {
        this.bindings = bindings;
    }

    public bindSourceFile(file: SourceFile): void {
        this.bindChildren(file, true);
    }

    private declareSymbol(name: string, declaration: Node, kind: SymbolKind): void {
        var symbol = this.scope.declareSymbol(name, kind);
        this.bindings.addDeclarationToSymbol(symbol, declaration);
    }

    private bindProduction(node: Production): void {
        this.declareSymbol(node.name.text, node, SymbolKind.Production);
        this.bindChildren(node, /*hasLocals*/ true);
    }

    private bindDefinition(node: Definition): void {
        this.declareSymbol(node.type.name.text, node, SymbolKind.Type);
        this.bindChildren(node, /*hasLocals*/ false);
    }

    private bindImport(node: Import): void {
        if (node.type) {
            this.declareSymbol(node.type.name.text, node, SymbolKind.Type);
        }

        this.bindChildren(node, /*hasLocals*/ false);
    }

    private bindParameter(node: Parameter): void {
        this.declareSymbol(node.name.text, node, SymbolKind.Parameter);
        this.bindChildren(node, /*hasLocals*/ false);
    }

    private bindChildren(node: Node, hasLocals: boolean): void {
        var saveParent = this.parent;
        var saveScope = this.scope;
        if (hasLocals) {
            node.locals = new SymbolTable();
            this.scope = node.locals;
        }
        this.parent = node;
        forEachChild(node, child => this.bind(child));
        this.scope = saveScope;
        this.parent = saveParent;
    }

    private bind(node: Node): void {
        if (node) {
            this.bindings.setParent(node, this.parent);
            switch (node.kind) {
                case SyntaxKind.Production:
                    this.bindProduction(<Production>node);
                    break;

                case SyntaxKind.Definition:
                    this.bindDefinition(<Definition>node);
                    break;

                case SyntaxKind.Import:
                    this.bindImport(<Import>node);
                    break;

                case SyntaxKind.Parameter:
                    this.bindParameter(<Parameter>node);
                    break;

                default:
                    this.bindChildren(node, /*hasLocals*/ false);
                    break;
            }
        }
    }
}