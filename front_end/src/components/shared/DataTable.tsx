import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  render: (item: T, index: number) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyMessage: string;
  getRowKey?: (item: T, index: number) => string | number;
};

export default function DataTable<T>({
  columns,
  data,
  emptyMessage,
  getRowKey,
}: DataTableProps<T>) {
  return (
    <div className="form-card">
      <table className="tabela-moderna">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>{emptyMessage}</td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={getRowKey?.(item, index) ?? index}>
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.render(item, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
