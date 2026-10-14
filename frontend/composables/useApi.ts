export const useApi = () => {
  const config = useRuntimeConfig();
  const { token, logout } = useAuth();

  return $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (token.value) {
        options.headers.set('Authorization', `Bearer ${token.value}`);
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) logout();
    },
  });
};