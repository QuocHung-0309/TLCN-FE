import { adminApi } from "./index";

// Types for admin leader management
export interface LeaderData {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface GetAdminLeadersParams {
  page?: number;
  limit?: number;
  status?: "active" | "inactive";
  search?: string;
}

export interface LeadersResponse {
  total: number;
  page: number;
  limit: number;
  data: LeaderData[];
}

export interface CreateLeaderBody {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  status?: "active" | "inactive";
}

export interface UpdateLeaderBody {
  fullName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  status?: "active" | "inactive";
  password?: string;
}

/**
 * Fetch all leaders with filters and pagination
 */
export const getAdminLeaders = async (
  params?: GetAdminLeadersParams
): Promise<LeadersResponse> => {
  try {
    const { page = 1, limit = 20, status, search } = params || {};

    console.log("📊 Fetching admin leaders with params:", {
      page,
      limit,
      status,
      search,
    });

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (status) queryParams.append("status", status);
    if (search) queryParams.append("search", search);

    const response = await adminApi.get(
      `/admin/leaders?${queryParams.toString()}`
    );
    console.log("✅ Leaders fetched successfully");
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to fetch leaders:", error.response?.data);
    throw error;
  }
};

/**
 * Get single leader by ID
 */
export const getAdminLeaderById = async (id: string): Promise<LeaderData> => {
  try {
    console.log("📊 Fetching leader:", id);
    const response = await adminApi.get(`/admin/leaders/${id}`);
    console.log("✅ Leader fetched successfully");
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to fetch leader:", error.response?.data);
    throw error;
  }
};

/**
 * Create a new leader
 */
export const createAdminLeader = async (
  body: CreateLeaderBody
): Promise<LeaderData> => {
  try {
    console.log("📝 Creating leader:", body.fullName);
    const response = await adminApi.post(`/admin/leaders`, body);
    console.log("✅ Leader created successfully");
    return response.data.leader;
  } catch (error: any) {
    console.error("❌ Failed to create leader:", error.response?.data);
    throw error;
  }
};

/**
 * Update a leader
 */
export const updateAdminLeader = async (
  id: string,
  body: UpdateLeaderBody
): Promise<LeaderData> => {
  try {
    console.log("✏️ Updating leader:", id);
    const response = await adminApi.put(`/admin/leaders/${id}`, body);
    console.log("✅ Leader updated successfully");
    return response.data.leader;
  } catch (error: any) {
    console.error("❌ Failed to update leader:", error.response?.data);
    throw error;
  }
};

/**
 * Delete a leader
 */
export const deleteAdminLeader = async (id: string): Promise<void> => {
  try {
    console.log("🗑️ Deleting leader:", id);
    await adminApi.delete(`/admin/leaders/${id}`);
    console.log("✅ Leader deleted successfully");
  } catch (error: any) {
    console.error("❌ Failed to delete leader:", error.response?.data);
    throw error;
  }
};
