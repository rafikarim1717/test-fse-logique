<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger';
    type?: 'button' | 'submit';
    loading?: boolean;
  }>(),
  { variant: 'primary', type: 'button', loading: false },
);
</script>

<template>
  <button :type="type" :class="['btn', variant]" :disabled="loading">
    {{ loading ? 'Loading...' : '' }}<slot v-if="!loading" />
  </button>
</template>

<style scoped>
.btn { padding: 8px 14px; border-radius: 6px; border: 1px solid transparent; cursor: pointer; font-size: 14px; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.primary { background: var(--primary); color: white; }
.secondary { background: white; border-color: var(--border); }
.danger { background: var(--danger); color: white; }
</style>