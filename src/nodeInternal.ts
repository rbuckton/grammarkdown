/*!
 * Copyright (c) 2021 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import type { TriviaKind } from "./tokens";
import type { Node, Trivia, TriviaBase, SourceFile } from "./nodes";
import type { NodeVisitor } from "./visitor";
import type { DiagnosticMessages } from "./diagnostics";

interface NodeAccessor {
    setTextRange(node: Node, pos: number, end: number): void;
    setDetachedTrivia(node: Node, trivia: readonly Trivia[] | undefined): void;
    setLeadingTrivia(node: Node, trivia: readonly Trivia[] | undefined): void;
    setTrailingTrivia(node: Node, trivia: readonly Trivia[] | undefined): void;
    edgeCount(node: Node): number;
    edgeName(node: Node, offset: number): string | undefined;
    edgeValue(node: Node, offset: number): Node | ReadonlyArray<Node> | undefined;
    accept(node: Node, visitor: NodeVisitor): Node;
}

interface TriviaAccessor {
    setPrecedingFields(
        node: TriviaBase<TriviaKind>,
        hasPrecedingLineTerminator: boolean,
        hasPrecedingBlankLine: boolean,
        hasPrecedingWhiteSpace: boolean,
    ): void;
    setFollowingFields(
        node: TriviaBase<TriviaKind>,
        hasFollowingLineTerminator: boolean,
        hasFollowingBlankLine: boolean,
        hasFollowingWhiteSpace: boolean,
    ): void;
}

interface SourceFileAccessor {
    setImports(node: SourceFile, imports: readonly string[] | undefined): void;
    setParseDiagnostics(node: SourceFile, parseDiagnostics: DiagnosticMessages | undefined): void;
    getParseDiagnostics(node: SourceFile): DiagnosticMessages | undefined;
}

let nodeAccessor: NodeAccessor | undefined;
let triviaAccessor: TriviaAccessor | undefined;
let sourceFileAccessor: SourceFileAccessor | undefined;

/* @internal */
export function setNodeAccessor(accessor: NodeAccessor) { nodeAccessor = accessor; }

/* @internal */
export function getNodeAccessor() {
    if (!nodeAccessor) throw new TypeError("Accessor not set");
    return nodeAccessor;
}


/* @internal */
export function setTriviaAccessor(accessor: TriviaAccessor) { triviaAccessor = accessor; }

/* @internal */
export function getTriviaAccessor() {
    if (!triviaAccessor) throw new TypeError("Accessor not set");
    return triviaAccessor;
}


/* @internal */
export function setSourceFileAccessor(accessor: SourceFileAccessor) { sourceFileAccessor = accessor; }

/* @internal */
export function getSourceFileAccessor() {
    if (!sourceFileAccessor) throw new TypeError("Accessor not set");
    return sourceFileAccessor;
}