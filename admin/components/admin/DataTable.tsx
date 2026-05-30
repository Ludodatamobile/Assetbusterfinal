import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  emptyTitle = "No records found",
  emptyDescription,
}: DataTableProps<T>) {
  return (
    <div className="bg-white border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`text-left text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.7px] px-4 py-3 whitespace-nowrap ${column.className ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center gap-2 py-14 text-slate-400">
                    <Loader2
                      className="animate-spin text-[#1A56DB]"
                      size={20}
                    />
                    <span className="text-[13px] font-medium">
                      Loading records
                    </span>
                  </div>
                </td>
              </tr>
            ) : data.length ? (
              data.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50/70 transition-colors duration-100 group"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3.5 text-[12.5px] text-slate-600 align-middle ${column.className ?? ""}`}
                    >
                      {column.cell(item)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                    <div className="w-10 h-10 bg-slate-100 flex items-center justify-center mb-1">
                      <span className="text-slate-400 text-lg">○</span>
                    </div>
                    <strong className="text-[13px] font-bold text-slate-600">
                      {emptyTitle}
                    </strong>
                    {emptyDescription && (
                      <span className="text-[12px] text-slate-400 max-w-xs leading-relaxed">
                        {emptyDescription}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}