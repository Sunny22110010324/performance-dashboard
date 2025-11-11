<template>
  <div class="filter-panel">
    <h3>🎛️ Dashboard Controls</h3>
    
    <div class="control-group">
      <label>Data Points:</label>
      <div class="button-group">
        <button 
          v-for="count in [1000, 5000, 10000]" 
          :key="count"
          @click="$emit('updateData', count)" 
          :class="{ active: pointCount === count }"
        >
          {{ count === 1000 ? '1K' : count === 5000 ? '5K' : '10K' }}
        </button>
      </div>
    </div>

    <div class="control-group">
      <label>Real-time Stream:</label>
      <button 
        @click="$emit('toggleStream')" 
        :class="['stream-btn', isStreaming ? 'stop' : 'start']"
      >
        {{ isStreaming ? '⏹️ Stop' : '▶️ Start' }} Stream
      </button>
    </div>

    <div class="control-group">
      <label>Performance:</label>
      <div class="stats">
        <div>FPS: {{ Math.round(metrics.fps) }}</div>
        <div>Memory: {{ metrics.memoryUsage }}MB</div>
        <div>Points: {{ metrics.dataPointCount.toLocaleString() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PerformanceMetrics } from '@/types/dashboard.types';

interface Props {
  isStreaming: boolean;
  metrics: PerformanceMetrics;
  pointCount: number;
}

interface Emits {
  (e: 'updateData', count: number): void;
  (e: 'toggleStream'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style scoped>
.filter-panel {
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.filter-panel h3 {
  margin-bottom: 20px;
  color: #1f2937;
  font-size: 18px;
}

.control-group {
  margin-bottom: 20px;
}

.control-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.button-group {
  display: flex;
  gap: 8px;
}

.button-group button {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.button-group button:hover {
  background: #f3f4f6;
}

.button-group button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.stream-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.stream-btn.start {
  background: #10b981;
  color: white;
}

.stream-btn.stop {
  background: #ef4444;
  color: white;
}

.stream-btn:hover {
  opacity: 0.9;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #6b7280;
}

.stats div {
  padding: 4px 8px;
  background: #f8fafc;
  border-radius: 4px;
}
</style>