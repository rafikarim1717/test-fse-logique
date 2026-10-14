<script setup lang="ts">
defineProps<{
  label?: string;
  options: { value: number; label: string }[];
  placeholder?: string;
}>();
const model = defineModel<number | null>({ default: null });
</script>

<template>
  <label class="field">
    <span v-if="label">{{ label }}</span>
    <select v-model="model">
      <option :value="null">{{ placeholder ?? '-- None --' }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </label>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
select { padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; background: white; }
</style>