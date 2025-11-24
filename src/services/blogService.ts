import api from "./api";
import {Blog } from "@/types/blog";

export async function getPosts(): Promise<Blog[]>{
    const res = await api.get('/blogs?limit=1000')
    return res.data.data
}

export async function getPostById(id: string): Promise<Blog>{
    const res = await api.get(`/blogs/${id}`)
    return res.data.data
}