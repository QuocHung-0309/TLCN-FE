import { notFound } from 'next/navigation';
import { dataBlogPosts } from '@/data/data';
import { Metadata } from 'next';
import BlogDetail from '../BlogDetail';
import FeaturedBloggers from '../FeaturedBloggers';
import RecentPosts from '../RecentPosts';
import PopularPostsSection from '../../home/TourList';
import ReviewSection from '../ReviewSection';
import { dataReviews } from '@/data/dataReviews';
import CommentBox from '../CommentBox';
import Image from 'next/image';
import SocialShare from '../SocialShare';
import { getBlogBySlug } from '@/lib/blog/blogApi';


interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getBlogBySlug(slug);

    return {
      title: `${post.title} | Travel Blog`,
      description: post.content.slice(0, 150) + "...",
      openGraph: {
        title: post.title,
        description: post.content.slice(0, 150) + "...",
        images: [{ url: post.mainImage }],
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  try {
    const { slug } = await params;
    const post = await getBlogBySlug(slug);

  return (
    <main className="relative overflow-hidden">
      {/* blur */}
          <div className="absolute w-[500px] h-[500px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: '270px', left: '-240px' }} />
          <div className="absolute w-[500px] h-[500px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: '600px', left: '1200px' }} />
          <div className="absolute w-[500px] h-[500px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: '1100px', left: '-60px' }} />
          <div className="absolute w-[500px] h-[500px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: '2000px', left: '1300px' }} />
          <div className="absolute w-[500px] h-[500px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: '2500px', left: '-60px' }} />
          
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
          <Image
            src="/Graphic_Elements.svg"
            alt="Graphic_Elements"
            width={192}
            height={176}
            className="absolute left-[1420px] top-[2800px] z-0 pointer-events-none w-[100px] sm:w-[140px] md:w-[160px] lg:w-[192px] h-auto"
        />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-12">
          <div className="flex flex-col lg:flex-row gap-4 mt-6">
            {/* Nội dung bài viết */}
            <div className="flex-[0.7] min-w-0">
              <BlogDetail post={post} />
              {/* Social share */}
              <SocialShare />
              <ReviewSection reviews={dataReviews} />
              <CommentBox />
            </div>

            {/* Sidebar */}
            <div className="flex-[0.3] w-full lg:max-w-xs px-4 md:px-6 lg:pl-4 lg:pr-8 xl:px-0 pb-4 md:pb-6 lg:pb-8">
              <RecentPosts />
              <FeaturedBloggers />
            </div>
          </div>

          <PopularPostsSection />
        </div>
      </main>
    );
  } catch {
    return notFound();
  }
}