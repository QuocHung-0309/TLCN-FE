// src/lib/axios.ts
import axios from "axios";

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/,"") + "/api",
  withCredentials: false,
  timeout: 15000,
});
