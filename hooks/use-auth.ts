import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";

type UseAuthOptions = {
  autoFetch?: boolean;
};

export function useAuth(options?: UseAuthOptions) {
  const { autoFetch = true } = options ?? {};
  const [user, setUser] = useState<Auth.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    console.log("[useAuth] fetchUser called");
    try {
      setLoading(true);
      setError(null);

      // Web platform: check local cache first, then try API
      if (Platform.OS === "web") {
        console.log("[useAuth] Web platform: checking local cache first...");
        const cachedUser = await Auth.getUserInfo();
        
        // If we have a local user (from local login), use it and skip API
        if (cachedUser && cachedUser.loginMethod === "local") {
          console.log("[useAuth] Using cached local user, skipping API:", cachedUser);
          setUser(cachedUser);
          return;
        }
        
        // Otherwise, try OAuth API
        console.log("[useAuth] No local user, fetching from OAuth API...");
        const apiUser = await Api.getMe();
        console.log("[useAuth] API user response:", apiUser);

        if (apiUser) {
          const userInfo: Auth.User = {
            id: apiUser.id,
            openId: apiUser.openId,
            name: apiUser.name,
            email: apiUser.email,
            loginMethod: apiUser.loginMethod,
            lastSignedIn: new Date(apiUser.lastSignedIn),
          };
          setUser(userInfo);
          // Cache user info in localStorage for faster subsequent loads
          await Auth.setUserInfo(userInfo);
          console.log("[useAuth] Web user set from API:", userInfo);
        } else {
          console.log("[useAuth] Web: No authenticated user from API");
          setUser(null);
          await Auth.clearUserInfo();
        }
        return;
      }

      // Native platform: use token-based auth
      console.log("[useAuth] Native platform: checking for session token...");
      const sessionToken = await Auth.getSessionToken();
      console.log(
        "[useAuth] Session token:",
        sessionToken ? `present (${sessionToken.substring(0, 20)}...)` : "missing",
      );
      if (!sessionToken) {
        console.log("[useAuth] No session token, setting user to null");
        setUser(null);
        return;
      }

      // Use cached user info for native (token validates the session)
      const cachedUser = await Auth.getUserInfo();
      console.log("[useAuth] Cached user:", cachedUser);
      if (cachedUser) {
        console.log("[useAuth] Using cached user info");
        setUser(cachedUser);
      } else {
        console.log("[useAuth] No cached user, setting user to null");
        setUser(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch user");
      console.error("[useAuth] fetchUser error:", error);
      setError(error);
      setUser(null);
    } finally {
      setLoading(false);
      console.log("[useAuth] fetchUser completed, loading:", false);
    }
  }, []);

  const login = useCallback(async (matricula: string, nome: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("[useAuth] Starting local login...", { matricula, nome });

      // Create user object directly (local auth only)
      const userInfo: Auth.User = {
        id: parseInt(matricula, 10),
        openId: matricula,
        name: nome,
        email: `${matricula}@empresa.com`,
        loginMethod: "local",
        lastSignedIn: new Date(),
        firstLogin: false,
      };

      // Save user info locally
      await Auth.setUserInfo(userInfo);
      
      // Set session token (using matricula as token for local auth)
      await Auth.setSessionToken(matricula);
      
      setUser(userInfo);
      console.log("[useAuth] User logged in successfully:", userInfo);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to login");
      console.error("[useAuth] login error:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Api.logout();
    } catch (err) {
      console.error("[Auth] Logout API call failed:", err);
      // Continue with logout even if API call fails
    } finally {
      await Auth.removeSessionToken();
      await Auth.clearUserInfo();
      setUser(null);
      setError(null);
    }
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  useEffect(() => {
    console.log("[useAuth] useEffect triggered, autoFetch:", autoFetch, "platform:", Platform.OS);
    if (autoFetch) {
      // Check for cached user info first (both web and native)
      Auth.getUserInfo().then((cachedUser) => {
        console.log("[useAuth] Cached user check:", cachedUser);
        if (cachedUser) {
          console.log("[useAuth] Setting cached user immediately");
          setUser(cachedUser);
          setLoading(false);
        } else {
          // No cached user, set loading to false
          console.log("[useAuth] No cached user");
          setLoading(false);
        }
      }).catch((err) => {
        console.error("[useAuth] Error checking cached user:", err);
        setLoading(false);
      });
    } else {
      console.log("[useAuth] autoFetch disabled, setting loading to false");
      setLoading(false);
    }
  }, [autoFetch]);

  useEffect(() => {
    console.log("[useAuth] State updated:", {
      hasUser: !!user,
      loading,
      isAuthenticated,
      error: error?.message,
    });
  }, [user, loading, isAuthenticated, error]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    refresh: fetchUser,
    logout,
  };
}
