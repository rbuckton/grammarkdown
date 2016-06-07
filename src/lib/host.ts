import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as url from "url";

export interface HostLike {
    normalizeFile?(file: string): string;
    resolveFile?(file: string, referer?: string): string;
    readFile(file: string): string;
}

export interface Host {
    normalizeFile(file: string): string;
    resolveFile(file: string, referer?: string): string;
    readFile(file: string): string;
}

export namespace Host {
    function getDefaultHost(): Host {
        const ignoreCase = /^(win32|win64|darwin)$/.test(os.platform());

        function normalizeFile(file: string): string {
            return ignoreCase ? file.toLowerCase() : file;
        }

        function isUri(file: string) {
            return !path.isAbsolute(file) && !!url.parse(file).protocol;
        }

        function isFileUri(file: string) {
            return /^file:\/\//.test(file);
        }

        function getLocalPath(file: string): string {
            if (/^file:\/\//.test(file)) {
                const parsed = url.parse(file);
                if (parsed.hostname) {
                    file = `//${parsed.hostname}${decodeURIComponent(parsed.path)}`;
                }
                else {
                    file = decodeURIComponent(parsed.path).substr(1);
                }
            }

            return file;
        }

        function resolveFile(file: string, referer?: string): string {
            let result: string;
            if (isFileUri(file) || path.isAbsolute(file)) {
                result = file;
            }
            else if (referer) {
                result = isFileUri(referer)
                    ? url.resolve(referer, file)
                    : path.resolve(path.dirname(referer), file);
            }
            else {
                result = path.resolve(file);
            }

            result = result.replace(/\\/g, "/");
            return result;
        }

        function readFile(file: string): string {
            file = getLocalPath(file);
            if (isUri(file)) {
                return undefined;
            }

            try {
                return fs.readFileSync(file, "utf8");
            }
            catch (e) {
                return undefined;
            }
        }

        return {
            normalizeFile,
            resolveFile,
            readFile
        };
    }

    export function getHost(): Host;
    export function getHost(hostLike: HostLike): Host;
    export function getHost(readFile: (file: string) => string): Host;
    export function getHost(readFileOrHostLike: ((file: string) => string) | HostLike): Host;
    export function getHost(readFileOrHostLike?: ((file: string) => string) | HostLike): Host {
        const host = getDefaultHost();
        if (typeof readFileOrHostLike === "function") {
            host.readFile = <(file: string) => string>readFileOrHostLike;
        }
        else if (typeof readFileOrHostLike === "object") {
            const hostLike = <HostLike>readFileOrHostLike;
            if ("normalizeFile" in hostLike) {
                host.normalizeFile = file => hostLike.normalizeFile(file);
            }
            if ("resolveFile" in hostLike) {
                host.resolveFile = (file, referer) => hostLike.resolveFile(file, referer);
            }
            if ("readFile" in hostLike) {
                host.readFile = file => hostLike.readFile(file);
            }
        }
        return host;
    }
}