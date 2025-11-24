'use client'
import { ColumnDef } from '@tanstack/react-table'
import { useRouter } from "next/navigation";
import { useMemo, useState, useCallback } from 'react'
import { GenericTable } from "@/shared/GenericTable"
import {User} from '@/types/user'


interface Props {
    data: User[]    
  }

export function UserTable({ data}: Props) {

    const router = useRouter();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    const toggleSelect = useCallback((id: string) => {
      setSelectedIds(prev => {
        const newSet = new Set(prev)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        return newSet
      })
    }, []);    
    
    const toggleSelectAll = useCallback(() => {
      if (selectedIds.size === data.length) setSelectedIds(new Set())
      else setSelectedIds(new Set(data.map(d => d.id)))
    }, [selectedIds.size, data]);

    const columns = useMemo<ColumnDef<User>[]>(() => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={selectedIds.size === data.length && data.length > 0}
            onChange={toggleSelectAll}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.has(row.original.id)}
            onChange={() => toggleSelect(row.original.id)}
          />
        ),
      },
      {
        header: 'Họ tên',
        accessorKey: 'fullName',
        cell: ({ getValue, row }) => {
          const user = row.original;
          return (
            <div className="flex gap-2 items-center">
              <img src={user.avatarUrl || user.avatar || 'https://i.pinimg.com/1200x/e1/1e/07/e11e07774f7fc24da8e03e769a0f0573.jpg'} alt="avatar" className="h-7 w-7 object-cover rounded-full" />
              <span className="clamp-1 font-medium">{getValue() as string}</span>
            </div>
          );
        },
      },
      {
        header: 'Tên đăng nhập',
        accessorKey: 'username',
        cell: ({ getValue }) => <span className="clamp-1">{getValue() as string}</span>,
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ getValue }) => <span className="clamp-1">{getValue() as string}</span>,
      },
      {
        header: 'Số điện thoại',
        accessorKey: 'phoneNumber',
        cell: ({ getValue }) => <span>{getValue() as string || '—'}</span>,
      },
      {
        header: 'Địa chỉ',
        accessorKey: 'address',
        cell: ({ getValue }) => <span>{getValue() as string || '—'}</span>,
      },
      {
        header: 'Trạng thái',
        accessorKey: 'isActive',
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return (
            <span className={value === 'y' ? 'px-2 py-1 bg-[#E7F4EE] text-[#0D894F] rounded-xl font-bold' : 'px-2 py-1 bg-[#FBF0DC] text-[#FFC968] rounded-xl font-bold'}>
              {value === 'y' ? 'Hoạt động' : 'Bị khoá'}
            </span>
          );
        },
      },
      {
        header: 'Ngày tạo',
        accessorKey: 'createdDate',
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return <span className="text-[#667085]">{date.toLocaleDateString('vi-VN')}</span>;
        },
      },
      {
        header: '',
        accessorKey: 'action',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex gap-2">
              <button title="Sửa" onClick={() => router.push(`/admin/users/${user.id}`)} className="text-emerald-600 hover:text-emerald-800"><i className="ri-pencil-line"></i></button>
              <button title="Đặt lại mật khẩu" onClick={() => router.push(`/admin/users/${user.id}/reset-password`)} className="text-orange-500 hover:text-orange-700"><i className="ri-key-line"></i></button>
              <button title="Xóa" className="text-red-500 hover:text-red-700"><i className="ri-delete-bin-6-line"></i></button>
            </div>
          );
        },
      },
    ], [selectedIds, data, router, toggleSelect, toggleSelectAll]);

    return (
        <div className="[&>div]:!border-0 [&>div]:!shadow-none [&>div]:!rounded-none">
            <GenericTable data={data} columns={columns} />
        </div>       
        )
}