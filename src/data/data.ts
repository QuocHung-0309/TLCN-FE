//tạo giữ liệu giả để sử dụng
export const dataBlogPosts = [
  {
    id: 1,
    title: "Khám phá Sài Gòn về đêm: Những điểm đến không thể bỏ lỡ",
    slug: "kham-pha-sai-gon-ve-dem-nhung-diem-den-khong-the-bo-lo",
    category: "travel",
    image: "/blog.svg",
    author: "Nguyễn Minh Anh",
    authorAvatar: "/icon.svg",
    date: "2025-08-01T19:30:00Z",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    content:
      "Sài Gòn về đêm mang một vẻ đẹp rất riêng với những ánh đèn lung linh và nhịp sống sôi động. Từ phố đi bộ Nguyễn Huệ đến chợ đêm Bến Thành, bạn sẽ tìm thấy vô vàn điều thú vị để trải nghiệm.",
  },
  {
    id: 2,
    title: "Ẩm thực miền Tây: Top 5 món ngon phải thử một lần",
    slug: "am-thuc-mien-tay-top-5-mon-ngon-phai-thu-mot-lan",
    category: "food",
    image: "/image23.svg",
    author: "Trần Quốc Huy",
    authorAvatar: "/icon.svg",
    date: "2025-07-25T09:15:00Z",
    address: "Chợ nổi Cái Răng, Cần Thơ",
    content:
      "Miền Tây nổi tiếng với sự phong phú của ẩm thực. Từ hủ tiếu, cá lóc nướng trui đến bánh xèo, mỗi món đều mang hương vị đậm đà và sự thân thiện của người dân nơi đây.",
  },
  {
    id: 3,
    title: "Review homestay Đà Lạt: Góc chill giữa lòng thành phố sương mù",
    slug: "review-homestay-da-lat-goc-chill-giua-long-thanh-pho-suong-mu",
    category: "spiritual",
    image: "/blog.svg",
    author: "Phạm Thảo My",
    authorAvatar: "/icon.svg",
    date: "2025-08-03T14:00:00Z",
    address: "25 Trần Hưng Đạo, Đà Lạt",
    content:
      "Homestay này được thiết kế theo phong cách Scandinavian, mang lại cảm giác ấm cúng và gần gũi với thiên nhiên. Buổi sáng ngắm bình minh, buổi tối thưởng trà, cảm giác thật yên bình.",
  },
  {
    id: 4,
    title: "Trải nghiệm trekking Tà Năng - Phan Dũng: Hành trình thử thách",
    slug: "trai-nghiem-trekking-ta-nang-phan-dung-hanh-trinh-thu-thach",
    category: "experience",
    image: "/blog.svg",
    author: "Lê Hoàng Nam",
    authorAvatar: "/icon.svg",
    date: "2025-06-18T06:45:00Z",
    address: "Xuất phát từ Tà Năng, Lâm Đồng",
    content:
      "Cung đường trekking đẹp nhất Việt Nam đưa bạn qua nhiều dạng địa hình khác nhau: rừng thông, đồi cỏ, suối mát. Đây là trải nghiệm đáng nhớ cho những ai yêu thích phiêu lưu và khám phá.",
  },
  {
    id: 5,
    title: "Cà phê phong cách vintage: Top quán đẹp ở Hà Nội",
    slug: "ca-phe-phong-cach-vintage-top-quan-dep-o-ha-noi",
    category: "travel 1",
    image: "/blog.svg",
    author: "Ngô Thanh Bình",
    authorAvatar: "/icon.svg",
    date: "2025-08-02T08:20:00Z",
    address: "45 Hàng Bạc, Hoàn Kiếm, Hà Nội",
    content:
      "Những quán cà phê vintage tại Hà Nội đang thu hút giới trẻ bởi không gian hoài cổ và cực kỳ 'chill'. Đây là nơi lý tưởng để sống ảo và tận hưởng không khí thủ đô.",
  },
  {
    id: 6,
    title: "Lễ hội pháo hoa Đà Nẵng 2025: Lịch trình và địa điểm xem đẹp nhất",
    slug: "le-hoi-phao-hoa-da-nang-2025-lich-trinh-va-dia-diem-xem-dep-nhat",
    category: "travel 2",
    image: "/blog.svg",
    author: "Đỗ Bích Ngọc",
    authorAvatar: "/icon.svg",
    date: "2025-06-30T21:00:00Z",
    address: "Bờ sông Hàn, Đà Nẵng",
    content:
      "Lễ hội pháo hoa quốc tế Đà Nẵng 2025 hứa hẹn mang đến những màn trình diễn mãn nhãn. Hãy chuẩn bị sẵn lịch trình và vị trí đẹp để thưởng thức sự kiện hoành tráng này.",
  },
  {
    id: 7,
    title: "Check-in đảo Phú Quốc: 7 địa điểm biển đẹp mê hồn",
    slug: "check-in-dao-phu-quoc-7-dia-diem-bien-dep-me-hon",
    category: "travel",
    image: "/blog.svg",
    author: "Võ Thanh Phương",
    authorAvatar: "/icon.svg",
    date: "2025-05-20T10:00:00Z",
    address: "Bãi Sao, Phú Quốc",
    content:
      "Phú Quốc nổi tiếng với những bãi biển hoang sơ, nước trong xanh như ngọc. Nếu bạn đang tìm nơi nghỉ dưỡng lý tưởng, Phú Quốc chắc chắn là lựa chọn không thể bỏ qua.",
  },
  {
    id: 8,
    title: "Hướng dẫn săn mây Tà Xùa: Thời gian và chuẩn bị cần thiết",
    slug: "huong-dan-san-may-ta-xua-thoi-gian-va-chuan-bi-can-thiet",
    category: "travel",
    image: "/blog.svg",
    author: "Hoàng Thị Hạnh",
    authorAvatar: "/icon.svg",
    date: "2025-07-10T05:30:00Z",
    address: "Tà Xùa, Sơn La",
    content:
      "Săn mây ở Tà Xùa là trải nghiệm tuyệt vời dành cho những người yêu thích khám phá. Hãy chọn thời điểm tháng 11 - 3 để có cơ hội ngắm biển mây đẹp nhất.",
  },
  {
    id: 9,
    title: "Tour miền Trung 4 ngày 3 đêm: Khám phá Huế - Đà Nẵng - Hội An",
    slug: "tour-mien-trung-4-ngay-3-dem-kham-pha-hue-da-nang-hoi-an",
    category: "travel",
    image: "/blog.svg",
    author: "Lương Văn Tuấn",
    authorAvatar: "/icon.svg",
    date: "2025-06-15T07:45:00Z",
    address: "Huế - Đà Nẵng - Hội An",
    content:
      "Hành trình du lịch miền Trung đưa bạn qua những di sản văn hóa nổi tiếng và cảnh đẹp mê hồn. Đây là lịch trình lý tưởng cho kỳ nghỉ hè cùng gia đình.",
  },
  {
    id: 10,
    title: "Khám phá Mộc Châu mùa hoa mận: Vẻ đẹp trắng xóa bạt ngàn",
    slug: "kham-pha-moc-chau-mua-hoa-man-ve-dep-trang-xoa-bat-ngan",
    category: "travel",
    image: "/blog.svg",
    author: "Trịnh Khánh Linh",
    authorAvatar: "/icon.svg",
    date: "2025-08-05T11:10:00Z",
    address: "Mộc Châu, Sơn La",
    content:
      "Mộc Châu mùa hoa mận như khoác lên mình tấm áo trắng tinh khôi. Đây là thời điểm tuyệt vời để bạn chụp những bức ảnh đẹp và tận hưởng không khí trong lành vùng cao.",
  },
  {
    id: 11,
    title: "Sài Gòn về đêm: Hành trình khám phá năng lượng thành phố không ngủ",
    slug: "sai-gon-ve-dem-hanh-trinh-kham-pha-nang-luong-thanh-pho-khong-ngu",
    category: "travel",
    image: "/image20.svg",
    author: "Trần Minh Khoa",
    authorAvatar: "/image21.svg",
    date: "2025-08-08T20:00:00Z",
    address: "Quận 1, TP.HCM",
    content: `
  Sài Gòn về đêm ẩn chứa bao câu chuyện và nhịp sống riêng biệt mà chỉ khi màn đêm buông xuống, bạn mới cảm nhận trọn vẹn.
  ![Sài Gòn](/image22.svg)

  ## 1. Phố đi bộ Nguyễn Huệ – trái tim sôi động

  Không gian dành cho người đi bộ rộng mở ở trung tâm Quận 1, nơi bạn có thể thong dong dạo bước, nghe những giai điệu đường phố và hòa mình vào dòng người thư thái giữa trung tâm thành phố. 

  
  ## 2. Chợ đêm Bến Thành – thiên đường ẩm thực và mua sắm

  Chợ đêm nhộn nhịp bên cạnh chợ truyền thống, nơi bạn tha hồ thưởng thức đủ món ăn đường phố như bánh tầm, bún chả cá, chè… Đừng quên trả giá khi mua quà lưu niệm nhé — cái giá thật thường chỉ khoảng **50 % giá ban đầu**.

  ![Chợ Bến Thành](/image23.svg)

  ## 3. Nhâm nhi cà phê rooftop – ngắm thành phố từ trên cao

  Các quán bar trên cao như **Saigon Saigon Rooftop Bar** hay **Social Club** mang đến tầm nhìn toàn cảnh thành phố lung linh trong ánh đèn — nơi bạn vừa thư thái với đồ uống, vừa cảm nhận hơi thở đô thị.

  ## 4. Landmark kiến trúc Pháp – chìm trong ánh đèn vàng

  Các công trình như **Nhà thờ Đức Bà**, **Bưu điện trung tâm Sài Gòn**, và **Dinh Độc Lập** khoác lên mình vẻ đẹp cổ kính khi đêm xuống — tạo background lý tưởng để bạn sống ảo hòa cùng di sản kiến trúc.

  ![alt](https://static.vinwonders.com/production/landmark-81-banner.jpg)
  ---

  ## 5. Địa đạo Củ Chi – hành trình lịch sử không thể bỏ qua

  Chỉ cách trung tâm thành phố khoảng 70 km, hệ thống **địa đạo Củ Chi** giúp bạn hiểu thêm về lịch sử kháng chiến Việt Nam qua những đường hầm uốn lượn bên dưới lòng đất.

  ## 6. Đề xuất ngắn gọn cho đêm Sài Gòn:

  - **Thời điểm lý tưởng**: 19h – 22h, khi không khí mát mẻ và các hoạt động bắt đầu sôi động.
  - **Lưu ý di chuyển**: Đi taxi, xe công nghệ hoặc xe máy – cần cẩn thận vì đường đêm vẫn đông xe.
  - **Thử ngay**: Một ly cà phê, hay đơn giản là “tạt ngang” chợ đêm để lắng nghe thành phố về đêm là đủ thấy “Sài Gòn là của bạn”.

  > “Sài Gòn không ngủ — nơi mỗi góc đều kể câu chuyện riêng, và mỗi ánh đèn là một nhịp sống sẵn sàng tiếp bạn.”  
  > — Một đêm Sài Gòn, một hành trình không thể lặp lại
    `
  }

];
