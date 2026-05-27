import type { ReactNode } from "react";

type ModalFormProps = {
  open: boolean;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: "default" | "large";
};

export default function ModalForm({
  open,
  title,
  description,
  icon,
  children,
  footer,
  onClose,
  size = "default",
}: ModalFormProps) {
  if (!open) return null;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className={size === "large" ? "modal grande" : "modal"}>
        <div className="form-card-header">
          {icon && <div className="form-icon">{icon}</div>}
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
        </div>

        <div className="modal-form-body">{children}</div>

        <div className="form-actions">
          {footer ?? (
            <button className="btn-salvar" type="button" onClick={onClose}>
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
