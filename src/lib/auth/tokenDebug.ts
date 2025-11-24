/**
 * Debug utilities to trace token and user info loading
 */

export const debugTokenAndUser = {
  // Log token loading from localStorage
  logTokenLoad: (source: string) => {
    if (typeof window === "undefined") return;
    
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const authStore = JSON.parse(localStorage.getItem("auth") || "{}");
    
    console.log(`🔐 [${source}] Token Status:`, {
      timestamp: new Date().toISOString(),
      accessToken: {
        exists: !!accessToken,
        preview: accessToken ? `${accessToken.substring(0, 20)}...` : "null",
        length: accessToken?.length || 0,
      },
      refreshToken: {
        exists: !!refreshToken,
        length: refreshToken?.length || 0,
      },
      zustandStore: {
        hasToken: !!authStore?.state?.token?.accessToken,
        tokenPreview: authStore?.state?.token?.accessToken 
          ? `${authStore.state.token.accessToken.substring(0, 20)}...`
          : "null",
      },
    });
  },

  // Log user profile loading
  logUserProfileLoad: (source: string, profile: any) => {
    console.log(`👤 [${source}] User Profile Loaded:`, {
      timestamp: new Date().toISOString(),
      fullName: profile?.fullName,
      email: profile?.email,
      phone: profile?.phone,
      avatar: profile?.avatar ? "exists" : "default",
      points: profile?.points,
      memberStatus: profile?.memberStatus,
      id: profile?.id,
    });
  },

  // Log user info display
  logUserInfoDisplay: (source: string, display: any) => {
    console.log(`📱 [${source}] User Info Display:`, {
      timestamp: new Date().toISOString(),
      fullName: display?.fullName,
      email: display?.email,
      avatar: display?.avatar,
      points: display?.points,
      memberStatus: display?.memberStatus,
      isReadyToDisplay: !!(display?.fullName && display?.email),
    });
  },

  // Log checkout pre-fill
  logCheckoutPreFill: (source: string, formData: any) => {
    console.log(`🛒 [${source}] Checkout Pre-fill:`, {
      timestamp: new Date().toISOString(),
      fullName: formData?.fullName,
      email: formData?.email,
      phone: formData?.phone,
      address: formData?.address || "(empty - editable)",
      isReadOnly: formData?.isReadOnly,
    });
  },

  // Log auth state changes
  logAuthStateChange: (source: string, state: any) => {
    console.log(`🔄 [${source}] Auth State Changed:`, {
      timestamp: new Date().toISOString(),
      isLoggedIn: !!state?.accessToken,
      haToken: !!state?.accessToken,
      hasRefreshToken: !!state?.refreshToken,
      userId: state?.userId || "null",
      accessTokenPreview: state?.accessToken 
        ? `${state.accessToken.substring(0, 20)}...`
        : "null",
    });
  },
};

export default debugTokenAndUser;
