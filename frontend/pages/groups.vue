<script setup lang="ts">
import type { Group, Paginated } from '~/types';

const api = useApi();
const refreshGroupTree = inject<() => Promise<void>>('refreshGroupTree');

const page = ref(1);
const search = ref('');

const { data, pending, refresh } = await useAsyncData(
  'groups',
  () => api<Paginated<Group>>('/groups', {
    query: { page: page.value, limit: 10, search: search.value || undefined },
  }),
  { watch: [page] },
);

const { data: allGroups, refresh: refreshAll } = await useAsyncData('groups-all', () =>
  api<Paginated<Group>>('/groups', { query: { limit: 100 } }),
);

const groupName = (id: number | null) =>
  allGroups.value?.data.find((g) => g.id === id)?.name ?? '-';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'parentId', label: 'Parent' },
];

const modalOpen = ref(false);
const editingId = ref<number | null>(null);
const name = ref('');
const parentId = ref<number | null>(null);
const saving = ref(false);

const parentOptions = computed(() =>
  (allGroups.value?.data ?? [])
    .filter((g) => g.id !== editingId.value)
    .map((g) => ({ value: g.id, label: g.name })),
);

const reloadAll = async () => {
  await Promise.all([refresh(), refreshAll(), refreshGroupTree?.()]);
};

const openCreate = () => {
  editingId.value = null;
  name.value = '';
  parentId.value = null;
  modalOpen.value = true;
};

const openEdit = (row: Group) => {
  editingId.value = row.id;
  name.value = row.name;
  parentId.value = row.parentId;
  modalOpen.value = true;
};

const save = async () => {
  saving.value = true;
  const body = { name: name.value, parentId: parentId.value ?? undefined };
  try {
    if (editingId.value) {
      await api(`/groups/${editingId.value}`, { method: 'PATCH', body });
    } else {
      await api('/groups', { method: 'POST', body });
    }
    modalOpen.value = false;
    await reloadAll();
  } catch (e) {
    alert((e as { data?: { message?: string } }).data?.message ?? 'Failed to save');
  } finally {
    saving.value = false;
  }
};

const remove = async (row: Group) => {
  if (!confirm(`Delete "${row.name}"?`)) return;
  try {
    await api(`/groups/${row.id}`, { method: 'DELETE' });
    await reloadAll();
  } catch (e) {
    alert((e as { data?: { message?: string } }).data?.message ?? 'Failed to delete');
  }
};

const onSearch = () => {
  page.value = 1;
  refresh();
};
</script>

<template>
  <div class="page">
    <div class="header">
      <h2>Groups</h2>
      <AppButton @click="openCreate">+ Add Group</AppButton>
    </div>

    <form class="toolbar" @submit.prevent="onSearch">
      <AppInput v-model="search" placeholder="Search name..." />
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
      <template #cell-parentId="{ row }">{{ groupName(row.parentId) }}</template>
      <template #actions="{ row }">
        <AppButton variant="secondary" @click="openEdit(row)">Edit</AppButton>
        <AppButton variant="danger" @click="remove(row)">Delete</AppButton>
      </template>
    </DataTable>

    <AppModal v-model="modalOpen" :title="editingId ? 'Edit Group' : 'Add Group'">
      <form class="form" @submit.prevent="save">
        <AppInput v-model="name" label="Name" required />
        <AppSelect v-model="parentId" label="Parent Group" :options="parentOptions" placeholder="-- No parent (top level) --" />
        <AppButton type="submit" :loading="saving">Save</AppButton>
      </form>
    </AppModal>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header { display: flex; justify-content: space-between; align-items: center; }
h2 { margin: 0; }
.toolbar { display: flex; gap: 8px; align-items: flex-end; }
.form { display: flex; flex-direction: column; gap: 12px; }
</style>