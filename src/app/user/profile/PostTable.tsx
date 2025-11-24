'use client'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'
import { GenericTable } from "@/shared/GenericTable"
import {Post, posts} from "../../assets/data/post";


interface Props {
    data: Post[]
  }


export function PostTable({ data }: Props) {

    const columns = useMemo<ColumnDef<Post>[]>(() => [
        {
            header: 'Bài đăng',
            accessorKey: 'title',
            cell: ({row}) => {
                const post = row.original;
                return (
                    <div className="flex gap-3">
                        <img src={post.cover} alt="" className='h-10 w-10 object-cover rounded-md'/>
                        <h2>{post.title}</h2>
                    </div>
                )
            },
        },
        {
            header: 'Lượt tiếp cận',
            accessorKey: 'views',
            cell: ({ getValue }) => {
                const value = getValue() as string;
                return <span>{value}</span>;
              }
          },
          {
            header: 'Ngày đăng',
            accessorKey: 'createdAt',
            cell: ({ getValue }) => {
              const date = new Date(getValue() as string)
              return <span>{date.toLocaleDateString('vi-VN')}</span>
            },
          },
        ], [])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        })

    return (
        <div className="[&>div]:!border-0 [&>div]:!shadow-none [&>div]:!rounded-none">
            <GenericTable data={data} columns={columns} />
        </div>
        //<GenericTable data={data} columns={columns} />

        )
    
    
}