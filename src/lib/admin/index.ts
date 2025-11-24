import { adminApi } from "./adminApi";
import { setAdminToken } from "@/lib/auth/tokenManager";

export { adminApi };

export async function adminLogin(identifier: string, password: string) {
  const { data } = await adminApi.post("/login", { identifier, password });
  // BE trả accessToken
  setAdminToken(data?.accessToken ?? "");
  return data;
}

export async function getOngoingTours() {
  const { data } = await adminApi.get("/admin/tours/ongoing");
  return data?.data ?? []; // [{_id,title,startDate,leader,...}]
}
