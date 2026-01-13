import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  overscan?: number;
  onRowClick?: (item: T) => void;
  getRowId?: (item: T) => string;
}

export function VirtualizedTable<T extends { id?: string }>({
  data,
  columns,
  rowHeight = 48,
  overscan = 5,
  onRowClick,
  getRowId,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });
  
  const items = virtualizer.getVirtualItems();
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            {columns.map((col) => (
              <TableHead key={String(col.key)} style={{ width: col.width }}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <tr style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
            <td colSpan={columns.length} style={{ padding: 0 }}>
              {items.map((virtualRow) => {
                const item = data[virtualRow.index];
                const id = getRowId ? getRowId(item) : (item.id || String(virtualRow.index));
                return (
                  <div
                    key={id}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${rowHeight}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={`flex items-center border-b ${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((col) => (
                      <div
                        key={String(col.key)}
                        className="px-4 py-2 text-sm"
                        style={{ width: col.width || 'auto', flex: col.width ? 'none' : 1 }}
                      >
                        {col.render
                          ? col.render(item, virtualRow.index)
                          : String((item as any)[col.key] ?? '')}
                      </div>
                    ))}
                  </div>
                );
              })}
            </td>
          </tr>
        </TableBody>
      </Table>
    </div>
  );
}
