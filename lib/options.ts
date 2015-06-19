export enum EmitFormat {
	markdown,
	html,
	ecmarkup
}

export interface CompilerOptions {
	noChecks?: boolean;
	noEmit?: boolean;
	noEmitOnError?: boolean;
	format?: EmitFormat;
	out?: string;
	emitLinks?: boolean;
}

export function getDefaultOptions(): CompilerOptions {
	return { format: EmitFormat.markdown };
}