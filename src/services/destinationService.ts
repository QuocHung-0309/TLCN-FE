import { Destination } from "@/types/destination"
import api from "./api"

export async function getDestinations(): Promise<Destination[]> {
  const res = await api.get('/admin/places')
  return res.data.data.places ?? res.data
}
