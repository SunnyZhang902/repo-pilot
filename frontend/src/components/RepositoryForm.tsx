"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Link2 } from "lucide-react";

import type { RecentRepository } from "@/utils/recentRepositories";

interface RepositoryFormProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: (url: string) => void;
  loading: boolean;
  recentRepositories: RecentRepository[];
}

export default function RepositoryForm({
  url,
  onUrlChange,
  onSubmit,
  loading,
  recentRepositories,
}: RepositoryFormProps) {
  const [renderedAt] = useState(() => Date.now());

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !url.trim()) return;
    onSubmit(url.trim());
  }

  function handleFillUrl(nextUrl: string) {
    onUrlChange(nextUrl);
  }

  function formatRelativeTime(timestamp: number): string {
    const diff = renderedAt - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return "今天";
    }
    if (days === 1) {
      return "昨天";
    }
    return `${days} 天前`;
  }

  function getRepoName(label: string): string {
    return label.split("/").at(-1) ?? label;
  }

  return (
    <form className="repository-form" onSubmit={handleSubmit}>
      <label className="repository-input-shell" htmlFor="repository-url">
        <span className="repository-input-shell__icon" aria-hidden="true">
          <Link2 size={18} strokeWidth={1.75} />
        </span>
        <span className="repository-input-shell__content">
          <span className="repository-input-shell__label">
            GitHub 仓库地址
          </span>
          <input
            id="repository-url"
            className="form-input"
            type="url"
            placeholder="github.com/vercel/next.js"
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            disabled={loading}
            required
          />
        </span>
      </label>
      <p className="repository-form__hint">仅支持公开 GitHub 仓库</p>

      <motion.button
        className={`form-button${loading ? " form-button--loading" : ""}`}
        type="submit"
        disabled={loading}
        aria-busy={loading}
        whileHover={!loading ? { y: -1, scale: 1.01 } : undefined}
        whileTap={!loading ? { scale: 0.99 } : undefined}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {loading && <span className="button-spinner" aria-hidden="true" />}
        <span>{loading ? "正在分析..." : "开始分析"}</span>
        {!loading && <ArrowRight size={16} strokeWidth={1.75} />}
      </motion.button>

      {recentRepositories.length > 0 && (
        <div className="url-suggestions">
          <div className="url-suggestions-header">
            <p className="url-suggestions-label">最近分析</p>
            <span className="url-suggestions-hint">最近生成的入职报告</span>
          </div>
          <div className="recent-report-list">
            {recentRepositories.map((item) => (
              <motion.button
                key={item.url}
                type="button"
                className="recent-report-card"
                onClick={() => handleFillUrl(item.url)}
                disabled={loading}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <span className="recent-report-card__name">
                  {getRepoName(item.label)}
                </span>
                <span className="recent-report-card__meta">
                  <span>GitHub</span>
                  <span>{formatRelativeTime(item.analyzedAt)}</span>
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
