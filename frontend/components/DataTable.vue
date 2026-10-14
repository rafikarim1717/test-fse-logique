<script setup lang="ts" generic="T extends { id: number }">
export interface Column {
  key: string;
  label: string;
}

defineProps<{
  columns: Column[];
  rows: T[];
  page: number;
  totalPages: number;
  loading?: boolean;
}>();

const emit = defineEmits<{ 'page-change': [page: number] }>();
</script>

<template>
  <div class="wrapper">
    <table>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
          <th v-if="$slots.actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading"><td :colspan="columns.length + 1">Loading...</td></tr>
        <tr v-else-if="rows.length === 0"><td :colspan="columns.length + 1">No data</td></tr>
        <tr v-for="row in rows" v-else :key="row.id">
          <td v-for="col in columns" :key="col.key">
            <slot :name="`cell-${col.key}`" :row="row">
              {{ (row as Record<string, unknown>)[col.key] }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="actions">
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <AppButton variant="secondary" :disabled="page <= 1" @click="emit('page-change', page - 1)">Prev</AppButton>
      <span>Page {{ page }} of {{ Math.max(totalPages, 1) }}</span>
      <AppButton variant="secondary" :disabled="page >= totalPages" @click="emit('page-change', page + 1)">Next</AppButton>
    </div>
  </div>
</template>

<style scoped>
.wrapper { background: white; border: 1px solid var(--border); border-radius: 8px; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border); }
th { background: var(--bg); font-weight: 600; }
.actions { display: flex; gap: 6px; }
.pagination { display: flex; align-items: center; justify-content: flex-end; gap: 12px; padding: 10px 12px; font-size: 14px; }
</style>