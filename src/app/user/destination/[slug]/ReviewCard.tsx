import { Review } from "@/types/review";
import Image from "next/image";

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`ri-star-fill text-lg ${
            i <= review.rating ? "text-yellow-400" : "text-gray-300"
          }`}
        ></i>
      );
    }
    return stars;
  };

  return (
    <>
      <div className="flex gap-4">
        <Image
          src={review.userId.avatar || "/avatar.svg"}
          alt=""
          className="rounded-full h-16 w-16"
          width={64}
          height={64}
        />
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center border-r pr-4">
              <div className="flex">{renderStars()}</div>
            </div>
            <h6>{review.userId.name}</h6>
          </div>
          <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
        </div>
        <i className="ri-flag-fill cursor-pointer"></i>
      </div>
      <span className="block h-px bg-gray-300 my-6" />
    </>
  );
};

export default ReviewCard;