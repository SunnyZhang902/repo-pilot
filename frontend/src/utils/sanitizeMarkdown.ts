/**
 * Cleans Markdown artifacts from LLM output without changing Prompt or content meaning.
 */
export function sanitizeMarkdownContent(content: string): string {
  return content
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();

      if (trimmed === "|" || trimmed === "|---|") {
        return "";
      }

      if (!trimmed.startsWith("|")) {
        return line.replace(/\s+\|\s*$/, "").trimEnd();
      }

      return line;
    })
    .filter((line) => line.trim() !== "|")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

export function normalizeDifficultyLabel(raw?: string): string {
  if (!raw?.trim()) {
    return "—";
  }

  const value = raw.toLowerCase();

  if (/easy|简单|低|偏低/.test(value)) {
    return "简单";
  }
  if (/medium|中等|中/.test(value)) {
    return "中等";
  }
  if (/hard|困难|高/.test(value)) {
    return "困难";
  }

  return raw.split(/[—–\-，,。]/)[0].trim() || raw;
}
