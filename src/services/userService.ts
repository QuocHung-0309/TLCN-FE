import api from "./api";
import { User } from "@/types/user";

export async function getUsers(): Promise<User[]>{
    const res = await api.get('/admin/users')
    return res.data
}