import React from "react";

interface Column {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
}

interface DynamicTableProps {
  columns: Column[];
  data: Record<string, any>[];
  className?: string;
}

export default function DynamicTable({
  columns,
  data,
  className = "",
}: DynamicTableProps) {
  return (
    <div
      className={`w-full py-4 ${className}`}
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        {/* Table View */}
        <div>
          <table className="w-full table-fixed">
            <thead style={{ backgroundColor: "#F9FAFB" }}>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    className={`px-2 py-2 md:px-6 md:py-4 font-semibold text-xs md:text-base ${
                      column.align === "center"
                        ? "text-center"
                        : column.align === "right"
                          ? "text-right"
                          : "text-left"
                    } ${index === 0 ? "rounded-tl-2xl" : ""} ${
                      index === columns.length - 1 ? "rounded-tr-2xl" : ""
                    }`}
                    style={{ color: "var(--primary)" }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key}
                      className={`px-2 py-2 md:px-6 md:py-4 text-xs md:text-base break-words ${
                        column.align === "center"
                          ? "text-center"
                          : column.align === "right"
                            ? "text-right"
                            : "text-left"
                      } ${
                        colIndex === 0
                          ? "font-medium text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
