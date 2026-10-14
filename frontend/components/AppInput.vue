<script setup lang="ts">
defineProps<{
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}>();
const model = defineModel<string>({ default: '' });
</script>

<template>
  <label class="field">
    <span v-if="label">{{ label }}</span>
    <input v-model="model" :type="type ?? 'text'" :placeholder="placeholder" :required="required" />
  </label>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
input { padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; }
</style>