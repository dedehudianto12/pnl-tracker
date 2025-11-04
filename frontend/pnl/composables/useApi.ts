import type { UseFetchOptions } from "nuxt/app";

export const useApi = () => {
  const config = useRuntimeConfig();
  const token = useCookie("token");

  const apiFetch = async <T>(url: string, options: UseFetchOptions<T> = {}) => {
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
      "Content-Type": "application/json",
    };

    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`;
    }

    return await $fetch<T>(`${config.public.apiBase}${url}`, {
      ...options,
      headers,
    });
  };

  return {
    apiFetch,
  };
};
