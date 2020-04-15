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