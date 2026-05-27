import { useCallback, useEffect, useId, useState } from "react";
import { AlertTriangle } from "lucide-react";

type ConfirmTone = "default" | "danger";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
};

type ConfirmInput = string | ConfirmOptions;

type ConfirmRequest = {
  options: ConfirmOptions;
  resolve: (confirmed: boolean) => void;
};

export function useConfirm() {
  const titleId = useId();
  const descriptionId = useId();
  const [request, setRequest] = useState<ConfirmRequest | null>(null);

  const confirm = useCallback((input: ConfirmInput) => {
    const normalized = typeof input === "string" ? input.toLowerCase() : "";
    const isDanger =
      normalized.includes("excluir") ||
      normalized.includes("remover") ||
      normalized.includes("sair");

    const options =
      typeof input === "string"
        ? {
            title: input,
            confirmLabel: normalized.includes("excluir")
              ? "Excluir"
              : "Confirmar",
            tone: isDanger ? ("danger" as const) : ("default" as const),
          }
        : input;

    return new Promise<boolean>((resolve) => {
      setRequest({
        options,
        resolve,
      });
    });
  }, []);

  const close = useCallback(
    (confirmed: boolean) => {
      if (!request) return;

      request.resolve(confirmed);
      setRequest(null);
    },
    [request]
  );

  useEffect(() => {
    if (!request) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close, request]);

  const confirmationModal = request ? (
    <div className="confirm-overlay" role="presentation">
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={request.options.description ? descriptionId : undefined}
      >
        <div className={`confirm-icon confirm-icon--${request.options.tone || "default"}`}>
          <AlertTriangle size={24} />
        </div>

        <div className="confirm-content">
          <h2 id={titleId}>{request.options.title}</h2>

          {request.options.description && (
            <p id={descriptionId}>{request.options.description}</p>
          )}
        </div>

        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-btn confirm-btn--secondary"
            onClick={() => close(false)}
          >
            {request.options.cancelLabel || "Cancelar"}
          </button>

          <button
            type="button"
            className={`confirm-btn ${
              request.options.tone === "danger"
                ? "confirm-btn--danger"
                : "confirm-btn--primary"
            }`}
            onClick={() => close(true)}
            autoFocus
          >
            {request.options.confirmLabel || "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return {
    confirm,
    confirmationModal,
  };
}
