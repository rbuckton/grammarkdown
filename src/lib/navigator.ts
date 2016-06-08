import {
    SourceFile,
    NodeEdge,
    Node,
} from "./nodes";
import {
    Position,
    Range,
    Dict,
} from "./core";
import {
    SyntaxKind
} from "./tokens";

export class NodeNavigator {
    private sourceFile: SourceFile;
    private nodeStack: Node[];
    private shapeStack: NodeEdge[][];
    private edgeStack: number[];
    private arrayStack: Node[][];
    private offsetStack: number[];
    private currentDepth: number;
    private currentNode: Node;
    private currentEdge: number;
    private currentShape: NodeEdge[];
    private currentOffset: number;
    private currentArray: Node[];
    private parentNode: Node;
    private parentShape: NodeEdge[];
    private hasAnyChildren: boolean;
    private copyOnNavigate: boolean;

    constructor(sourceFile: SourceFile);
    constructor(other: NodeNavigator);
    constructor(sourceFileOrNavigator: SourceFile | NodeNavigator) {
        if (sourceFileOrNavigator instanceof NodeNavigator) {
            const navigator = <NodeNavigator>sourceFileOrNavigator;
            this.initialize(
                navigator.sourceFile,
                navigator.nodeStack.slice(),
                navigator.shapeStack.slice(),
                navigator.edgeStack.slice(),
                navigator.arrayStack.slice(),
                navigator.offsetStack.slice());
        }
        else {
            const sourceFile = <SourceFile>sourceFileOrNavigator;
            this.initialize(sourceFile, [sourceFile], [sourceFile.getEdges()], [-1], [undefined], [0]);
        }
    }

    private initialize(sourceFile: SourceFile, nodeStack: Node[], shapeStack: NodeEdge[][], edgeStack: number[], arrayStack: Node[][], offsetStack: number[]) {
        this.sourceFile = sourceFile;
        this.nodeStack = nodeStack;
        this.shapeStack = shapeStack;
        this.edgeStack = edgeStack;
        this.arrayStack = arrayStack;
        this.offsetStack = offsetStack;
        this.currentDepth = nodeStack.length - 1;
        this.afterNavigate();
    }

    public clone(): NodeNavigator {
        return new NodeNavigator(this);
    }

    public getRoot(): SourceFile {
        return this.sourceFile;
    }

    public getParent(): Node {
        return this.parentNode;
    }

    public getNode() {
        return this.currentNode;
    }

    public getKind() {
        return this.currentNode.kind;
    }

    public getName(): string {
        const edge = this.getEdge();
        return edge ? edge.name : undefined;
    }

    public getArray(): Node[] {
        return this.currentArray;
    }

    public getOffset(): number {
        return this.currentOffset;
    }

    public getDepth(): number {
        return this.currentDepth;
    }

    public isArray(): boolean {
        return this.currentArray !== undefined;
    }

    public hasChildren(predicate?: (node: Node) => boolean): boolean {
        if (this.hasAnyChildren === undefined) {
            return this.hasAnyChildren = this.hasChild(predicate || matchAny);
        }

        return this.hasAnyChildren;
    }

    private hasChild(predicate: (node: Node) => boolean): boolean {
        if (this.hasAnyChildren === false) {
            return false;
        }

        for (let nextEdge = 0; nextEdge < this.currentShape.length; nextEdge++) {
            const edge = this.currentShape[nextEdge];
            if (edge) {
                if (edge.isArray) {
                    const nextArray = edge.readArray(this.currentNode);
                    if (nextArray) {
                        for (let nextOffset = 0; nextOffset < nextArray.length; nextOffset++) {
                            const nextNode = nextArray[nextOffset];
                            if (nextNode && predicate(nextNode)) {
                                return this.hasAnyChildren = true;
                            }
                        }
                    }
                }
                else {
                    const nextNode = edge.read(this.currentNode);
                    if (nextNode && predicate(nextNode)) {
                        return this.hasAnyChildren = true;
                    }
                }
            }
        }

        return false;
    }

    public hasAncestor(predicate?: (node: Node) => boolean): boolean {
        for (let nextDepth = this.currentDepth - 1; nextDepth >= 0; nextDepth--) {
            const nextNode = this.nodeStack[nextDepth];
            if (!predicate || predicate(nextNode)) {
                return true;
            }
        }

        return false;
    }

    public isSamePosition(other: NodeNavigator) {
        if (this === other) {
            return true;
        }

        return this.sourceFile === other.sourceFile
            && this.currentNode === other.currentNode
            && this.currentDepth === other.currentDepth
            && this.currentEdge === other.currentEdge
            && this.currentOffset === other.currentOffset;
    }

    public moveToPosition(position: Position) {
        const pos = this.sourceFile.lineMap.getPositionOfLineAndCharacter(position);
        const currentDepth = this.currentDepth;
        const nodeStack = this.nodeStack;
        const shapeStack = this.shapeStack;
        const edgeStack = this.edgeStack;
        const arrayStack = this.arrayStack;
        const offsetStack = this.offsetStack;
        const hasChild = this.hasAnyChildren;

        this.copyOnNavigate = true;
        this.moveToRoot();
        if (this.moveToPositionWorker(pos)) {
            return true;
        }

        this.currentDepth = currentDepth;
        this.nodeStack = nodeStack;
        this.shapeStack = shapeStack;
        this.edgeStack = edgeStack;
        this.arrayStack = arrayStack;
        this.offsetStack = offsetStack;
        this.hasAnyChildren = hasChild;
        this.afterNavigate();
        return false;
    }

    private moveToPositionWorker(pos: number) {
        if (pos >= this.currentNode.pos && pos < this.currentNode.end) {
            if (this.moveToFirstChild()) {
                do {
                    if (this.moveToPositionWorker(pos)) {
                        return true;
                    }
                }
                while (this.moveToNextSibling());
                this.moveToParent();
            }

            return true;
        }

        return false;
    }

    public moveTo(other: NodeNavigator) {
        if (this === other) {
            return true;
        }

        if (this.sourceFile !== other.sourceFile) {
            return false;
        }

        this.currentDepth = other.currentDepth;
        this.nodeStack = other.nodeStack.slice();
        this.shapeStack = other.shapeStack.slice();
        this.edgeStack = other.edgeStack.slice();
        this.arrayStack = other.arrayStack.slice();
        this.offsetStack = other.offsetStack.slice();
        this.afterNavigate();
        return true;
    }

    public moveToRoot(): boolean {
        if (this.currentDepth > 0) {
            this.beforeNavigate();
            this.reset();
            this.afterNavigate();
        }

        return true;
    }

    public moveToParent(predicate?: (node: Node) => boolean): boolean {
        if (this.currentDepth > 0) {
            if (!predicate || predicate(this.parentNode)) {
                this.beforeNavigate();
                this.popEdge();
                this.afterNavigate();
                return true;
            }
        }

        return false;
    }

    public moveToAncestorOrSelf(predicate: (node: Node) => boolean): boolean {
        return predicate(this.currentNode)
            || this.moveToAncestor(predicate);
    }

    public moveToAncestor(predicate: (node: Node) => boolean): boolean {
        for (let nextDepth = this.currentDepth - 1; nextDepth >= 0; nextDepth--) {
            const nextNode = this.nodeStack[nextDepth];
            if (predicate(nextNode)) {
                this.beforeNavigate();
                while (this.currentDepth !== nextDepth) {
                    this.popEdge();
                }
                this.afterNavigate();
                return true;
            }
        }

        return false;
    }

    public moveToSourceElement(): boolean {
        return this.moveToParent(matchSourceElement);
    }

    public moveToDeclaration(): boolean {
        return this.moveToParent(matchParameter)
            || this.moveToParent(matchProduction);
    }

    public moveToName(): boolean {
        if (this.getKind() === SyntaxKind.Identifier) {
            return true;
        }
        else {
            const navigator = this.clone();
            if (navigator.moveToAncestorOrSelf(matchParameter)
                && navigator.moveToFirstChild("name")) {
                return this.moveTo(navigator);
            }

            navigator.moveTo(this);
            if (navigator.moveToAncestorOrSelf(matchArgument)
                && navigator.moveToFirstChild("name")) {
                return this.moveTo(navigator);
            }

            navigator.moveTo(this);
            if (navigator.moveToAncestorOrSelf(matchNonterminal)
                && navigator.moveToFirstChild("name")) {
                return this.moveTo(navigator);
            }

            navigator.moveTo(this);
            if (!navigator.hasAncestor(matchProductionBody)
                && navigator.moveToAncestorOrSelf(matchProduction)
                && navigator.moveToFirstChild("name")) {
                return this.moveTo(navigator);
            }

            navigator.moveTo(this);
            if (navigator.moveToAncestorOrSelf(matchParameterValueAssertion)
                && navigator.moveToFirstChild("name")) {
                return this.moveTo(navigator);
            }
        }

        return false;
    }

    public moveToFirstChild(): boolean;
    public moveToFirstChild(name: string): boolean;
    public moveToFirstChild(predicate: (node: Node) => boolean): boolean;
    public moveToFirstChild(predicateOrName?: string | ((node: Node) => boolean)): boolean {
        return this.moveToChild(Navigation.first, Navigation.next, predicateOrName);
    }

    public moveToLastChild(): boolean;
    public moveToLastChild(name: string): boolean;
    public moveToLastChild(predicate: (node: Node) => boolean): boolean;
    public moveToLastChild(predicateOrName?: string | ((node: Node) => boolean)): boolean {
        return this.moveToChild(Navigation.last, Navigation.previous, predicateOrName);
    }

    public moveToFirstElement(predicate?: (node: Node) => boolean): boolean {
        return this.moveToElement(Navigation.first, Navigation.next, this.currentArray, this.currentOffset, predicate);
    }

    public moveToPreviousElement(predicate?: (node: Node) => boolean): boolean {
        return this.moveToElement(Navigation.previous, Navigation.previous, this.currentArray, this.currentOffset, predicate);
    }

    public moveToNextElement(predicate?: (node: Node) => boolean): boolean {
        return this.moveToElement(Navigation.next, Navigation.next, this.currentArray, this.currentOffset, predicate);
    }

    public moveToLastElement(predicate?: (node: Node) => boolean): boolean {
        return this.moveToElement(Navigation.last, Navigation.previous, this.currentArray, this.currentOffset, predicate);
    }

    public moveToFirstSibling(): boolean;
    public moveToFirstSibling(name: string): boolean;
    public moveToFirstSibling(predicate: (node: Node) => boolean): boolean;
    public moveToFirstSibling(predicateOrName?: string | ((node: Node) => boolean)): boolean {
        return this.moveToSibling(Navigation.first, undefined, Navigation.first, Navigation.next, predicateOrName);
    }

    public moveToPreviousSibling(): boolean;
    public moveToPreviousSibling(name: string): boolean;
    public moveToPreviousSibling(predicate: (node: Node) => boolean): boolean;
    public moveToPreviousSibling(predicateOrName?: string | ((node: Node) => boolean)): boolean {
        return this.moveToSibling(Navigation.previous, Navigation.previous, Navigation.last, Navigation.previous, predicateOrName);
    }

    public moveToNextSibling(): boolean;
    public moveToNextSibling(name: string): boolean;
    public moveToNextSibling(predicate: (node: Node) => boolean): boolean;
    public moveToNextSibling(predicateOrName?: string | ((node: Node) => boolean)): boolean {
        return this.moveToSibling(Navigation.next, Navigation.next, Navigation.first, Navigation.next, predicateOrName);
    }

    public moveToLastSibling(): boolean;
    public moveToLastSibling(name: string): boolean;
    public moveToLastSibling(predicate: (node: Node) => boolean): boolean;
    public moveToLastSibling(predicateOrName?: string | ((node: Node) => boolean)): boolean {
        return this.moveToSibling(Navigation.last, undefined, Navigation.last, Navigation.previous, predicateOrName);
    }

    private getEdge() {
        return this.parentShape ? this.parentShape[this.currentEdge] : undefined;
    }

    private beforeNavigate() {
        if (this.copyOnNavigate) {
            this.nodeStack = this.nodeStack.slice();
            this.shapeStack = this.shapeStack.slice();
            this.edgeStack = this.edgeStack.slice();
            this.arrayStack = this.arrayStack.slice();
            this.offsetStack = this.offsetStack.slice();
            this.copyOnNavigate = false;
        }
    }

    private afterNavigate() {
        this.currentNode = this.nodeStack[this.currentDepth];
        this.currentShape = this.shapeStack[this.currentDepth];
        this.currentEdge = this.edgeStack[this.currentDepth];
        this.currentArray = this.arrayStack[this.currentDepth];
        this.currentOffset = this.offsetStack[this.currentDepth];
        this.parentNode = this.currentDepth > 0 ? this.nodeStack[this.currentDepth - 1]: undefined;
        this.parentShape = this.currentDepth > 0 ? this.shapeStack[this.currentDepth - 1]: undefined;
        this.copyOnNavigate = false;
    }

    private pushEdge() {
        this.nodeStack.push(undefined);
        this.shapeStack.push(undefined);
        this.edgeStack.push(undefined);
        this.arrayStack.push(undefined);
        this.offsetStack.push(1);
        this.hasAnyChildren = undefined;
        this.currentDepth++;
    }

    private setEdge(node: Node, edge: number, array: Node[], offset: number) {
        this.nodeStack[this.currentDepth] = node;
        this.shapeStack[this.currentDepth] = node.getEdges();
        this.edgeStack[this.currentDepth] = edge;
        this.arrayStack[this.currentDepth] = array;
        this.offsetStack[this.currentDepth] = offset;
        this.hasAnyChildren = undefined;
    }

    private popEdge() {
        this.currentDepth--;
        this.nodeStack.pop();
        this.shapeStack.pop();
        this.edgeStack.pop();
        this.arrayStack.pop();
        this.offsetStack.pop();
        this.hasAnyChildren = this.currentNode !== undefined;
    }

    private moveToChild(initializer: SeekOperation, seekDirection: SeekOperation, predicateOrName: string | ((node: Node) => boolean)) {
        const predicate: (node: Node) => boolean = typeof predicateOrName === "function" ? predicateOrName : undefined;
        const name: string = typeof predicateOrName === "string" ? predicateOrName : undefined;
        const offset = this.currentEdge;
        const length = this.currentShape.length;
        for (let nextEdge = initializer(offset, length); bounded(nextEdge, length); nextEdge = seekDirection(nextEdge, length)) {
            const edge = this.currentShape[nextEdge];
            if (edge && (!name || edge.name === name)) {
                if (edge.isArray) {
                    const nextArray = edge.readArray(this.currentNode);
                    if (nextArray) {
                        const length = nextArray.length;
                        for (let nextOffset = initializer(0, length); bounded(nextOffset, length); nextOffset = seekDirection(nextOffset, length)) {
                            const nextNode = nextArray[nextOffset];
                            if (nextNode && (!predicate || predicate(nextNode))) {
                                this.beforeNavigate();
                                this.pushEdge();
                                this.setEdge(nextNode, nextEdge, nextArray, nextOffset);
                                this.afterNavigate();
                                return true;
                            }
                        }
                    }
                }
                else {
                    const nextNode = edge.read(this.currentNode);
                    if (nextNode && (!predicate || predicate(nextNode))) {
                        this.beforeNavigate();
                        this.pushEdge();
                        this.setEdge(nextNode, nextEdge, /*array*/ undefined, /*offset*/ undefined);
                        this.afterNavigate();
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private moveToElement(currentArrayInitializer: SeekOperation, seekDirection: SeekOperation, currentArray: Node[], currentOffset: number, predicateOrName: string | ((node: Node) => boolean)) {
        const predicate: (node: Node) => boolean = typeof predicateOrName === "function" ? predicateOrName : undefined;
        if (currentArray) {
            const offset = currentOffset;
            const length = currentArray.length;
            for (let nextOffset = currentArrayInitializer(offset, length); bounded(nextOffset, length); nextOffset = seekDirection(nextOffset, length)) {
                const nextNode = currentArray[nextOffset];
                if (nextNode && (!predicate || predicate(nextNode))) {
                    this.beforeNavigate();
                    this.setEdge(nextNode, this.currentEdge, currentArray, nextOffset);
                    this.afterNavigate();
                    return true;
                }
            }
        }

        return false;
    }

    private moveToSibling(currentEdgeInitializer: SeekOperation, currentArrayInitializer: SeekOperation, nextArrayInitializer: SeekOperation, seekDirection: SeekOperation, predicateOrName: string | ((node: Node) => boolean)) {
        const predicate: (node: Node) => boolean = typeof predicateOrName === "function" ? predicateOrName : undefined;
        const name: string = typeof predicateOrName === "string" ? predicateOrName : undefined;
        if (this.currentDepth > 0) {
            if (currentArrayInitializer && this.moveToElement(currentArrayInitializer, seekDirection, this.currentArray, this.currentOffset, predicateOrName)) {
                return true;
            }

            const offset = this.currentEdge;
            const length = this.parentShape.length;
            for (let nextEdge = currentEdgeInitializer(offset, length); bounded(nextEdge, length); nextEdge = seekDirection(nextEdge, length)) {
                const edge = this.parentShape[nextEdge];
                if (edge && (!name || edge.name === name)) {
                    if (edge.isArray) {
                        const nextArray = edge.readArray(this.parentNode);
                        if (nextArray) {
                            if (this.moveToElement(nextArrayInitializer, seekDirection, nextArray, 0, predicateOrName)) {
                                return true;
                            }
                        }
                    }
                    else {
                        const nextNode = edge.read(this.parentNode);
                        if (nextNode && (!predicate || predicate(nextNode))) {
                            this.beforeNavigate();
                            this.setEdge(nextNode, nextEdge, /*array*/ undefined, /*offset*/ undefined);
                            this.afterNavigate();
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    private reset() {
        this.currentDepth = 0;
        this.nodeStack.length = 1;
        this.shapeStack.length = 1;
        this.edgeStack.length = 1;
        this.arrayStack.length = 1;
        this.offsetStack.length = 1;
    }

    // private seekElement(array: Node[],
    //     init: (current: number, length: number) => number,
    //     advance: (offset: number) => number,
    //     beforeNavigate: (nav: NodeNavigator) => void,
    //     afterNavigate: (nav: NodeNavigator) => void) {
    //     if (array) {
    //         let length = array.length;
    //         let nextOffset = init(this.currentOffset, length);
    //         while (nextOffset >= 0 && nextOffset < length) {
    //             let nextNode = array[nextOffset];
    //             if (nextNode) {
    //                 if (nextOffset !== this.currentOffset) {
    //                     beforeNavigate(this);
    //                     this.offsetStack[this.currentDepth] = this.currentOffset = nextOffset;
    //                     this.shapeStack[this.currentDepth] = this.currentShape = array[nextOffset].getEdges();
    //                     this.nodeStack[this.currentDepth] = this.currentNode = array[nextOffset];
    //                     afterNavigate(this);
    //                 }

    //                 return true;
    //             }

    //             nextOffset = advance(nextOffset);
    //         }
    //     }

    //     return false;
    // }

    // private seekSibling(
    //     parentShape: NodeEdge[],
    //     parentNode: Node,
    //     init: (current: number, length: number) => number,
    //     advance: (offset: number) => number,
    //     beforeNavigate: (nav: NodeNavigator) => void,
    //     afterNavigate: (nav: NodeNavigator) => void, name: string,
    //     initOffset?: (current: number, length: number) => number,
    //     advanceOffset?: (offset: number) => number) {
    //     if (parentShape) {
    //         let length = parentShape.length;
    //         let nextEdge = init(this.currentEdge, length);
    //         while (nextEdge >= 0 && nextEdge < length) {
    //             let edge = parentShape[nextEdge];
    //             if (edge && (!name || edge.name === name)) {
    //                 if (edge.isArray) {
    //                     let nextArray = edge.readArray(parentNode);
    //                     if (this.seekElement(
    //                         nextArray,
    //                         initOffset || NodeNavigator.seekFirst,
    //                         advanceOffset || NodeNavigator.increment,
    //                         beforeNavigate,
    //                         NodeNavigator.nop)) {
    //                         if (nextEdge !== this.currentEdge || this.positionChanged) {
    //                             beforeNavigate(this);
    //                             this.edgeStack[this.currentDepth] = nextEdge;
    //                             this.arrayStack[this.currentDepth] = nextArray;
    //                             afterNavigate(this);
    //                         }
    //                         return true;
    //                     }
    //                 }
    //                 else {
    //                     let nextNode = edge.read(parentNode);
    //                     if (nextNode) {
    //                         if (nextEdge !== this.currentEdge) {
    //                             beforeNavigate(this);
    //                             this.offsetStack[this.currentDepth] = -1;
    //                             this.nodeStack[this.currentDepth] = nextNode;
    //                             this.edgeStack[this.currentDepth] = nextEdge;
    //                             this.shapeStack[this.currentDepth] = nextNode.getEdges();
    //                             this.arrayStack[this.currentDepth] = undefined;
    //                             afterNavigate(this);
    //                         }
    //                         return true;
    //                     }
    //                 }
    //             }

    //             nextEdge = advance(nextEdge);
    //         }
    //     }

    //     return false;
    // }
}

type SeekOperation = (offset: number, length: number) => number;

namespace Navigation {
    export function first(offset: number, length: number) {
        return 0;
    }

    export function previous(offset: number, length: number) {
        return offset - 1;
    }

    export function same(offset: number, length: number) {
        return offset;
    }

    export function next(offset: number, length: number) {
        return offset + 1;
    }

    export function last(offset: number, length: number) {
        return length - 1;
    }
}

function bounded(offset: number, length: number) {
    return offset >= 0 && offset < length;
}

function matchAny(node: Node) {
    return true;
}

function matchParameter(node: Node) {
    return node.kind === SyntaxKind.Parameter;
}

function matchProduction(node: Node) {
    return node.kind === SyntaxKind.Production;
}

function matchNonterminal(node: Node) {
    return node.kind === SyntaxKind.Nonterminal;
}

function matchArgument(node: Node) {
    return node.kind === SyntaxKind.Argument;
}

function matchProductionBody(node: Node) {
    return node.kind === SyntaxKind.OneOfList
        || node.kind === SyntaxKind.RightHandSideList
        || node.kind === SyntaxKind.RightHandSide;
}

function matchParameterValueAssertion(node: Node) {
    return node.kind === SyntaxKind.ParameterValueAssertion;
}

function matchSourceElement(node: Node) {
    return node.kind === SyntaxKind.Import
        || node.kind === SyntaxKind.Production;
}