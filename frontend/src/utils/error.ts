const ERROR_MAPPINGS: { match: string; message: string }[] = [
  {
    match: "Repository clone timed out",
    message: "仓库下载超时，请稍后重试。",
  },
  {
    match: "Failed to clone repository",
    message: "无法下载仓库，请检查仓库地址或网络。",
  },
  {
    match: "Repository not found",
    message: "仓库不存在，或没有访问权限。",
  },
];

const DEFAULT_ERROR_MESSAGE = "出现未知错误，请稍后重试。";

export function getUserFriendlyError(message: string): string {
  for (const mapping of ERROR_MAPPINGS) {
    if (message.includes(mapping.match)) {
      return mapping.message;
    }
  }

  if (message.includes("LLM") || message.includes("DeepSeek")) {
    return "AI 服务暂时不可用，请稍后重试。";
  }

  return DEFAULT_ERROR_MESSAGE;
}
