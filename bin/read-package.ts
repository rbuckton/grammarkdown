import { readFile, readFileSync } from "fs";

export interface Person {
	name?: string;
	email?: string;
}

export interface Package {
	name?: string;
	author?: string | Person;
	homepage?: string;
	version?: string;
	license?: string;
	description?: string;
	keywords?: string[];
	main?: string;
	typings?: string;
	dependencies?: { [name: string]: string; };
	devDependencies?: { [name: string]: string; };
}

export function readPackage(packagePath: string, done: (err: any, package: Package) => void): void {
	readFile(packagePath, "utf8", (err, data) => {
		try {
			if (err) throw err;
			done(undefined, JSON.parse(data));
		}
		catch (e) {
			done(err, undefined);
		}
	});
}

export function readPackageSync(packagePath: string): Package {
	let data = readFileSync(packagePath, "utf8");
	return JSON.parse(data);
}