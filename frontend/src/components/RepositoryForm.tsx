"use client";

import { FormEvent } from "react";

import { EXAMPLE_REPOSITORIES } from "@/constants/exampleRepositories";
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
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !url.trim()) return;
    onSubmit(url.trim());
  }

  function handleFillUrl(nextUrl: string) {
    onUrlChange(nextUrl);
  }

  return (
    <form className="repository-form" onSubmit={handleSubmit}>
      <label className="form-label" htmlFor="repository-url">
        GitHub 仓库地址
      </label>
      <input
        id="repository-url"
        className="form-input"
        type="url"
        placeholder="请输入 GitHub 仓库地址，例如：https://github.com/owner/repository"
        value={url}
        onChange={(event) => onUrlChange(event.target.value)}
        disabled={loading}
        required
      />

      <div className="url-suggestions">
        <p className="url-suggestions-label">最近分析</p>
        {recentRepositories.length > 0 ? (
          <div className="url-chip-list">
            {recentRepositories.map((item) => (
              <button
                key={item.url}
                type="button"
                className="url-chip"
                onClick={() => handleFillUrl(item.url)}
                disabled={loading}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="url-suggestions-empty">暂无分析记录</p>
        )}
      </div>

      <div className="url-suggestions">
        <p className="url-suggestions-label">示例仓库</p>
        <div className="url-chip-list">
          {EXAMPLE_REPOSITORIES.map((item) => (
            <button
              key={item.url}
              type="button"
              className="url-chip"
              onClick={() => handleFillUrl(item.url)}
              disabled={loading}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <button
        className={`form-button${loading ? " form-button--loading" : ""}`}
        type="submit"
        disabled={loading}
        aria-busy={loading}
      >
        {loading && <span className="button-spinner" aria-hidden="true" />}
        {loading ? "正在分析..." : "开始分析"}
      </button>
    </form>
  );
}
