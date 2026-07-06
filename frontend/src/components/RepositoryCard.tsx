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
    <section className="panel-card repository-card">
      <h2 className="section-title">仓库信息</h2>
      <dl className="info-list">
        <InfoRow label="所有者" value={metadata.owner} />
        <InfoRow
          label="描述"
          value={metadata.description ?? "暂无描述"}
        />
        <InfoRow
          label="主要语言"
          value={metadata.language ?? "未知"}
        />
        <InfoRow label="Stars" value={metadata.stars.toLocaleString()} />
        <InfoRow label="Forks" value={metadata.forks.toLocaleString()} />
        <InfoRow label="默认分支" value={metadata.default_branch} />
      </dl>
    </section>
  );
}
