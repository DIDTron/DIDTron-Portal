import * as React from "react";
import { cn } from "@/lib/utils";

interface FixedColumnTableProps {
  children: React.ReactNode;
  className?: string;
}

interface FixedColumnTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface FixedColumnTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface FixedColumnTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface FixedColumnTableHeadProps {
  children?: React.ReactNode;
  className?: string;
  fixed?: boolean;
  colSpan?: number;
  rowSpan?: number;
  onClick?: () => void;
}

interface FixedColumnTableCellProps {
  children?: React.ReactNode;
  className?: string;
  fixed?: boolean;
}

const FixedColumnTable = React.forwardRef<HTMLDivElement, FixedColumnTableProps>(
  ({ children, className }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn("relative border rounded-md", className)}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {children}
          </table>
        </div>
      </div>
    );
  }
);
FixedColumnTable.displayName = "FixedColumnTable";

const FixedColumnTableHeader = React.forwardRef<HTMLTableSectionElement, FixedColumnTableHeaderProps>(
  ({ children, className }, ref) => {
    return (
      <thead 
        ref={ref}
        className={cn("bg-[#3d4f5f] text-white", className)}
      >
        {children}
      </thead>
    );
  }
);
FixedColumnTableHeader.displayName = "FixedColumnTableHeader";

const FixedColumnTableBody = React.forwardRef<HTMLTableSectionElement, FixedColumnTableBodyProps>(
  ({ children, className }, ref) => {
    return (
      <tbody 
        ref={ref}
        className={cn("[&_tr:nth-child(even)]:bg-muted/30", className)}
      >
        {children}
      </tbody>
    );
  }
);
FixedColumnTableBody.displayName = "FixedColumnTableBody";

const FixedColumnTableRow = React.forwardRef<HTMLTableRowElement, FixedColumnTableRowProps>(
  ({ children, className, onClick }, ref) => {
    return (
      <tr 
        ref={ref}
        onClick={onClick}
        className={cn(
          "border-b transition-colors hover:bg-muted/50",
          onClick && "cursor-pointer",
          className
        )}
      >
        {children}
      </tr>
    );
  }
);
FixedColumnTableRow.displayName = "FixedColumnTableRow";

const FixedColumnTableHead = React.forwardRef<HTMLTableCellElement, FixedColumnTableHeadProps>(
  ({ children, className, fixed = false, colSpan, rowSpan, onClick }, ref) => {
    return (
      <th 
        ref={ref}
        colSpan={colSpan}
        rowSpan={rowSpan}
        onClick={onClick}
        className={cn(
          "px-4 py-3 text-left font-medium whitespace-nowrap",
          fixed && "sticky left-0 z-20 bg-[#3d4f5f] after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-white/20",
          onClick && "cursor-pointer",
          className
        )}
      >
        {children}
      </th>
    );
  }
);
FixedColumnTableHead.displayName = "FixedColumnTableHead";

const FixedColumnTableCell = React.forwardRef<HTMLTableCellElement, FixedColumnTableCellProps>(
  ({ children, className, fixed = false }, ref) => {
    return (
      <td 
        ref={ref}
        className={cn(
          "px-4 py-3 whitespace-nowrap",
          fixed && "sticky left-0 z-10 bg-background after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border",
          className
        )}
      >
        {children}
      </td>
    );
  }
);
FixedColumnTableCell.displayName = "FixedColumnTableCell";

export {
  FixedColumnTable,
  FixedColumnTableHeader,
  FixedColumnTableBody,
  FixedColumnTableRow,
  FixedColumnTableHead,
  FixedColumnTableCell,
};
