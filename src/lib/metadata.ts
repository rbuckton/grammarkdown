import { Dict } from "./core";

const metadataProperty = "_metadata@" + Math.random().toString(16);

export function defineMetadata(target: any, key: string, value: any) {
    const view = getObjectMetadataView(target, /*create*/ true);
    Dict.set(view, key, value);
}

export function definePropertyMetadata(target: any, propertyKey: string, key: string, value: any) {
    const view = getPropertyMetadataView(target, propertyKey, /*create*/ true);
    Dict.set(view, key, value);
}

export function hasMetadata(target: any, key: string, options: { inherited?: boolean; } = {}) {
    for (let object = target; object; object = Object.getPrototypeOf(object)) {
        const view = getObjectMetadataView(target, /*create*/ false);
        if (view && Dict.has(view, key)) {
            return true;
        }

        if (!options.inherited) {
            break;
        }
    }

    return false;
}

export function getMetadata(target: any, key: string, options: { inherited?: boolean; } = {}) {
    for (let object = target; object; object = Object.getPrototypeOf(object)) {
        const view = getObjectMetadataView(target, /*create*/ false);
        if (view && Dict.has(view, key)) {
            return Dict.get(view, key);
        }

        if (!options.inherited) {
            break;
        }
    }

    return undefined;
}

export function hasPropertyMetadata(target: any, propertyKey: string, key: string, options: { inherited?: boolean; } = {}) {
    for (let object = target; object; object = Object.getPrototypeOf(object)) {
        const view = getPropertyMetadataView(target, propertyKey, /*create*/ false);
        if (view && Dict.has(view, key)) {
            return true;
        }

        if (!options.inherited) {
            break;
        }
    }

    return false;
}

export function getPropertyMetadata(target: any, propertyKey: string, key: string, options: { inherited?: boolean; } = {}) {
    for (let object = target; object; object = Object.getPrototypeOf(object)) {
        const view = getPropertyMetadataView(target, propertyKey, /*create*/ false);
        if (view && Dict.has(view, key)) {
            return Dict.get(view, key);
        }

        if (!options.inherited) {
            break;
        }
    }

    return undefined;
}

export function metadata(key: string, value: any) {
    return function (target: any, propertyKey?: string) {
        if (typeof propertyKey === "undefined") {
            defineMetadata(target, key, value);
        }
        else {
            definePropertyMetadata(target, propertyKey, key, value);
        }
    };
}

interface MetadataView {
    properties: Dict<Dict<any>>;
    metadata: Dict<any>;
}

function getMetadataView(target: any, create: boolean): MetadataView {
    if (!Object.prototype.hasOwnProperty.call(target, metadataProperty)) {
        if (!create) {
            return undefined;
        }

        Object.defineProperty(target, metadataProperty, {
            value: { }
        });
    }

    return target[metadataProperty];
}

function getObjectMetadataView(target: any, create: boolean): Dict<any> {
    const view = getMetadataView(target, create);
    if (view) {
        if (!view.metadata && create) {
            view.metadata = new Dict<any>();
        }
        return view.metadata;
    }
    return undefined;
}

function getPropertyMetadataView(target: any, name: string, create: boolean): Dict<any> {
    const view = getMetadataView(target, create);
    if (view) {
        if (!view.properties && create) {
            view.properties = new Dict<Dict<any>>();
        }
        if (view.properties) {
            if (!Dict.has(view.properties, name) && create) {
                Dict.set(view.properties, name, new Dict<any>());
            }
            return Dict.get(view.properties, name);
        }
    }

    return undefined;
}