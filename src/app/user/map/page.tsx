import CheckinAccordion from "./CheckinAccordion";
import MapBanner from "./MapBanner";
import MapBox from "./MapBox";
import Image from 'next/image';
import RecommendedPlaces from "./RecommendedPlaces";

export default function UserHomeMapPage() {
  return (
   <main className="p-4 relative overflow-x-hidden overflow-y-auto">
      <div className="absolute w-[400px] h-[450px] bg-[var(--secondary)] opacity-60 blur-[250px] pointer-events-none" style={{ top: "100px", left: "-120px" }} />
      <div className="absolute w-[500px] h-[550px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "120px", left: "1480px" }} />
      <div className="absolute w-[400px] h-[450px] bg-[var(--secondary)] opacity-60 blur-[250px] pointer-events-none" style={{ top: "1500px", left: "1280px" }} />
      <div className="absolute w-[400px] h-[450px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "2100px", left: "-120px" }} />
        <Image
            src="/city-bg.svg"
            alt="city-bg"
            width={355}
            height={216}
            className="absolute left-[-90px] top-[100px] z-0 pointer-events-none
                w-[200px] sm:w-[250px] md:w-[300px] lg:w-[355px] h-auto"
          />
          <Image
            src="/Graphic_Elements.svg"
            alt="Graphic_Elements"
            width={192}
            height={176}
            className="absolute left-[1370px] top-[75px] z-0 pointer-events-none
                w-[100px] sm:w-[140px] md:w-[160px] lg:w-[192px] h-auto"
          />
          <Image
            src="/Graphic_Elements.svg"
            alt="Graphic_Elements"
            width={192}
            height={176}
            className="absolute left-[1370] top-[1890px] z-0 pointer-events-none
            w-[100px] sm:w-[140px] md:w-[160px] lg:w-[192px] h-auto"
          />
          <MapBanner />
          <MapBox />
          <CheckinAccordion />
          <RecommendedPlaces />
      </main>
  );
}
