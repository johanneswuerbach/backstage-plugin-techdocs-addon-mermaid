import { isMermaidCode } from "./hooks";

describe("isMermaidCode", () => {
  describe("returns true when", () => {
    it("mermaid code exists", () => {
      const mermaidCode = "sequenceDiagram foo foo2 foo-->foo2";

      const result = isMermaidCode(mermaidCode);

      expect(result).toBe(true);
    });

    it("C4Context mermaid code exists", () => {
      const mermaidCode = "C4Context foo foo2 foo-->foo2";

      const result = isMermaidCode(mermaidCode);

      expect(result).toBe(true);
    });

    it("Mindmap mermaid code exists", () => {
      const mermaidCode = "mindmap root((foo bar)) Baz";

      const result = isMermaidCode(mermaidCode);

      expect(result).toBe(true);
    });

    it("Quadrant chart mermaid code exists", () => {
      const mermaidCode = "quadrantChart x-axis Low Reach --> High Reach";

      const result = isMermaidCode(mermaidCode);

      expect(result).toBe(true);
    });

    it("xychart-beta chart mermaid code exists", () => {
      const mermaidCode = "xychart-beta x-axis [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]";

      const result = isMermaidCode(mermaidCode);

      expect(result).toBe(true);
    });

    it("Block-beta chart mermaid code exists", () => {
      const mermaidCode = "block-beta columns 1 db((\"DB\"))";

      const result = isMermaidCode(mermaidCode);

      expect(result).toBe(true);
    });

    it("C4Container mermaid code exists", () => {
      const mermaidCode = "C4Container foo foo2 foo-->foo2";

      expect(isMermaidCode(mermaidCode)).toBe(true);
    })

    it("C4Component mermaid code exists", () => {
      const mermaidCode = "C4Component foo foo2 foo-->foo2";

      expect(isMermaidCode(mermaidCode)).toBe(true);
    })

    it("C4Dynamic mermaid code exists", () => {
      const mermaidCode = "C4Dynamic foo foo2 foo-->foo2";

      expect(isMermaidCode(mermaidCode)).toBe(true);
    })

    it("C4Deployment mermaid code exists", () => {
      const mermaidCode = "C4Deployment foo foo2 foo-->foo2";

      expect(isMermaidCode(mermaidCode)).toBe(true);
    })

    it("mermaid code exists with directive", () => {
      const mermaidCode = `%%{init: { 'logLevel': 'debug', 'theme': 'dark' } }%%
graph LR
A-->B`;

      const result = isMermaidCode(mermaidCode);

      expect(result).toBe(true);
    });

    it("mermade code exists with timeline", () => {
      const mermaidCode = "timeline April 2023 : Phase 1: Clearwater";

      expect(isMermaidCode(mermaidCode)).toBe(true);
    })

    it("mermaid code exists with frontmatter", () => {
      const mermaidCode = `---
title: class diagram with frontmatter
---
classDiagram
    direction LR`;

      const result = isMermaidCode(mermaidCode);

      expect(result).toBe(true);
    });

    it("mermaid code exists with comment", () => {
      const mermaidCode = `%% mermaid code with comment
graph LR
A-->B`;

      const result = isMermaidCode(mermaidCode);

      expect(result).toBe(true);
    });

  });

  describe("returns false when", () => {
    it("contains no mermaid code", () => {
      const mermaidCode = "this isnt mermaid code";

      const result = isMermaidCode(mermaidCode);

      expect(result).toBe(false);
    });

    it("mermaid directive but not mermaid start keyword", () => {
      const mermaidCode = `%%{init: { 'logLevel': 'debug', 'theme': 'dark' } }%%
invalid LR
A-->B`;

      const result = isMermaidCode(mermaidCode);

      expect(result).toBe(false);
    });

    it("improper directive", () => {
      const mermaidCode = `%%{init: { 'logLevel': 'debug', 'theme': 'dark' } 
invalid LR
A-->B`;

      const result = isMermaidCode(mermaidCode);

      expect(result).toBe(false);
    });
  });
});
