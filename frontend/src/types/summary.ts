export interface SummaryMetadata {
  model: string;
  promptVersion: string;
  generationTimeSeconds: number;
}

export const DEFAULT_SUMMARY_MODEL = "deepseek-chat";
export const DEFAULT_PROMPT_VERSION = "v1";
