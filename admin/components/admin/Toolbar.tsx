import { Search } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
}

export function Toolbar({
  search,
  onSearchChange,
  placeholder = "Search records",
  children,
}: ToolbarProps) {
  const update = (event: ChangeEvent<HTMLInputElement>) =>
    onSearchChange(event.target.value);

  return (
    <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 px-4 py-3">
      <label className="flex items-center gap-2.5 flex-1 max-w-sm bg-slate-50 border border-slate-200 px-3 py-2 group focus-within:border-[#1A56DB] focus-within:bg-white transition-colors duration-150">
        <Search
          size={15}
          className="text-slate-400 group-focus-within:text-[#1A56DB] flex-shrink-0 transition-colors duration-150"
        />
        <input
          value={search}
          onChange={update}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 outline-none font-medium"
        />
      </label>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}