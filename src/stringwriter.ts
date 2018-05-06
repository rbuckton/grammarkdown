import { EOL } from 'os';

export class StringWriter {
    private _text = "";
    private _depth = 0;
    private _indents = ["", "    "];
    private _newLine = false;
    
    public get size(): number {
        return this._text.length;
    }
    
    public indent(): void {
        this._depth++;
    }
    
    public dedent(): void {
        this._depth--;
    }
    
    public write(text?: string): void {
        if (text) {
            this.flushNewLine();
            this._text += text;
        }
    }
    
    public writeln(text?: string) {
        this.write(text);
        this._newLine = true;
    }
    
    public toString(): string {
        return this._text;
    }
    
    private flushNewLine(): void {
        if (this._newLine) {
            let indent = this._indents[this._depth];
            if (!indent && this._depth > 0) {
                indent = this._indents[this._depth] = this._indents[this._depth - 1] + this._indents[1];                
            }
            
            this._newLine = false;
            this._text += EOL + indent;
        }
    }
}