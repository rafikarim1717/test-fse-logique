<script setup lang="ts">
import type { GroupTreeNode } from '~/types';

const api = useApi();
const { logout } = useAuth();
const { data: tree, refresh } = await useAsyncData('group-tree', () =>
  api<GroupTreeNode[]>('/groups/tree'),
);
provide('refreshGroupTree', refresh);
</script>

<template>
  <div class="shell">
    <aside>
      <h3>Credential Manager</h3>
      <nav>
        <NuxtLink to="/credentials">All Credentials</NuxtLink>
        <p class="label">Groups</p>
        <GroupMenu :items="tree ?? []" />
        <p class="label">Settings</p>
        <NuxtLink to="/groups">Manage Groups</NuxtLink>
        <NuxtLink to="/categories">Manage Categories</NuxtLink>
      </nav>
      <AppButton variant="secondary" @click="logout">Logout</AppButton>
    </aside>
    <main><slot /></main>
  </div>
</template>

<style scoped>
.shell { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
aside { background: white; border-right: 1px solid var(--border); padding: 16px; display: flex; flex-direction: column; gap: 12px; }
nav { flex: 1; display: flex; flex-direction: column; gap: 2px; }
nav > a { padding: 6px 10px; border-radius: 6px; color: inherit; text-decoration: none; font-size: 14px; }
.label { font-size: 12px; color: var(--muted); text-transform: uppercase; margin: 12px 0 4px; }
main { padding: 24px; }
h3 { margin: 0; }
</style>