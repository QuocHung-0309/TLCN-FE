export type Post = {
    id: number
    username: string
    cover: string
    views: number
    date: string
    title: string
  }
  
  export const posts: Post[] = [
    {
      id: 1,
      username: "user_1",
      cover: "https://i.pinimg.com/1200x/12/00/0d/12000dc94f5ac4f32695e4777a857f59.jpg",
      views: 1234,
      date: "2025-08-07",
      title: "Khám phá vùng đất bí ẩn"
    },
    {
      id: 2,
      username: "user_1",
      cover: "https://i.pinimg.com/1200x/12/00/0d/12000dc94f5ac4f32695e4777a857f59.jpg",
      views: 5678,
      date: "2025-08-06",
      title: "Hành trình đến đỉnh núi tuyết"
    },
    {
      id: 3,
      username: "user_1",
      cover: "https://i.pinimg.com/1200x/12/00/0d/12000dc94f5ac4f32695e4777a857f59.jpg",
      views: 2145,
      date: "2025-08-05",
      title: "Bí kíp du lịch tiết kiệm mùa hè"
    },
    {
      id: 4,
      username: "user_1",
      cover: "https://i.pinimg.com/1200x/12/00/0d/12000dc94f5ac4f32695e4777a857f59.jpg",
      views: 4210,
      date: "2025-08-04",
      title: "Check-in top 5 bãi biển đẹp nhất"
    },
    {
      id: 5,
      username: "user_1",
      cover: "https://i.pinimg.com/1200x/12/00/0d/12000dc94f5ac4f32695e4777a857f59.jpg",
      views: 3120,
      date: "2025-08-03",
      title: "Top điểm đến dành cho người thích khám phá"
    }
  ]
  