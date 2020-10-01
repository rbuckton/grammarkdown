import { matcherHint, EXPECTED_COLOR, RECEIVED_COLOR } from "jest-matcher-utils";
import { SyntaxKind, tokenToString } from "../tokens";

const printKind = (kind: SyntaxKind) => `${kind} (${tokenToString(kind)})`;

const passMessage = (received: SyntaxKind, expected: SyntaxKind) => () => `${matcherHint('.not.toBeSyntaxKind')}

Expected: ${EXPECTED_COLOR(printKind(expected))}
Received: ${RECEIVED_COLOR(printKind(received))}
`;

const failMessage = (received: SyntaxKind, expected: SyntaxKind) => () => `${matcherHint('.toBeSyntaxKind')}

Expected: ${EXPECTED_COLOR(printKind(expected))}
Received: ${RECEIVED_COLOR(printKind(received))}
`;

expect.extend({
    toBeSyntaxKind(received: SyntaxKind, expected: SyntaxKind) {
        const pass = received === expected;
        const message = (pass ? passMessage : failMessage)(received, expected)
        return { pass, message };
    }
});

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeSyntaxKind(this: Matchers<R, SyntaxKind>, actual: SyntaxKind): R;
        }
    }
}