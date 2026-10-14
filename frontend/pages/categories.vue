<script setup lang="ts">
import type { Category, Paginated } from '~/types';

const api = useApi();
const page = ref(1);
const search = ref('');

const { data, pending, refresh } = await useAsyncData(
  'categories',
  () => api<Paginated<Category>>('/categories', {
    query: { page: page.value, limit: 10, search: search.value || undefined },
  }),
  { watch: [page] },
);

const columns = [{ key: 'name', label: 'Name' }];

const modalOpen = ref(false);
const editingId = ref<number | null>(null);
const name = ref('');
const saving = ref(false);

const openCreate = () => {
  editingId.value = null;
  name.value = '';
  modalOpen.value = true;
};

const openEdit = (row: Category) => {
  editingId.value = row.id;
  name.value = row.name;
  modalOpen.value = true;
};

const save = async () => {
  saving.value = true;
  try {
    if (editingId.value) {
      await api(`/categories/${editingId.value}`, { method: 'PATCH', body: { name: name.value } });
    } else {
      await api('/categories', { method: 'POST', body: { name: name.value } });
    }
    modalOpen.value = false;
    await refresh();
  } finally {
    saving.value = false;
  }
};

const remove = async (row: Category) => {
  if (!confirm(`Delete "${row.name}"?`)) return;
  await api(`/categories/${row.id}`, { method: 'DELETE' });
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
      <h2>Categories</h2>
      <AppButton @click="openCreate">+ Add Category</AppButton>
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
      <template #actions="{ row }">
        <AppButton variant="secondary" @click="openEdit(row)">Edit</AppButton>
        <AppButton variant="danger" @click="remove(row)">Delete</AppButton>
      </template>
    </DataTable>

    <AppModal v-model="modalOpen" :title="editingId ? 'Edit Category' : 'Add Category'">
      <form class="form" @submit.prevent="save">
        <AppInput v-model="name" label="Name" required />
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