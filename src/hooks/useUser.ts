"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth/authApi";
import { User } from "@/types/user";

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const userData = await authApi.getProfile(token);
          const userProfile = userData?.user || userData; // Handle both {user: ...} and direct user object

          // Standardize user ID to _id for consistency
          if (userProfile && userProfile.userId && !userProfile._id) {
            userProfile._id = userProfile.userId;
          }
          
          if (userProfile && userProfile._id) { // Check for a valid user object
            setUser(userProfile as User);
            setIsAuthenticated(true);
          } else {
            // Token might be invalid/expired or data is not in expected format
            localStorage.removeItem("token");
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          // Handle error, e.g., token is invalid
          localStorage.removeItem("token");
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return { user, isAuthenticated, loading };
};

export default useUser;
