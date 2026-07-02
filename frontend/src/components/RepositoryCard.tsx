import type { RepositoryMetadata } from "@/types/repository";

interface RepositoryCardProps {
  metadata: RepositoryMetadata;
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="info-row">
      <dt className="info-label">{label}</dt>
      <dd className="info-value">{value}</dd>
    </div>
  );
}

export default function RepositoryCard({ metadata }: RepositoryCardProps) {
  return (
    <section className="repository-card">
      <h2 className="section-title">Repository Information</h2>
      <dl className="info-list">
        <InfoRow label="Name" value={metadata.name} />
        <InfoRow label="Owner" value={metadata.owner} />
        <InfoRow
          label="Description"
          value={metadata.description ?? "No description"}
        />
        <InfoRow label="Language" value={metadata.language ?? "Unknown"} />
        <InfoRow label="Stars" value={metadata.stars.toLocaleString()} />
        <InfoRow label="Forks" value={metadata.forks.toLocaleString()} />
        <InfoRow label="Default Branch" value={metadata.default_branch} />
      </dl>
    </section>
  );
}
