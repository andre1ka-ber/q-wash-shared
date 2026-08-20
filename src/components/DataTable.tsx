import type { CSSProperties, ReactNode } from 'react';
import { color } from '../theme';
import { Panel } from './Panel';

export interface DataTableProps {
  children: ReactNode;
}

export function DataTable({ children }: DataTableProps) {
  return <Panel style={{ overflow: 'hidden' }}>{children}</Panel>;
}

export interface DataTableHeaderRowProps {
  gridTemplateColumns: string;
  columns: ReactNode[];
}

const headerCellStyle: CSSProperties = {
  color: color.textFaint,
  fontSize: 11,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
};

export function DataTableHeaderRow({ gridTemplateColumns, columns }: DataTableHeaderRowProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns,
        gap: 14,
        padding: '14px 20px',
        borderBottom: `1px solid ${color.border}`,
      }}
    >
      {columns.map((col, i) => (
        <div key={i} style={headerCellStyle}>
          {col}
        </div>
      ))}
    </div>
  );
}

export interface DataTableRowProps {
  gridTemplateColumns: string;
  children: ReactNode;
  isLast?: boolean;
}

export function DataTableRow({ gridTemplateColumns, children, isLast }: DataTableRowProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns,
        gap: 14,
        padding: '16px 20px',
        borderBottom: isLast ? 'none' : `1px solid ${color.rowBorder}`,
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  );
}
