export default function EmptyState() {
  return (
    <section className="panel-card empty-state">
      <h2 className="empty-state-title">欢迎使用 RepoPilot</h2>
      <div className="empty-state-body">
        <p>输入一个 GitHub 仓库地址，即可自动分析项目，帮助你快速了解：</p>
        <ul className="empty-state-list">
          <li>项目简介</li>
          <li>技术栈</li>
          <li>核心依赖</li>
          <li>项目结构</li>
          <li>推荐阅读顺序</li>
        </ul>
      </div>
    </section>
  );
}
