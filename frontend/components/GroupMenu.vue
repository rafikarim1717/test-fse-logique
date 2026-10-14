<script setup lang="ts">
import type { GroupTreeNode } from '~/types';

defineProps<{ items: GroupTreeNode[] }>();
</script>

<template>
  <ul class="menu">
    <li v-for="item in items" :key="item.id">
      <NuxtLink :to="`/credentials?groupId=${item.id}`">{{ item.name }}</NuxtLink>
      <GroupMenu v-if="item.children.length" :items="item.children" class="sub" />
    </li>
  </ul>
</template>

<style scoped>
.menu { list-style: none; margin: 0; padding: 0; }
.sub { padding-left: 14px; }
a { display: block; padding: 6px 10px; border-radius: 6px; color: inherit; text-decoration: none; font-size: 14px; }
a:hover, a.router-link-exact-active { background: #eef2ff; color: var(--primary); }
</style>