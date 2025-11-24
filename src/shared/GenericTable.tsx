'use client'
import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {TablePagination } from "@/shared/TablePagination"


interface GenericTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  initialPageSize?: number
}

export function GenericTable<T>({ data, columns, initialPageSize = 5 }: GenericTableProps<T>) {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: initialPageSize
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), 
  })

  return (
    <div className="rounded-md border shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>      

      {/* <TablePagination table={table} /> */}

    </div>
  )
}
