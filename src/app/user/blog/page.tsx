'use client';

import { useEffect, useState } from 'react';
import { dataBlogPosts } from '@/data/data';
import FeaturedPost from './FeaturedPost';
import SearchBox from '@/components/ui/SearchBox';
import CategorySection from './CategorySection';
import BlogListSection from './BlogListSection';
import RecentPosts from './RecentPosts';
import FeaturedBloggers from './FeaturedBloggers';
import Image from 'next/image';
import { getBlogs } from '@/lib/blog/blogApi';
import { mapBlogToPost } from '@/lib/blog/mapBlogToPost';
import { Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '#/stores/auth';
import { getUserToken } from '@/lib/auth/tokenManager';

export default function BlogPage() {
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([]);
  const [activeCategoryKey, setActiveCategoryKey] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("-createdAt");
  const [loading, setLoading] = useState(false);

  const accessToken = useAuthStore((s) => s.token.accessToken) || getUserToken();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchBlogs();
  }, [activeCategoryKey, sortBy, searchQuery]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params: any = { 
        limit: activeCategoryKey === "all" ? 20 : 10, 
        sort: sortBy 
      };
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      if (activeCategoryKey !== "all") {
        params.category = activeCategoryKey;
      }

      const res = await getBlogs(params);
      const publishedBlogs = res.data
        .filter((blog: any) => blog.status === "published")
        .map(mapBlogToPost);
      
      setFeaturedPosts(publishedBlogs);
    } catch (err) {
      console.error("Lỗi khi lấy featured posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  return (
    <main className="relative overflow-hidden">
      {/* blur */}
      <div className="absolute w-[500px] h-[500px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none z-0" style={{ top: '270px', left: '-240px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none z-0" style={{ top: '600px', left: '1200px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none z-0" style={{ top: '1100px', left: '-60px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none z-0" style={{ top: '2000px', left: '1300px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none z-0" style={{ top: '2500px', left: '-60px' }} />
      
      <Image
        src="/city-bg.svg"
        alt="city-bg"
        width={355}
        height={216}
        className="absolute left-[-100px] top-[535px] z-0 pointer-events-none
             w-[200px] sm:w-[250px] md:w-[300px] lg:w-[355px] h-auto"
      />
      <Image
        src="/Graphic_Elements.svg"
        alt="Graphic_Elements"
        width={192}
        height={176}
        className="absolute left-[1420px] top-[875px] z-0 pointer-events-none
             w-[100px] sm:w-[140px] md:w-[160px] lg:w-[192px] h-auto"
      />

      {/* Header Section with Search & Actions */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog du lịch</h1>
              <p className="text-gray-600">Chia sẻ những trải nghiệm du lịch tuyệt vời</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 lg:w-auto w-full">
              {/* Enhanced Search */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="-createdAt">Mới nhất</option>
                <option value="createdAt">Cũ nhất</option>
                <option value="-views">Nhiều lượt xem</option>
                <option value="title">A - Z</option>
              </select>
              
              {/* Create Post Button */}
              {accessToken && (
                <Link
                  href="/user/post-blog"
                  className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Viết bài
                </Link>
              )}
            </div>
          </div>
          
          {/* User Status */}
          {user && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                👋 Chào {user.fullName}! Bạn có {user.points || 0} điểm. Hãy chia sẻ những trải nghiệm du lịch tuyệt vời của bạn!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {featuredPosts.length > 0 && (
              <FeaturedPost featuredPost={featuredPosts[0]} />
            )}
            
            <div className="mt-8">
              <CategorySection 
                activeCategoryKey={activeCategoryKey}
                onCategoryChange={setActiveCategoryKey}
              />
            </div>

            <div className="mt-8 grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <BlogListSection 
                  posts={featuredPosts}
                  loading={loading}
                  searchQuery={searchQuery}
                  category={activeCategoryKey}
                />
              </div>
              
              <div className="space-y-8">
                <RecentPosts limit={5} />
                <FeaturedBloggers limit={5} />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}