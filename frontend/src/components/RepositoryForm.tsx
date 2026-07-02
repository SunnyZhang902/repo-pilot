"use client";

import { FormEvent, useState } from "react";

interface RepositoryFormProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export default function RepositoryForm({
  onSubmit,
  loading,
}: RepositoryFormProps) {
  const [url, setUrl] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url.trim()) return;
    onSubmit(url.trim());
  }

  return (
    <form className="repository-form" onSubmit={handleSubmit}>
      <label className="form-label" htmlFor="repository-url">
        GitHub Repository URL
      </label>
      <input
        id="repository-url"
        className="form-input"
        type="url"
        placeholder="https://github.com/owner/repository"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        disabled={loading}
        required
      />
      <button className="form-button" type="submit" disabled={loading}>
        {loading ? "Importing..." : "Import Repository"}
      </button>
    </form>
  );
}
