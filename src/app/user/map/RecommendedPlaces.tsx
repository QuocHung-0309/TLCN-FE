'use client';

import React, { useEffect, useState } from 'react';
import DestinationCard from '@/components/cards/DestinationCard';
import Button from '@/components/ui/Button';
import { placeApi } from '@/lib/place/placeApi';
import { Place } from '@/types/place';

export default function RecommendedPlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      try {
        const data = await placeApi.getNearbyPlaces();
        setPlaces(data || []);
      } catch (err) {
        console.error("Lỗi khi load địa điểm gợi ý:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyPlaces();
  }, []);

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              ĐỊA ĐIỂM GỢI Ý
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gần vị trí bạn vừa checkin
            </p>
          </div>
          <Button
            variant="outline-primary"
            className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 h-fit rounded-none sm:static absolute right-4 top-0"
          >
            Xem tất cả
          </Button>
        </div>

        {loading ? (
          <p>Đang tải địa điểm gợi ý...</p>
        ) : places.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {places.map((place, idx) => (
              <DestinationCard
                key={idx}
                title={place.name}
                location={place.address}
                distance="—"
                image={place.images?.[0] || '/hot-destination.svg'}
              />
            ))}
          </div>
        ) : (
          <p>Không có địa điểm gợi ý nào.</p>
        )}
      </div>
    </section>
  );
}