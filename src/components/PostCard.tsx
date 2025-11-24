import Link from 'next/link';

interface Post {
  title: string;
  slug: string;
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <div className="border p-4 rounded shadow hover:bg-gray-50 transition">
        <h2 className="text-lg font-semibold">{post.title}</h2>
        <p className="text-sm text-blue-600 mt-1">Xem chi tiết</p>
      </div>
    </Link>
  );
}
