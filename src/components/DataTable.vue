<template>
  <div class="data-table">
    <div class="table-header">
      <h3>📊 Data Table</h3>
      <div class="table-info">
        Showing {{ Math.min(data.length, 100) }} of {{ data.length }} records
      </div>
    </div>
    <div class="table-container" ref="tableContainer">
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Value</th>
            <th>Category</th>
            <th>X</th>
            <th>Y</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in visibleData" :key="item.id">
            <td>{{ formatTimestamp(item.timestamp) }}</td>
            <td>{{ item.value.toFixed(2) }}</td>
            <td>
              <span class="category-badge" :class="`category-${item.category}`">
                {{ item.category }}
              </span>
            </td>
            <td>{{ item.x?.toFixed(2) }}</td>
            <td>{{ item.y?.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DataPoint } from '@/types/dashboard.types';

interface Props {
  data: DataPoint[];
}

const props = defineProps<Props>();

// Simple virtualization - show only first 100 records for performance
const visibleData = computed(() => {
  return props.data.slice(-100).reverse();
});

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString();
};
</script>

<style scoped>
.data-table {
  margin-top: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.table-header h3 {
  margin: 0;
  color: #1f2937;
}

.table-info {
  font-size: 14px;
  color: #6b7280;
}

.table-container {
  max-height: 400px;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
}

tbody tr:hover {
  background: #f8fafc;
}

.category-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.category-A {
  background: #dbeafe;
  color: #1e40af;
}

.category-B {
  background: #fce7f3;
  color: #be185d;
}

.category-C {
  background: #dcfce7;
  color: #166534;
}

.category-D {
  background: #fef3c7;
  color: #92400e;
}
</style>