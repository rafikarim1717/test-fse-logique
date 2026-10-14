export const useAuth = () => {
  const token = useCookie<string | null>('token', { maxAge: 60 * 60 * 24 });
  const config = useRuntimeConfig();

  const login = async (email: string, password: string) => {
    const res = await $fetch<{ accessToken: string }>('/auth/login', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: { email, password },
    });
    token.value = res.accessToken;
  };

  const logout = () => {
    token.value = null;
    navigateTo('/login');
  };

  return { token, login, logout, isLoggedIn: computed(() => !!token.value) };
};