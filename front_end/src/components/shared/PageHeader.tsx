import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  badgeValue?: ReactNode;
  badgeLabel?: string;
  actions?: ReactNode;
};

export default function PageHeader({
  title,
  description,
  badgeValue,
  badgeLabel,
  actions,
}: PageHeaderProps) {
  return (
    <div className="page-topo">
      <div className="page-titulo">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      <div className="page-header-actions">
        {actions}
        {badgeValue !== undefined && (
          <div className="page-badge">
            <strong>{badgeValue}</strong>
            {badgeLabel && <span>{badgeLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
