"use client";

import { useParams } from "next/navigation";
import TourForm from "../../TourForm";

export default function EditTourPage() {
  const params = useParams();
  const tourId = params.id as string;

  return <TourForm mode="edit" tourId={tourId} />;
}
