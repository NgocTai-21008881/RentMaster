"use client";

export default function DataTable({ columns, rows, emptyText = "Chưa có dữ liệu." }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-4 py-3 font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 transition hover:bg-indigo-50/40">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 align-middle text-slate-700">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Pagination({ page, total, limit, onPage }) {
  const pages = Math.max(1, Math.ceil((total || 0) / (limit || 10)));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2">
      <button className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Trước
      </button>
      <span className="text-sm text-slate-500">
        {page}/{pages}
      </span>
      <button className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Sau
      </button>
    </div>
  );
}
