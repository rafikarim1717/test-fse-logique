<script setup lang="ts">
defineProps<{ title: string }>();
const open = defineModel<boolean>({ default: false });
</script>

<template>
  <div v-if="open" class="overlay" @click.self="open = false">
    <div class="modal">
      <h3>{{ title }}</h3>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: grid; place-items: center; z-index: 50; }
.modal { background: white; padding: 20px; border-radius: 8px; width: min(480px, 92vw); display: flex; flex-direction: column; gap: 12px; }
h3 { margin: 0; }
</style>