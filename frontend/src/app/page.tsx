"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import AnalysisProgressTimeline from "@/components/AnalysisProgressTimeline";
import RepositoryForm from "@/components/RepositoryForm";
import SummaryCard from "@/components/SummaryCard";
import { importRepository, summarizeRepository } from "@/services/repository";
import type { AnalysisStageId } from "@/types/analysis";
import type { RepositoryMetadata, RepositoryNode } from "@/types/repository";
import { countTreeFiles } from "@/utils/countTreeFiles";
import { getUserFriendlyError } from "@/utils/error";
import {
  getRecentRepositories,
  saveRecentRepository,
  type RecentRepository,
} from "@/utils/recentRepositories";

const STRUCTURE_STAGE_DELAY_MS = 2500;
const SUMMARY_STAGE_DELAY_MS = 5000;

export default function Home() {
  const [url, setUrl] = useState("");
  const [metadata, setMetadata] = useState<RepositoryMetadata | null>(null);
  const [tree, setTree] = useState<RepositoryNode | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisStage, setAnalysisStage] =
    useState<AnalysisStageId>("fetching_metadata");
  const [recentRepositories, setRecentRepositories] = useState<
    RecentRepository[]
  >([]);
  const stageTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const analyzingRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecentRepositories(getRecentRepositories());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function clearStageTimers() {
    stageTimersRef.current.forEach(clearTimeout);
    stageTimersRef.current = [];
  }

  async function handleAnalyze(analyzeUrl: string) {
    if (analyzingRef.current) {
      return;
    }

    analyzingRef.current = true;

    setLoading(true);
    setError(null);
    setMetadata(null);
    setTree(null);
    setSummary(null);
    clearStageTimers();
    setAnalysisStage("fetching_metadata");

    try {
      await importRepository(analyzeUrl);
      setAnalysisStage("downloading");

      const summaryPromise = summarizeRepository(analyzeUrl);

      stageTimersRef.current.push(
        setTimeout(
          () => setAnalysisStage("analyzing_structure"),
          STRUCTURE_STAGE_DELAY_MS,
        ),
        setTimeout(
          () => setAnalysisStage("generating_summary"),
          SUMMARY_STAGE_DELAY_MS,
        ),
      );

      const result = await summaryPromise;
      clearStageTimers();

      setMetadata(result.metadata);
      setTree(result.tree);
      setSummary(result.summary);
      saveRecentRepository(analyzeUrl);
      setRecentRepositories(getRecentRepositories());
    } catch (err) {
      clearStageTimers();
      const rawMessage =
        err instanceof Error ? err.message : "出现未知错误，请稍后重试。";
      setError(getUserFriendlyError(rawMessage));
    } finally {
      setLoading(false);
      analyzingRef.current = false;
    }
  }

  function handleNewAnalysis() {
    clearStageTimers();
    setLoading(false);
    setError(null);
    setMetadata(null);
    setTree(null);
    setSummary(null);
    setAnalysisStage("fetching_metadata");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasResults = metadata && tree && summary && !loading;
  const showLanding = !loading && !hasResults;
  const fileCount = tree ? countTreeFiles(tree) : null;
  const isLanding = loading || showLanding;

  return (
    <main
      className={`dashboard${isLanding ? " dashboard--landing" : ""}${hasResults ? " dashboard--report" : ""}`}
    >
      {isLanding ? (
        <section className="landing-shell">
          <div className="landing-background" aria-hidden="true" />
          <motion.header
            className="landing-brand"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <motion.span
              className="landing-brand__logo"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              RepoPilot
            </motion.span>
          </motion.header>

          <div className="landing-hero">
            <motion.div
              className="landing-hero__content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              <h1 className="landing-hero__title">
                30秒读懂新项目
              </h1>
              <p className="landing-hero__subtitle">
                输入GitHub仓库地址，快速入手项目代码
              </p>

              <RepositoryForm
                url={url}
                onUrlChange={setUrl}
                onSubmit={handleAnalyze}
                loading={loading}
                recentRepositories={recentRepositories}
              />
            </motion.div>

            {loading && (
              <AnalysisProgressTimeline currentStage={analysisStage} />
            )}
          </div>

          {error && <p className="error-message error-message--landing">{error}</p>}

          <footer className="landing-footer" aria-label="技术支持">
            <span>技术支持</span>
            <strong>FastAPI</strong>
            <strong>Next.js</strong>
            <strong>DeepSeek</strong>
          </footer>
        </section>
      ) : (
        <>
          {error && <p className="error-message">{error}</p>}

          <div className="dashboard-grid dashboard-grid--with-report">
            <div className="dashboard-column dashboard-column--summary">
              <SummaryCard
                summary={summary}
                loading={loading}
                repositoryMetadata={metadata}
                fileCount={fileCount}
                onNewAnalysis={handleNewAnalysis}
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
