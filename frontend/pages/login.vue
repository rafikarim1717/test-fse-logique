<script setup lang="ts">
definePageMeta({ layout: false });

const { login } = useAuth();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const submit = async () => {
  error.value = '';
  loading.value = true;
  try {
    await login(email.value, password.value);
    await navigateTo('/');
  } catch {
    error.value = 'Invalid email or password';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="page">
    <form class="card" @submit.prevent="submit">
      <h2>Credential Manager</h2>
      <AppInput v-model="email" label="Email" type="email" required />
      <AppInput v-model="password" label="Password" type="password" required />
      <p v-if="error" class="error">{{ error }}</p>
      <AppButton type="submit" :loading="loading">Login</AppButton>
    </form>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; display: grid; place-items: center; }
.card { background: white; padding: 24px; border-radius: 8px; border: 1px solid var(--border); width: min(360px, 92vw); display: flex; flex-direction: column; gap: 12px; }
h2 { margin: 0 0 8px; }
.error { color: var(--danger); font-size: 14px; margin: 0; }
</style>