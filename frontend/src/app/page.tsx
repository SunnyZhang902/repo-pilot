"use client";

import { useEffect, useRef, useState } from "react";

import AnalysisProgressTimeline from "@/components/AnalysisProgressTimeline";
import EmptyState from "@/components/EmptyState";
import RepositoryCard from "@/components/RepositoryCard";
import RepositoryForm from "@/components/RepositoryForm";
import RepositoryTree from "@/components/RepositoryTree";
import SummaryCard from "@/components/SummaryCard";
import { importRepository, summarizeRepository } from "@/services/repository";
import type { AnalysisStageId } from "@/types/analysis";
import type { RepositoryMetadata, RepositoryNode } from "@/types/repository";
import {
  DEFAULT_PROMPT_VERSION,
  DEFAULT_SUMMARY_MODEL,
  type SummaryMetadata,
} from "@/types/summary";
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
  const [summaryMetadata, setSummaryMetadata] = useState<SummaryMetadata | null>(
    null,
  );
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
    setRecentRepositories(getRecentRepositories());
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
    const pipelineStart = performance.now();

    setLoading(true);
    setError(null);
    setMetadata(null);
    setTree(null);
    setSummary(null);
    setSummaryMetadata(null);
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

      const generationTimeSeconds = (performance.now() - pipelineStart) / 1000;

      setMetadata(result.metadata);
      setTree(result.tree);
      setSummary(result.summary);
      setSummaryMetadata({
        model: DEFAULT_SUMMARY_MODEL,
        promptVersion: DEFAULT_PROMPT_VERSION,
        generationTimeSeconds,
      });
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

  const hasResults = metadata && tree && summary && !loading;
  const showEmptyState = !loading && !hasResults;

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">RepoPilot</h1>
      </header>

      <RepositoryForm
        url={url}
        onUrlChange={setUrl}
        onSubmit={handleAnalyze}
        loading={loading}
        recentRepositories={recentRepositories}
      />

      {loading && (
        <AnalysisProgressTimeline currentStage={analysisStage} />
      )}

      {error && <p className="error-message">{error}</p>}

      {(loading || hasResults || showEmptyState) && (
        <div className="dashboard-grid">
          <div className="dashboard-column dashboard-column--info">
            {hasResults && (
              <>
                <RepositoryCard metadata={metadata} />
                <RepositoryTree tree={tree} />
              </>
            )}
          </div>
          <div className="dashboard-column dashboard-column--summary">
            {showEmptyState && <EmptyState />}
            {(loading || hasResults) && (
              <SummaryCard
                summary={summary}
                loading={loading}
                metadata={summaryMetadata}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
