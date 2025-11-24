import Image from 'next/image';
import { HiLocationMarker } from 'react-icons/hi';

interface LocationCardProps {
  title: string;
  district: string;
  image: string;
  size?: 'small' | 'medium' | 'large';
  height?: number;
}

const LocationCard = ({
  title,
  district,
  image,
  size = 'large',
  height,
}: LocationCardProps) => {
  const widthClass = {
    small:  'w-[140px] md:w-[160px]',
    medium: 'w-[180px] md:w-[200px]',
    large:  'w-[200px] md:w-[240px]',
  }[size];

  const defaultHeights = {
    small: 60,
    medium: 110,
    large: 140,
  };

  const imageHeight = height ?? defaultHeights[size];

  return (
    <div
      className={`bg-white rounded-2xl shadow-md overflow-hidden ${widthClass} transition duration-300`}
    >
      <div className="pt-1 ">
        <div
          className="relative w-full overflow-hidden rounded-xl"
          style={{ height: `${imageHeight}px` }}
        >
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover rounded-2xl"
            sizes="100vw"
          />
        </div>
      </div>

      <div className="p-2">
        <h3 className="font-semibold text-sm text-[var(--black-1)] mb-1">
          {title}
        </h3>

        <div className="flex items-center gap-1 text-xs text-[var(--gray-2)]">
          <HiLocationMarker className="w-4 h-4 text-[#47A9C4]" />
          <span>{district}</span>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
