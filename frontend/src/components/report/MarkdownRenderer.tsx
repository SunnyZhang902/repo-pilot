"use client";

import { isValidElement, useState } from "react";
import type { ReactNode } from "react";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import { AlertTriangle, Check, Clipboard, Info, Lightbulb, Link2 } from "lucide-react";

import { preprocessCallouts } from "@/utils/reportSectionParser";
import { sanitizeMarkdownContent } from "@/utils/sanitizeMarkdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const CALLOUT_STYLES: Record<
  string,
  { icon: typeof Info; className: string }
> = {
  note: { icon: Info, className: "report-callout report-callout--note" },
  why: { icon: Info, className: "report-callout report-callout--why" },
  important: { icon: Info, className: "report-callout report-callout--important" },
  tip: { icon: Lightbulb, className: "report-callout report-callout--tip" },
  tips: { icon: Lightbulb, className: "report-callout report-callout--tip" },
  warning: { icon: AlertTriangle, className: "report-callout report-callout--warning" },
};

function extractText(node: ReactNode): string {
  if (typeof node === "string") {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }
  if (node && typeof node === "object" && "props" in node) {
    const props = node.props as { children?: ReactNode };
    return extractText(props.children ?? "");
  }
  return "";
}

function CalloutBlock({
  kind,
  body,
}: {
  kind: string;
  body: string;
}) {
  const style = CALLOUT_STYLES[kind.toLowerCase()] ?? CALLOUT_STYLES.note;
  const Icon = style.icon;
  return (
    <aside className={style.className}>
      <p className="report-callout__label">
        <Icon size={16} strokeWidth={1.75} aria-hidden="true" /> {kind}
      </p>
      <p className="report-callout__body">{body}</p>
    </aside>
  );
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function HeadingWithLink({ children }: { children: ReactNode }) {
  const text = extractText(children);
  const id = slugify(text);

  async function handleCopy() {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.location.hash = id;
    }
  }

  return (
    <h2 id={id} className="report-markdown__heading">
      <span>{children}</span>
      <button
        type="button"
        className="report-markdown__heading-link"
        onClick={handleCopy}
        aria-label={`复制${text}链接`}
      >
        <Link2 size={14} strokeWidth={1.8} />
      </button>
    </h2>
  );
}

function CodeBlock({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");
  const isLong = lines.length > 20;
  const visibleCode = isLong && !expanded ? lines.slice(0, 20).join("\n") : code;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="report-code-block">
      <div className="report-code-block__toolbar">
        <span className="report-code-block__label">Code</span>
        <button
          type="button"
          className="report-code-block__copy"
          onClick={handleCopy}
        >
          {copied ? (
            <Check size={14} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Clipboard size={14} strokeWidth={1.8} aria-hidden="true" />
          )}
          {copied ? "已复制" : "Copy"}
        </button>
      </div>
      <pre className="report-code-block__pre">
        <code className={className}>
          {visibleCode}
        </code>
      </pre>
      {isLong && (
        <button
          type="button"
          className="report-code-block__expand"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "收起代码" : `展开全部（共 ${lines.length} 行）`}
        </button>
      )}
    </div>
  );
}

function PreBlock({ children }: { children: ReactNode }) {
  let className: string | undefined;
  let code = extractText(children).replace(/\n$/, "");

  if (isValidElement(children)) {
    const props = children.props as {
      className?: string;
      children?: ReactNode;
    };
    className = props.className;
    code = extractText(props.children ?? "").replace(/\n$/, "");
  }

  return <CodeBlock code={code} className={className} />;
}

const markdownComponents: Components = {
  blockquote: ({ children }) => {
    const text = extractText(children).trim();
    const calloutMatch = text.match(/^\[CALLOUT:([^\]]+)\]\s*([\s\S]*)$/);
    if (calloutMatch) {
      return (
        <CalloutBlock kind={calloutMatch[1]} body={calloutMatch[2].trim()} />
      );
    }
    return <blockquote className="report-blockquote">{children}</blockquote>;
  },
  table: ({ children }) => (
    <div className="report-table-scroll">
      <table className="report-table">{children}</table>
    </div>
  ),
  pre: ({ children }) => <PreBlock>{children}</PreBlock>,
  code: ({ children, className }) => (
    <code className={className}>{children}</code>
  ),
  h2: ({ children }) => <HeadingWithLink>{children}</HeadingWithLink>,
  thead: ({ children }) => <thead className="report-table__head">{children}</thead>,
  th: ({ children }) => <th className="report-table__th">{children}</th>,
  td: ({ children }) => <td className="report-table__td">{children}</td>,
};

export default function MarkdownRenderer({
  content,
  className = "report-markdown",
}: MarkdownRendererProps) {
  const processed = sanitizeMarkdownContent(
    preprocessCallouts(
      content.replace(
        /^\*\*(NOTE|WHY|IMPORTANT|Tip|Warning)[:：]\*\*\s*(.+)$/gim,
        "> [CALLOUT:$1] $2",
      ),
    ),
  );

  return (
    <div className={className}>
      <Markdown components={markdownComponents}>{processed}</Markdown>
    </div>
  );
}
