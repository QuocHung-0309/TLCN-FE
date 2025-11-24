import Image from 'next/image';

interface TrendCardProps {
  index: number;
}

export default function TrendCard({ index }: TrendCardProps) {
  return (
    <div
      className="
        relative w-full 
        h-[120px] sm:h-[140px] md:h-[150px] 
        rounded-[20px] overflow-hidden bg-transparent
      "
    >
      <Image
        src="/card-bg.svg"
        alt="Card background"
        fill
        className="object-cover"
      />

      <div
        className="
          absolute inset-0 flex items-center 
          px-4 sm:px-6 md:px-8 
          py-4 sm:py-5 md:py-6
        "
      >
        <div
          className="
            relative flex-shrink-0 mr-3 sm:mr-4 md:mr-5
            w-10 h-10 sm:w-12 sm:h-12 md:w-15 md:h-15 
            -top-2 sm:-top-3 md:-top-4
          "
        >
          <Image
            src="/place.svg"
            alt="place"
            fill
            className="rounded-full object-cover border-[3px] border-blue-500"
          />
        </div>

        <div className="flex-1 flex items-start gap-x-4 sm:gap-x-8 md:gap-x-13 -mt-2 sm:-mt-3 md:-mt-4">
          <span
            className="
              text-sm sm:text-base md:text-lg
              font-black text-blue-600 uppercase leading-tight
            "
          >
            #{index + 1}
          </span>
          <div className="flex flex-col justify-center">
            <h4
              className="
                text-xs sm:text-sm md:text-base
                font-bold text-blue-700 uppercase leading-tight mt-1 sm:mt-2
              "
            >
              Phường Bàn Cờ
            </h4>
            <p
              className="
                text-[10px] sm:text-xs md:text-sm 
                text-blue-500 uppercase
              "
            >
              TP.HCM
            </p>
          </div>
        </div>

        <div
          className="
            text-xs sm:text-sm md:text-base 
            text-blue-600 font-medium 
            ml-auto flex items-center justify-center h-full
          "
        >
          9km
        </div>
      </div>
    </div>
  );
}
