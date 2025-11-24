// TablePagination.tsx
import React from "react";
import { Table } from "@tanstack/react-table";
import { getPaginationRange } from "./pagination";

interface TablePaginationProps<TData> {
  table: Table<TData>;
}

export function TablePagination<TData>({ table }: TablePaginationProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pages = getPaginationRange(currentPage, totalPages);

  return (
    <div className="sm:flex justify-between mt-4 w-[90%] mx-auto">
        <div className="h4 text-gray-400 mb-2">Show {currentPage}- { (totalPages - currentPage < 3) ? totalPages : currentPage + 3 } from {totalPages} </div>
         <div className="flex items-center gap-2">
            {/* Previous */}
            <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-2 py-1 rounded disabled:opacity-50 bg-[#DEDEFA] text-(--primary) font-bold"
            >
                <i className="ri-arrow-left-s-line"></i>
            </button>

            {/* Pages */}
            {pages.map((p, idx) =>
                p === "..." ? (
                <span key={idx} className="px-2">
                    ...
                </span>
                ) : (
                <button
                    key={idx}
                    onClick={() => table.setPageIndex((p as number) - 1)}
                    className={`px-3 py-1 rounded bg-[#DEDEFA] text-(--primary) font-bold ${
                    p === currentPage ? "!bg-(--primary) text-white" : ""
                    }`}
                >
                    {p}
                </button>
                )
            )}

            {/* Next */}
            <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-2 py-1 rounded disabled:opacity-50 bg-[#DEDEFA] text-(--primary) font-bold"
            >
                <i className="ri-arrow-right-s-line"></i>
            </button>
            </div>
    </div>
   
  );
}
