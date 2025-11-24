import api from "./api";
import { Category } from "@/types/category";

export async function getCategories(): Promise<Category[]>{
    const res = await api.get('/admin/categories')
    return res.data.data
}