export interface Post {
  id: string;
  title: string;
}

export interface Review {
  id: string;
  title: string;
}

export interface User {
  id: string,
  username: string;
  avatar: string;
  cover: string;
  email: string;
  phone: string;
  totalPoints: number;
  badges: string,
  posts: Post[];
  reviews: Review[];
}

export const users: User[] = [
  {
    id:"user_1",
    username: "john_doe",
    avatar: "https://i.pinimg.com/736x/c9/8e/27/c98e274b5ce201b29065ea589fb6f2ab.jpg",
    cover: "https://i.pinimg.com/736x/55/46/94/554694bd7f04790c18110fcd03345428.jpg",
    email: "john@example.com",
    phone: "123456789",
    totalPoints: 1200,
    badges: 'Adventurer',
    posts: [
      { id: "p1", title: "Top 10 điểm đến ở Việt Nam" },
      { id: "p2", title: "Hành trình phượt Hà Giang" }
    ],
    reviews: [
      { id: "r1", title: "Review khách sạn ABC Đà Lạt" },
      { id: "r2", title: "Trải nghiệm chèo SUP ở Đà Nẵng" }
    ]
  },   
  {
    id:"user_1",
    username: "john_doe",
    avatar: "https://i.pinimg.com/736x/c9/8e/27/c98e274b5ce201b29065ea589fb6f2ab.jpg",
    cover: "https://i.pinimg.com/736x/55/46/94/554694bd7f04790c18110fcd03345428.jpg",
    email: "john@example.com",
    phone: "123456789",
    totalPoints: 1200,
    badges: 'Adventurer',
    posts: [
      { id: "p1", title: "Top 10 điểm đến ở Việt Nam" },
      { id: "p2", title: "Hành trình phượt Hà Giang" }
    ],
    reviews: [
      { id: "r1", title: "Review khách sạn ABC Đà Lạt" },
      { id: "r2", title: "Trải nghiệm chèo SUP ở Đà Nẵng" }
    ]
  },   
  {
    id:"user_2",
    username: "john_doe",
    avatar: "https://i.pinimg.com/736x/c9/8e/27/c98e274b5ce201b29065ea589fb6f2ab.jpg",
    cover: "https://i.pinimg.com/736x/55/46/94/554694bd7f04790c18110fcd03345428.jpg",
    email: "john@example.com",
    phone: "123456789",
    totalPoints: 1200,
    badges: 'Adventurer',
    posts: [
      { id: "p1", title: "Top 10 điểm đến ở Việt Nam" },
      { id: "p2", title: "Hành trình phượt Hà Giang" }
    ],
    reviews: [
      { id: "r1", title: "Review khách sạn ABC Đà Lạt" },
      { id: "r2", title: "Trải nghiệm chèo SUP ở Đà Nẵng" }
    ]
  },   
  {
    id:"user_3",
    username: "john_doe",
    avatar: "https://i.pinimg.com/736x/c9/8e/27/c98e274b5ce201b29065ea589fb6f2ab.jpg",
    cover: "https://i.pinimg.com/736x/55/46/94/554694bd7f04790c18110fcd03345428.jpg",
    email: "john@example.com",
    phone: "123456789",
    totalPoints: 1200,
    badges: 'Adventurer',
    posts: [
      { id: "p1", title: "Top 10 điểm đến ở Việt Nam" },
      { id: "p2", title: "Hành trình phượt Hà Giang" }
    ],
    reviews: [
      { id: "r1", title: "Review khách sạn ABC Đà Lạt" },
      { id: "r2", title: "Trải nghiệm chèo SUP ở Đà Nẵng" }
    ]
  },   
];
