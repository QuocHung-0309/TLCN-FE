import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function fetchRecommended(userId?: string): Promise<{ data: any[]; model?: string }> {
  const url = `${API_BASE}/recommendations/homepage${userId ? `?userId=${userId}` : ""}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) return { data: [] };
  const json = await res.json();
  return { data: json.data ?? [], model: json.model };
}

export function useRecommendedTours(userId?: string) {
  return useQuery({
    queryKey: ["recommendations", "homepage", userId ?? ""],
    queryFn: () => fetchRecommended(userId),
    staleTime: 5 * 60 * 1000,
    select: (result) => result,
  });
}
