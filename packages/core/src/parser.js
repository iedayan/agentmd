/**
 * AGENTS.md Parser
 * Parses AGENTS.md files per the standard: plain Markdown, section-based structure.
 * Supports YAML frontmatter and agents-md directives.
 * @see https://agents.md
 */
import { extractCommands } from './commands.js';
import { parseFrontmatter } from './frontmatter.js';
import { parseDirectives } from './directives.js';
const HEADING_REGEX = /^(#{1,6})\s+(.+)$/;
/**
 * Parse an AGENTS.md file into structured sections and commands.
 * Extracts YAML frontmatter (agent config) and agents-md directives.
 */
export function parseAgentsMd(content, filePath) {
  // Input validation
  if (typeof content !== 'string') {
    throw new Error('Content must be a string');
  }
  if (content.length === 0) {
    return {
      raw: content,
      sections: [],
      commands: [],
      lineCount: 0,
      filePath,
    };
  }
  if (filePath && typeof filePath !== 'string') {
    throw new Error('File path must be a string');
  }
  const { frontmatter, body, hasFrontmatter } = parseFrontmatter(content);
  const contentToParse = body ?? content;
  const lines = contentToParse.split('\n');
  const sections = parseSections(lines);
  const commands = extractCommands(contentToParse, sections);
  const directives = parseDirectives(contentToParse);
  const result = {
    raw: content,
    sections,
    commands,
    lineCount: content.split('\n').length,
    filePath,
    body: contentToParse,
    directives: directives.length > 0 ? directives : undefined,
  };
  if (hasFrontmatter && Object.keys(frontmatter).length > 0) {
    result.frontmatter = frontmatter;
  }
  return result;
}
/**
 * Parse markdown sections from lines.
 * Builds a tree: # as doc title, ## as main sections with ### children.
 * Returns ## as top-level sections when present (common in AGENTS.md).
 */
function parseSections(lines) {
  const raw = parseSectionsTree(lines);
  // Flatten: if root is single # with ## children, use ## as top-level
  if (
    raw.length === 1 &&
    raw[0].level === 1 &&
    raw[0].children.length > 0 &&
    raw[0].children.every((c) => c.level === 2)
  ) {
    return raw[0].children;
  }
  return raw;
}
function parseSectionsTree(lines) {
  const sections = [];
  let i = 0;
  while (i < lines.length) {
    const match = lines[i].match(HEADING_REGEX);
    if (match) {
      const level = match[1].length;
      const title = match[2].trim();
      const heading = lines[i];
      const lineStart = i + 1;
      // Collect content until next heading of same or higher level
      const contentLines = [];
      let j = i + 1;
      while (j < lines.length) {
        const nextMatch = lines[j].match(HEADING_REGEX);
        if (nextMatch) {
          const nextLevel = nextMatch[1].length;
          if (nextLevel <= level) {
            break;
          }
        }
        contentLines.push(lines[j]);
        j++;
      }
      const lineEnd = j;
      // Recursively parse child sections (headings with higher level)
      const childLines = contentLines;
      const children = parseChildSections(childLines, level, lineStart);
      sections.push({
        level,
        title,
        heading,
        content: childLines
          .filter((l) => !l.match(HEADING_REGEX))
          .join('\n')
          .trim(),
        children,
        lineStart,
        lineEnd,
      });
      i = j;
    } else {
      i++;
    }
  }
  return sections;
}
function parseChildSections(lines, parentLevel, lineOffset = 0) {
  const children = [];
  let i = 0;
  while (i < lines.length) {
    const match = lines[i].match(HEADING_REGEX);
    if (match) {
      const level = match[1].length;
      if (level <= parentLevel) {
        i++;
        continue;
      }
      const title = match[2].trim();
      const heading = lines[i];
      const lineStart = lineOffset + i + 1;
      const contentLines = [];
      let j = i + 1;
      while (j < lines.length) {
        const nextMatch = lines[j].match(HEADING_REGEX);
        if (nextMatch && nextMatch[1].length <= level) {
          break;
        }
        contentLines.push(lines[j]);
        j++;
      }
      const childLines = contentLines;
      const subChildren = parseChildSections(childLines, level, lineOffset + i + 1);
      children.push({
        level,
        title,
        heading,
        content: childLines
          .filter((l) => !l.match(HEADING_REGEX))
          .join('\n')
          .trim(),
        children: subChildren,
        lineStart,
        lineEnd: lineOffset + j,
      });
      i = j;
    } else {
      i++;
    }
  }
  return children;
}
/**
 * Get a section by title (case-insensitive, partial match).
 */
export function findSection(parsed, title) {
  const lower = title.toLowerCase();
  return findSectionRecursive(parsed.sections, lower);
}
function findSectionRecursive(sections, search) {
  for (const s of sections) {
    if (s.title.toLowerCase().includes(search)) return s;
    const found = findSectionRecursive(s.children, search);
    if (found) return found;
  }
  return undefined;
}
