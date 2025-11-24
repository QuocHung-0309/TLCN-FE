import api from "./api";
import { Review } from "@/types/reviews";

export async function getReviews(): Promise<Review[]> {
    const res = await api.get(`/admin/reviews`);   
    return res.data.data.reviews ?? [];
}