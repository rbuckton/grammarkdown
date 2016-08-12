import { Dictionary } from "./core";

const metadataProperty = "_metadata@" + Math.random().toString(16);

export function defineMetadata(target: any, key: string, value: any) {
    const view = getObjectMetadataView(target, /*create*/ true);
    Dictionary.set(view, key, value);
}

export function definePropertyMetadata(target: any, propertyKey: string, key: string, value: any) {
    const view = getPropertyMetadataView(target, propertyKey, /*create*/ true);
    Dictionary.set(view, key, value);
}

export function hasMetadata(target: any, key: string, options: { inherited?: boolean; } = {}) {
    for (let object = target; object; object = Object.getPrototypeOf(object)) {
        const view = getObjectMetadataView(target, /*create*/ false);
        if (view && Dictionary.has(view, key)) {
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
        if (view && Dictionary.has(view, key)) {
            return Dictionary.get(view, key);
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
        if (view && Dictionary.has(view, key)) {
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
        if (view && Dictionary.has(view, key)) {
            return Dictionary.get(view, key);
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
    properties: Dictionary<Dictionary<any>>;
    metadata: Dictionary<any>;
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

function getObjectMetadataView(target: any, create: boolean): Dictionary<any> {
    const view = getMetadataView(target, create);
    if (view) {
        if (!view.metadata && create) {
            view.metadata = new Dictionary<any>();
        }
        return view.metadata;
    }
    return undefined;
}

function getPropertyMetadataView(target: any, name: string, create: boolean): Dictionary<any> {
    const view = getMetadataView(target, create);
    if (view) {
        if (!view.properties && create) {
            view.properties = new Dictionary<Dictionary<any>>();
        }
        if (view.properties) {
            if (!Dictionary.has(view.properties, name) && create) {
                Dictionary.set(view.properties, name, new Dictionary<any>());
            }
            return Dictionary.get(view.properties, name);
        }
    }

    return undefined;
}