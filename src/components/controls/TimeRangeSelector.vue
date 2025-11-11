<template>
  <div class="time-selector">
    <h3>⏰ Time Range</h3>
    <div class="time-buttons">
      <button 
        v-for="range in timeRanges" 
        :key="range.value"
        @click="selectRange(range.value)"
        :class="{ active: selectedRange === range.value }"
      >
        {{ range.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const timeRanges = [
  { label: '1 Hour', value: '1h' },
  { label: '6 Hours', value: '6h' },
  { label: '24 Hours', value: '24h' },
  { label: '1 Week', value: '1w' }
];

const selectedRange = ref('1h');

const emit = defineEmits<{
  rangeChange: [range: string]
}>();

const selectRange = (range: string) => {
  selectedRange.value = range;
  emit('rangeChange', range);
};
</script>

<style scoped>
.time-selector {
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.time-selector h3 {
  margin-bottom: 15px;
  color: #1f2937;
  font-size: 18px;
}

.time-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.time-buttons button {
  padding: 10px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.time-buttons button:hover {
  background: #f3f4f6;
}

.time-buttons button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}
</style>