import { describe, it, expect } from "vitest";
import { parseAgentsMd } from "../parser.js";
import {
  parseDirectives,
  getDirectiveTarget,
  getDirectivePriority,
} from "../directives.js";

const WITH_DIRECTIVE = `<!-- agents-md: target=nearest, priority=1 -->

## Fragment content
Some instructions here.
`;

describe("directive parsing", () => {
  it("extracts agents-md directives", () => {
    const parsed = parseAgentsMd(WITH_DIRECTIVE);
    expect(parsed.directives).toBeDefined();
    expect(parsed.directives?.length).toBe(1);
    expect(parsed.directives?.[0].params.target).toBe("nearest");
    expect(parsed.directives?.[0].params.priority).toBe("1");
  });

  it("parses multiple directives", () => {
    const content = `<!-- agents-md: target=root -->
<!-- agents-md: priority=5 -->
## Test
`;
    const directives = parseDirectives(content);
    expect(directives).toHaveLength(2);
    expect(directives[0]?.params.target).toBe("root");
    expect(directives[1]?.params.priority).toBe("5");
  });

  it("parses params with spaces and commas", () => {
    const content = `<!-- agents-md: target=nearest, priority=10 -->
`;
    const directives = parseDirectives(content);
    expect(directives[0]?.params.target).toBe("nearest");
    expect(directives[0]?.params.priority).toBe("10");
  });
});

describe("getDirectiveTarget", () => {
  it("returns target from first directive", () => {
    const directives = parseDirectives(
      `<!-- agents-md: target=root -->\n<!-- agents-md: target=nearest -->`
    );
    expect(getDirectiveTarget(directives)).toBe("root");
  });

  it("returns undefined when no target", () => {
    const directives = parseDirectives(`<!-- agents-md: priority=1 -->`);
    expect(getDirectiveTarget(directives)).toBeUndefined();
  });
});

describe("getDirectivePriority", () => {
  it("returns priority from first directive with priority", () => {
    const directives = parseDirectives(
      `<!-- agents-md: target=root -->\n<!-- agents-md: priority=7 -->`
    );
    expect(getDirectivePriority(directives)).toBe(7);
  });

  it("returns 0 when no priority", () => {
    const directives = parseDirectives(`<!-- agents-md: target=root -->`);
    expect(getDirectivePriority(directives)).toBe(0);
  });

  it("parses invalid priority as 0", () => {
    const directives = parseDirectives(`<!-- agents-md: priority=abc -->`);
    expect(getDirectivePriority(directives)).toBe(0);
  });
});
