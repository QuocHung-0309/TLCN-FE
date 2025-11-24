import type { Metadata } from 'next';
import { getTour } from '../destination/[slug]/data';

import Hero from '../destination/sections/Hero';
import Gallery from '../destination/sections/Gallery';
import SectionBlock from '../destination/sections/SectionBlock';
import QuickInfo from '../destination/sections/QuickInfo';
import ItineraryAccordion from '../destination/sections/ItineraryAccordion';
import { ServicesIncluded, ServicesExcluded } from '../destination/sections/Services';
import Policies from '../destination/sections/Policies';
import MapEmbed from '../destination/sections/MapEmbed';
import RelatedScroll from '../destination/sections/RelatedScroll';
import BookingBox from '../destination/sections/BookingBox';
import StickyMobileBar from '../destination/sections/StickyMobileBar';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tour = getTour(params.slug);
  return {
    title: `${tour.title} | Bon Phương Travel`,
    description: tour.shortDesc,
    openGraph: { title: tour.title, description: tour.shortDesc, images: [tour.cover], type: 'article' },
  };
}

export default function TourDetailPage({ params }: { params: { slug: string } }) {
  const tour = getTour(params.slug);

  return (
    <div className="min-h-screen bg-white">
      <Hero tour={tour} />
      <Gallery images={tour.gallery} />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 lg:mt-10 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN */}
          <div className="lg:col-span-2">
            <QuickInfo highlights={tour.highlights} />

            <SectionBlock id="itinerary" title="Lịch trình">
              <ItineraryAccordion items={tour.itinerary} />
            </SectionBlock>

            <SectionBlock id="services" title="Dịch vụ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Bao gồm</h4>
                  <ServicesIncluded items={tour.included} />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Không bao gồm</h4>
                  <ServicesExcluded items={tour.excluded} />
                </div>
              </div>
            </SectionBlock>

            <SectionBlock id="policies" title="Chính sách">
              <Policies items={tour.policies} />
            </SectionBlock>

            <SectionBlock id="map" title="Bản đồ">
              <MapEmbed lat={tour.location.lat} lng={tour.location.lng} />
            </SectionBlock>

            <SectionBlock title="Tour liên quan">
              <RelatedScroll data={tour.related} />
            </SectionBlock>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <BookingBox tour={tour} />
          </div>
        </div>
      </section>

      <StickyMobileBar price={tour.price} title={tour.title} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        // @ts-ignore
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TouristTrip',
            name: tour.title,
            description: tour.shortDesc,
            aggregateRating: { '@type': 'AggregateRating', ratingValue: tour.rating, reviewCount: tour.ratingCount },
            offers: { '@type': 'Offer', price: tour.price, priceCurrency: 'VND', availability: 'https://schema.org/InStock' },
          }),
        }}
      />
    </div>
  );
}
