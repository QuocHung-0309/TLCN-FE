'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BlogPost } from '@/types/blog'
import { createBlog, updateBlog } from '@/lib/admin/adminBlogApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { ImagePlus, Type, Tag, Send, ArrowLeft, Image as ImageIcon, Settings } from 'lucide-react'
import RichTextEditor from './RichTextEditor'

const CATEGORY_OPTIONS = [
  "Du lịch", "Ẩm thực", "Trải nghiệm", "Review", "Cẩm nang", "Kinh nghiệm", "Nghỉ dưỡng"
];

interface BlogFormProps {
  initialData?: BlogPost
  isEditing?: boolean
}

const isContentEmpty = (html: string) =>
  html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim() === "";

export function BlogForm({ initialData, isEditing = false }: BlogFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    summary: initialData?.summary || '',
    content: initialData?.content || '',
    categories: (initialData as any)?.categories?.[0] || '',
    tags: (initialData?.tags || []).join(', '),
    coverImageUrl: initialData?.coverImageUrl || '',
    status: (initialData?.status as 'draft' | 'published' | 'archived') || 'draft',
    locationDetail: (initialData as any)?.locationDetail || '',
    province: (initialData as any)?.province || '',
    ward: (initialData as any)?.ward || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return createBlog(data);
    },
    onSuccess: (result) => {
      toast.success('Tạo bài viết thành công!')
      queryClient.invalidateQueries({ queryKey: ['adminBlogs'] })
      setTimeout(() => router.push('/admin/blog'), 1000)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi tạo bài viết')
      setErrors({ submit: error.response?.data?.message || error.message })
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return updateBlog(initialData!._id, data);
    },
    onSuccess: (result) => {
      toast.success('Cập nhật bài viết thành công!')
      queryClient.invalidateQueries({ queryKey: ['adminBlogs'] })
      queryClient.invalidateQueries({ queryKey: ['adminBlog', initialData!._id] })
      setTimeout(() => router.push('/admin/blog'), 1000)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật bài viết')
      setErrors({ submit: error.response?.data?.message || error.message })
    }
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc'
    }
    if (isContentEmpty(formData.content)) {
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

  const handleContentChange = (value: string) => {
    setFormData(prev => ({ ...prev, content: value }))
    if (errors.content) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.content
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc")
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        content: formData.content,
        categories: formData.categories ? [formData.categories] : [],
        tags: formData.tags
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0),
        coverImageUrl: formData.coverImageUrl.trim(),
        status: formData.status,
        locationDetail: formData.locationDetail.trim(),
        province: formData.province.trim(),
        ward: formData.ward.trim()
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
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {isEditing ? 'Cập Nhật Bài Viết' : 'Tạo Bài Viết Mới'}
            </h1>
            <p className="text-slate-600">
              {isEditing ? 'Chỉnh sửa nội dung và thông tin bài viết' : 'Bắt đầu soạn thảo bài viết mới cho hệ thống'}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition shadow-sm shrink-0"
          >
            <i className="ri-arrow-left-line"></i>
            Quay lại danh sách
          </button>
        </div>

        {/* Main Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {errors.submit && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-error-warning-fill text-lg"></i>
              </div>
              <div>
                <p className="font-bold">Lỗi khi lưu bài viết</p>
                <p className="text-sm">{errors.submit}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Cover Image URL Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <ImagePlus className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Ảnh bìa (URL)</h3>
                      <p className="text-xs text-slate-500">Dán đường dẫn ảnh để làm ảnh bìa</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <input
                    type="text"
                    name="coverImageUrl"
                    value={formData.coverImageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-orange-400 focus:bg-white transition text-sm"
                  />
                  {formData.coverImageUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-[21/9] flex items-center justify-center relative group shadow-sm">
                      <img
                        src={formData.coverImageUrl}
                        alt="preview"
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 aspect-[21/9] flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                      <span className="text-sm font-semibold text-slate-500">Chưa có ảnh bìa</span>
                      <span className="text-xs text-slate-400 mt-1">Dán URL ảnh phía trên để xem trước</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Editor Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Type className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Nội dung</h3>
                      <p className="text-xs text-slate-500">Viết tiêu đề và nội dung chi tiết</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tiêu đề <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Nhập tiêu đề bài viết..."
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition text-slate-900 font-medium ${errors.title ? 'border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/30' : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-400'}`}
                    />
                    {errors.title && <p className="mt-1.5 ml-1 text-sm text-red-500 font-medium flex items-center gap-1"><i className="ri-error-warning-line"></i>{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tóm tắt</label>
                    <textarea
                      name="summary"
                      value={formData.summary}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Nhập một đoạn tóm tắt ngắn (không bắt buộc)..."
                      className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-400 transition text-slate-700 text-sm resize-none"
                    />
                  </div>

                  <RichTextEditor 
                    content={formData.content} 
                    onContentChange={handleContentChange}
                    error={errors.content}
                  />
                </div>
              </div>

            </div>

            {/* Right Column - Settings */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Settings Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Thiết lập</h3>
                      <p className="text-xs text-slate-500">Trạng thái, quyền riêng tư & từ khóa</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Trạng thái</label>
                    <div className="relative">
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full pl-4 pr-10 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-orange-400 focus:bg-white font-medium text-slate-700 appearance-none outline-none transition"
                      >
                        <option value="draft">Bản nháp</option>
                        <option value="published">Xuất bản</option>
                        <option value="archived">Lưu trữ</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                        <i className="ri-arrow-down-s-line text-lg"></i>
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Danh mục</label>
                    <div className="relative">
                      <select
                        name="categories"
                        value={formData.categories}
                        onChange={handleInputChange}
                        className="w-full pl-4 pr-10 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-orange-400 focus:bg-white font-medium text-slate-700 appearance-none outline-none transition text-sm"
                      >
                        <option value="">Chọn danh mục...</option>
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                        <i className="ri-arrow-down-s-line text-lg"></i>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Vị trí địa lý</label>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          name="province"
                          value={formData.province}
                          onChange={handleInputChange}
                          placeholder="Tỉnh / Thành..."
                          className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-orange-400 focus:bg-white outline-none transition text-sm"
                        />
                        <input
                          type="text"
                          name="ward"
                          value={formData.ward}
                          onChange={handleInputChange}
                          placeholder="Phường / Xã..."
                          className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-orange-400 focus:bg-white outline-none transition text-sm"
                        />
                      </div>
                      <input
                        type="text"
                        name="locationDetail"
                        value={formData.locationDetail}
                        onChange={handleInputChange}
                        placeholder="Số nhà, tên đường..."
                        className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-orange-400 focus:bg-white outline-none transition text-sm"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Từ khóa (Tags)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Tag className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="tag1, tag2..."
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-orange-400 focus:bg-white outline-none transition text-sm"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 ml-1">Cách nhau bởi dấu phẩy</p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          {isEditing ? 'Lưu Thay Đổi' : 'Đăng Bài Viết'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
