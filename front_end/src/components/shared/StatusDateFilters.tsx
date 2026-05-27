type StatusDateFiltersProps = {
  statusValue: string;
  statusOptions: string[];
  dateStart: string;
  dateEnd: string;
  onStatusChange: (value: string) => void;
  onDateStartChange: (value: string) => void;
  onDateEndChange: (value: string) => void;
  onClear: () => void;
};

export default function StatusDateFilters({
  statusValue,
  statusOptions,
  dateStart,
  dateEnd,
  onStatusChange,
  onDateStartChange,
  onDateEndChange,
  onClear,
}: StatusDateFiltersProps) {
  const hasFilters = Boolean(statusValue || dateStart || dateEnd);

  return (
    <div className="form-card">
      <div className="filters-card-grid">
        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-input"
            value={statusValue}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="">Todos os status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Data inicial</label>
          <input
            type="date"
            className="form-input"
            value={dateStart}
            onChange={(event) => onDateStartChange(event.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Data final</label>
          <input
            type="date"
            className="form-input"
            value={dateEnd}
            onChange={(event) => onDateEndChange(event.target.value)}
          />
        </div>

        <div className="filters-card-actions">
          <button
            type="button"
            className="btn-cancelar"
            disabled={!hasFilters}
            onClick={onClear}
          >
            Limpar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
