export interface Review {
    username: string;
    rating: number;
    status:string;
    ratingText: string;
    avatar: string;
    destinationId: string;
  }
  
  export const reviews: Review[] = [
    {
      username: "Linh Nguyen",
      rating: 5,
      status:'Amazing',
      ratingText: "Không gian yên tĩnh, phù hợp để học và làm việc. Rất thích cách phục vụ ở đây!",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      destinationId: "highland-coffee"
    },
    {
      username: "Minh Tran",
      rating: 4,
      status:'Amazing',
      ratingText: "Cà phê ngon, nhân viên dễ thương, chỉ hơi đông vào giờ cao điểm.",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      destinationId: "highland-coffee"
    },
    {
      username: "Quynh Anh",
      rating: 5,
      status:'Amazing',
      ratingText: "Không gian đẹp, nước uống chất lượng. Rất hợp để hẹn bạn bè!",
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
      destinationId: "the-coffee-house"
    },
    {
      username: "Hoang Pham",
      rating: 4.5,
      status:'Amazing',
      ratingText: "Trà ổn, cà phê hơi đắng so với khẩu vị của mình. Bù lại view khá đẹp.",
      avatar: "https://randomuser.me/api/portraits/men/33.jpg",
      destinationId: "phuc-long"
    },
    {
      username: "Thao Le",
      rating: 4,
      status:'Amazing',
      ratingText: "Phúc Long luôn là lựa chọn hàng đầu của mình khi muốn uống trà ngon!",
      avatar: "https://randomuser.me/api/portraits/women/25.jpg",
      destinationId: "phuc-long"
    }
  ];
  