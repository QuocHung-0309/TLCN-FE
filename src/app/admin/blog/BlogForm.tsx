'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BlogPost } from '@/types/blog'
import { createBlog, updateBlog } from '@/lib/admin/adminBlogApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Toast, useToast } from '@/components/ui/Toast'

interface BlogFormProps {
  initialData?: BlogPost
  isEditing?: boolean
}

export function BlogForm({ initialData, isEditing = false }: BlogFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast, showSuccess, showError, hideToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    summary: initialData?.summary || '',
    content: initialData?.content || '',
    tags: (initialData?.tags || []).join(', '),
    coverImageUrl: initialData?.coverImageUrl || '',
    status: (initialData?.status as 'draft' | 'published' | 'archived') || 'draft'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("📝 Creating blog:", data.title);
      return createBlog(data);
    },
    onSuccess: (result) => {
      console.log("✅ Blog created successfully:", result.post?._id);
      showSuccess('Tạo bài viết thành công!')
      queryClient.invalidateQueries({ queryKey: ['adminBlogs'] })
      setTimeout(() => router.push('/admin/blog'), 1500)
    },
    onError: (error: any) => {
      console.error("❌ Create blog failed:", error.response?.data || error.message);
      showError(error.response?.data?.message || error.message)
      setErrors({ submit: error.response?.data?.message || error.message })
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("📝 Updating blog:", initialData!._id, data.title);
      return updateBlog(initialData!._id, data);
    },
    onSuccess: (result) => {
      console.log("✅ Blog updated successfully:", result.post?._id);
      showSuccess('Cập nhật bài viết thành công!')
      queryClient.invalidateQueries({ queryKey: ['adminBlogs'] })
      queryClient.invalidateQueries({ queryKey: ['adminBlog', initialData!._id] })
      setTimeout(() => router.push('/admin/blog'), 1500)
    },
    onError: (error: any) => {
      console.error("❌ Update blog failed:", error.response?.data || error.message);
      showError(error.response?.data?.message || error.message)
      setErrors({ submit: error.response?.data?.message || error.message })
    }
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc'
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung là bắt buộc'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        tags: formData.tags
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0),
        coverImageUrl: formData.coverImageUrl.trim(),
        status: formData.status
      }

      if (isEditing) {
        await updateMutation.mutateAsync(submitData)
      } else {
        await createMutation.mutateAsync(submitData)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/blog')
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          {isEditing ? 'Cập Nhật Bài Viết' : 'Tạo Bài Viết Mới'}
        </h1>
        <p className="text-slate-600">
          {isEditing ? 'Chỉnh sửa nội dung bài viết blog' : 'Thêm bài viết mới vào blog'}
        </p>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6 md:p-8">
          {errors.submit && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
              <p className="font-medium">Lỗi khi lưu bài viết</p>
              <p className="text-sm mt-1">{errors.submit}</p>
            </div>
          )}

          <div>
            <label className="mb-2 block font-semibold text-slate-900">
              Tiêu đề <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Nhập tiêu đề bài blog"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">• {errors.title}</p>}
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-900">Tóm tắt</label>
            <input
              type="text"
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              placeholder="Nhập tóm tắt bài blog (không bắt buộc)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-slate-500">Tóm tắt sẽ hiển thị trên danh sách bài viết</p>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-900">
              Nội dung <span className="text-red-600">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Nhập nội dung bài blog"
              rows={12}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
            />
            {errors.content && <p className="mt-1 text-sm text-red-600">• {errors.content}</p>}
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-900">Thẻ (Tags)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="du-lich, kinh-nghiem, review (cách nhau bằng dấu phẩy)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-slate-500">Cách nhau bằng dấu phẩy, ví dụ: du-lich, kinh-nghiem, review</p>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-900">URL Ảnh Bìa</label>
            <input
              type="text"
              name="coverImageUrl"
              value={formData.coverImageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {formData.coverImageUrl && (
              <div className="mt-3 border border-slate-200 rounded-lg p-3 bg-slate-50">
                <p className="text-sm text-slate-600 mb-2">Xem trước:</p>
                <img
                  src={formData.coverImageUrl}
                  alt="preview"
                  className="h-32 w-full object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            <p className="mt-1 text-sm text-slate-500">Sử dụng URL hình ảnh từ Cloudinary hoặc CDN</p>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-900">Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="draft">📝 Nháp (Draft)</option>
              <option value="published">✅ Đã xuất bản (Published)</option>
              <option value="archived">📦 Đã lưu trữ (Archived)</option>
            </select>
            <p className="mt-1 text-sm text-slate-500">
              {formData.status === 'draft' && 'Bài viết sẽ không hiển thị với khách hàng'}
              {formData.status === 'published' && 'Bài viết sẽ hiển thị trên website'}
              {formData.status === 'archived' && 'Bài viết sẽ bị ẩn khỏi danh sách'}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Đang xử lý...' : isEditing ? '✏️ Cập nhật' : '➕ Tạo mới'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-slate-200 text-slate-700 px-6 py-3 font-semibold hover:bg-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚫 Hủy
            </button>
          </div>
        </form>
      </div>

      <Toast {...toast} onClose={hideToast} />
    </div>
  )
}
