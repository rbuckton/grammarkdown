/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

export { TextRange, Position, Range } from "./core";
export {
    ReadFileCallback,
    ReadFileSyncCallback,
    WriteFileCallback,
    WriteFileSyncCallback,
    LegacyReadFileCallback,
    LegacyReadFileSyncCallback,
    LegacyWriteFileCallback,
    LegacyWriteFileSyncCallback,
    HostBaseOptions,
    HostBase,
    CoreSyncHostOptions,
    CoreSyncHost,
    CoreAsyncHostOptions,
    CoreAsyncHost,
    StringSyncHost,
    StringAsyncHost,
    /** @deprecated */ StringSyncHost as SyncSingleFileHost,
    /** @deprecated */ StringAsyncHost as AsyncSingleFileHost,
} from "./host";
export {
    NodeSyncHost,
    NodeSyncHostOptions,
    NodeAsyncHost,
    NodeAsyncHostOptions,
    /** @deprecated */ NodeSyncHost as SyncHost,
    /** @deprecated */ NodeSyncHostOptions as SyncHostOptions,
    /** @deprecated */ NodeAsyncHost as AsyncHost,
    /** @deprecated */ NodeAsyncHostOptions as AsyncHostOptions,
    /** @deprecated */ Host,
    /** @deprecated */ HostOptions,
    /** @deprecated */ SingleFileHost
} from "./hosts/node";
export * from "./diagnostics";
export {
    CompilerOptions,
    EmitFormat,
    NewLineKind,
    getDefaultOptions,
} from "./options";
export * from "./tokens";
export * from "./nodes";
export * from "./symbols";
export * from "./scanner";
export * from "./parser";
export * from "./binder";
export * from "./checker";
export * from "./emitter/index";
export * from "./stringwriter";
export * from "./grammar";
export * from "./navigator";
export * from "./visitor";