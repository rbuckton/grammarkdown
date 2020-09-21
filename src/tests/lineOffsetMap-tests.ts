import { expect } from "chai";
import { LineOffsetMap } from "../lineOffsetMap";
import { Position } from "../types";

describe("LineOffsetMap", () => {
    it("getEffectiveFilenameAtPosition", () => {
        const map = new LineOffsetMap();
        map.addLineOffset("a.grammar", 0, { file: "a.html", line: 10 });
        map.addLineOffset("b.grammar", 20, { file: "a.html", line: 30 });
        const filename1 = map.getEffectiveFilenameAtPosition("a.grammar", Position.create(0, 0));
        const filename2 = map.getEffectiveFilenameAtPosition("a.grammar", Position.create(11, 0));
        const filename3 = map.getEffectiveFilenameAtPosition("b.grammar", Position.create(0, 0));
        const filename4 = map.getEffectiveFilenameAtPosition("b.grammar", Position.create(31, 0));
        expect(filename1).equals("a.html");
        expect(filename2).equals("a.html");
        expect(filename3).equals("b.grammar");
        expect(filename4).equals("a.html");
    });
    it("getEffectivePosition", () => {
        const map = new LineOffsetMap();
        map.addLineOffset("a.grammar", 0, { file: "a.html", line: 10 });
        map.addLineOffset("b.grammar", 20, { file: "a.html", line: 30 });
        const position1 = map.getEffectivePosition("a.grammar", Position.create(1, 0));
        const position2 = map.getEffectivePosition("a.grammar", Position.create(11, 0));
        const position3 = map.getEffectivePosition("b.grammar", Position.create(0, 0));
        const position4 = map.getEffectivePosition("b.grammar", Position.create(31, 0));
        expect(position1).to.deep.equal(Position.create(11, 0));
        expect(position2).to.deep.equal(Position.create(21, 0));
        expect(position3).to.deep.equal(Position.create(0, 0));
        expect(position4).to.deep.equal(Position.create(41, 0));
    });
    it("getRawFilenameAtEffectivePosition", () => {
        const map = new LineOffsetMap();
        map.addLineOffset("a.grammar", 0, { file: "a.html", line: 10 });
        map.addLineOffset("b.grammar", 20, { file: "a.html", line: 30 });
        const filename1 = map.getRawFilenameAtEffectivePosition("a.html", Position.create(0, 0));
        const filename2 = map.getRawFilenameAtEffectivePosition("a.html", Position.create(11, 0));
        const filename3 = map.getRawFilenameAtEffectivePosition("a.html", Position.create(31, 0));
        expect(filename1).equals("a.html");
        expect(filename2).equals("a.grammar");
        expect(filename3).equals("b.grammar");
    });
    it("getRawPositionFromEffectivePosition", () => {
        const map = new LineOffsetMap();
        map.addLineOffset("a.grammar", 0, { file: "a.html", line: 10 });
        map.addLineOffset("b.grammar", 20, { file: "a.html", line: 30 });
        const position1 = map.getRawPositionFromEffectivePosition("a.html", Position.create(0, 0));
        const position2 = map.getRawPositionFromEffectivePosition("a.html", Position.create(11, 0));
        const position3 = map.getRawPositionFromEffectivePosition("a.html", Position.create(31, 0));
        expect(position1).to.deep.equal(Position.create(0, 0));
        expect(position2).to.deep.equal(Position.create(1, 0));
        expect(position3).to.deep.equal(Position.create(21, 0));
    });
});
