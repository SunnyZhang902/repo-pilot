"use client";

import { useState } from "react";

import RepositoryCard from "@/components/RepositoryCard";
import RepositoryForm from "@/components/RepositoryForm";
import { importRepository } from "@/services/repository";
import type { RepositoryMetadata } from "@/types/repository";

export default function Home() {
  const [metadata, setMetadata] = useState<RepositoryMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImport(url: string) {
    setLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const data = await importRepository(url);
      setMetadata(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">RepoPilot</h1>
      </header>

      <RepositoryForm onSubmit={handleImport} loading={loading} />

      {loading && <p className="status-message">Loading repository data...</p>}

      {error && <p className="error-message">{error}</p>}

      {metadata && !loading && <RepositoryCard metadata={metadata} />}
    </main>
  );
}
