'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getAdminBlogById } from '@/lib/admin/adminBlogApi'
import { Toast, useToast } from '@/components/ui/Toast'
import { BlogForm } from '../BlogForm'

export default function EditBlogPage() {
  const params = useParams()
  const { toast, hideToast } = useToast()
  const id = params.id as string

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['adminBlog', id],
    queryFn: () => {
      console.log("📖 Fetching blog:", id);
      return getAdminBlogById(id);
    },
  })





  if (isLoading) {
    return (
      <div className="mx-auto w-[95%] max-w-4xl py-8">
        <div>Đang tải...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto w-[95%] max-w-4xl py-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Không thể tải bài blog
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="mx-auto w-[95%] max-w-4xl py-8">
        <div className="rounded-lg bg-yellow-50 p-4 text-yellow-700">
          Bài blog không tìm thấy
        </div>
      </div>
    )
  }
  return (
    <>
      <div className="space-y-8">
        <BlogForm initialData={blog} isEditing />

        
      </div>

      <Toast {...toast} onClose={hideToast} />

    </>
  )
} 