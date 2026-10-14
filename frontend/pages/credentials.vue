<script setup lang="ts">
import type { Category, Credential, Group, Paginated } from '~/types';

const api = useApi();
const route = useRoute();

const page = ref(1);
const search = ref('');
const categoryFilter = ref<number | null>(null);
const groupId = computed(() => (route.query.groupId ? Number(route.query.groupId) : undefined));

const { data, pending, refresh } = await useAsyncData(
  'credentials',
  () => api<Paginated<Credential>>('/credentials', {
    query: {
      page: page.value,
      limit: 10,
      search: search.value || undefined,
      groupId: groupId.value,
      categoryId: categoryFilter.value ?? undefined,
    },
  }),
  { watch: [page, groupId, categoryFilter] },
);

const { data: categories } = await useAsyncData('cred-categories', () =>
  api<Paginated<Category>>('/categories', { query: { limit: 100 } }),
);
const { data: groups } = await useAsyncData('cred-groups', () =>
  api<Paginated<Group>>('/groups', { query: { limit: 100 } }),
);

const categoryOptions = computed(() =>
  (categories.value?.data ?? []).map((c) => ({ value: c.id, label: c.name })),
);
const groupOptions = computed(() =>
  (groups.value?.data ?? []).map((g) => ({ value: g.id, label: g.name })),
);
const currentGroupName = computed(
  () => groups.value?.data.find((g) => g.id === groupId.value)?.name,
);

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'username', label: 'Username' },
  { key: 'password', label: 'Password' },
  { key: 'category', label: 'Category' },
  { key: 'group', label: 'Group' },
];

watch(groupId, () => (page.value = 1));

const revealed = ref<Record<number, string>>({});
const toggleReveal = async (row: Credential) => {
  if (revealed.value[row.id]) {
    const { [row.id]: _hidden, ...rest } = revealed.value;
    revealed.value = rest;
    return;
  }
  const res = await api<{ password: string }>(`/credentials/${row.id}/reveal`);
  revealed.value = { ...revealed.value, [row.id]: res.password };
};

const emptyForm = () => ({
  title: '',
  username: '',
  password: '',
  url: '',
  notes: '',
  categoryId: null as number | null,
  groupId: (groupId.value ?? null) as number | null,
});

const modalOpen = ref(false);
const editingId = ref<number | null>(null);
const form = ref(emptyForm());
const saving = ref(false);

const openCreate = () => {
  editingId.value = null;
  form.value = emptyForm();
  modalOpen.value = true;
};

const openEdit = (row: Credential) => {
  editingId.value = row.id;
  form.value = {
    title: row.title,
    username: row.username,
    password: '',
    url: row.url ?? '',
    notes: row.notes ?? '',
    categoryId: row.categoryId,
    groupId: row.groupId,
  };
  modalOpen.value = true;
};

const save = async () => {
  saving.value = true;
  const body = {
    title: form.value.title,
    username: form.value.username,
    url: form.value.url || undefined,
    notes: form.value.notes || undefined,
    categoryId: form.value.categoryId ?? undefined,
    groupId: form.value.groupId ?? undefined,
    ...(form.value.password && { password: form.value.password }),
  };
  try {
    if (editingId.value) {
      await api(`/credentials/${editingId.value}`, { method: 'PATCH', body });
    } else {
      await api('/credentials', { method: 'POST', body });
    }
    modalOpen.value = false;
    revealed.value = {};
    await refresh();
  } catch (e) {
    alert((e as { data?: { message?: string | string[] } }).data?.message ?? 'Failed to save');
  } finally {
    saving.value = false;
  }
};

const remove = async (row: Credential) => {
  if (!confirm(`Delete "${row.title}"?`)) return;
  await api(`/credentials/${row.id}`, { method: 'DELETE' });
  await refresh();
};

const onSearch = () => {
  page.value = 1;
  refresh();
};
</script>

<template>
  <div class="page">
    <div class="header">
      <h2>{{ currentGroupName ? `Credentials · ${currentGroupName}` : 'All Credentials' }}</h2>
      <AppButton @click="openCreate">+ Add Credential</AppButton>
    </div>

    <form class="toolbar" @submit.prevent="onSearch">
      <AppInput v-model="search" placeholder="Search title, username, url..." />
      <AppSelect v-model="categoryFilter" :options="categoryOptions" placeholder="All categories" />
      <AppButton type="submit" variant="secondary">Search</AppButton>
    </form>

    <DataTable
      :columns="columns"
      :rows="data?.data ?? []"
      :page="page"
      :total-pages="data?.meta.totalPages ?? 1"
      :loading="pending"
      @page-change="page = $event"
    >
      <template #cell-password="{ row }">
        <code>{{ revealed[row.id] ?? '••••••••' }}</code>
      </template>
      <template #cell-category="{ row }">{{ row.category?.name ?? '-' }}</template>
      <template #cell-group="{ row }">{{ row.group?.name ?? '-' }}</template>
      <template #actions="{ row }">
        <AppButton variant="secondary" @click="toggleReveal(row)">
          {{ revealed[row.id] ? 'Hide' : 'Reveal' }}
        </AppButton>
        <AppButton variant="secondary" @click="openEdit(row)">Edit</AppButton>
        <AppButton variant="danger" @click="remove(row)">Delete</AppButton>
      </template>
    </DataTable>

    <AppModal v-model="modalOpen" :title="editingId ? 'Edit Credential' : 'Add Credential'">
      <form class="form" @submit.prevent="save">
        <AppInput v-model="form.title" label="Title" required />
        <AppInput v-model="form.username" label="Username" required />
        <AppInput
          v-model="form.password"
          label="Password"
          type="password"
          :placeholder="editingId ? 'Leave empty to keep current password' : ''"
          :required="!editingId"
        />
        <AppInput v-model="form.url" label="URL" placeholder="https://..." />
        <AppInput v-model="form.notes" label="Notes" />
        <AppSelect v-model="form.categoryId" label="Category" :options="categoryOptions" placeholder="-- Select category --" />
        <AppSelect v-model="form.groupId" label="Group" :options="groupOptions" placeholder="-- Select group --" />
        <AppButton type="submit" :loading="saving">Save</AppButton>
      </form>
    </AppModal>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header { display: flex; justify-content: space-between; align-items: center; }
h2 { margin: 0; }
.toolbar { display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap; }
.form { display: flex; flex-direction: column; gap: 12px; }
code { font-size: 13px; }
</style>