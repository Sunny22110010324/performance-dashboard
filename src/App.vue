<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <h1>🏎️ High-Performance Vue 3 Dashboard</h1>
        <div class="performance-info">
          <div class="metric">
            <span class="label">FPS:</span>
            <span class="value" :class="getFPSClass(metrics.fps)">
              {{ Math.round(metrics.fps) }}
            </span>
          </div>
          <div class="metric">
            <span class="label">Memory:</span>
            <span class="value">{{ metrics.memoryUsage }} MB</span>
          </div>
          <div class="metric">
            <span class="label">Points:</span>
            <span class="value">{{ metrics.dataPointCount.toLocaleString() }}</span>
          </div>
          <div class="metric">
            <span class="label">Status:</span>
            <span class="value" :class="isStreaming ? 'streaming' : 'idle'">
              {{ isStreaming ? 'LIVE' : 'IDLE' }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="controls-sidebar">
        <FilterPanel 
          :is-streaming="isStreaming"
          :metrics="metrics"
          :point-count="pointCount"
          @update-data="handleUpdateData"
          @toggle-stream="handleToggleStream"
        />
        <TimeRangeSelector @range-change="handleRangeChange" />
      </div>

      <div class="charts-grid">
        <LineChart :data="data" />
        <BarChart :data="data" />
        <ScatterPlot :data="data" />
        <Heatmap :data="data" />
      </div>
    </main>

    <DataTable :data="data" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDataStream } from '@/composables/useDataStream'
import { usePerformanceMonitor } from '@/composables/usePerformanceMonitor'

// Components
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import ScatterPlot from '@/components/charts/ScatterPlot.vue'
import Heatmap from '@/components/charts/Heatmap.vue'
import FilterPanel from '@/components/controls/FilterPanel.vue'
import TimeRangeSelector from '@/components/controls/TimeRangeSelector.vue'
import DataTable from '@/components/DataTable.vue'

// Use composables
const { data, isStreaming, initializeData, startStream, stopStream } = useDataStream()
const { metrics, updateDataPointCount } = usePerformanceMonitor()

const pointCount = ref(10000)

onMounted(() => {
  console.log('🚀 App mounted - initializing data...')
  initializeData(pointCount.value)
  updateDataPointCount(pointCount.value)
})

const handleUpdateData = (count: number) => {
  console.log('🔄 Updating data count to:', count)
  pointCount.value = count
  initializeData(count)
  updateDataPointCount(count)
}

const handleToggleStream = () => {
  console.log('🔄 Toggling stream, current state:', isStreaming.value)
  if (isStreaming.value) {
    stopStream()
  } else {
    startStream()
  }
}

const handleRangeChange = (range: string) => {
  console.log('⏰ Time range changed:', range)
}

const getFPSClass = (fps: number) => {
  if (fps >= 50) return 'excellent'
  if (fps >= 30) return 'good'
  return 'poor'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f8fafc;
  color: #1e293b;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.app-header {
  margin-bottom: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.header-content {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.app-header h1 {
  color: #1e293b;
  font-size: 28px;
  font-weight: 700;
}

.performance-info {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.metric .label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric .value {
  font-size: 18px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  background: #f1f5f9;
}

.metric .value.excellent {
  background: #dcfce7;
  color: #166534;
}

.metric .value.good {
  background: #fef3c7;
  color: #92400e;
}

.metric .value.poor {
  background: #fee2e2;
  color: #dc2626;
}

.metric .value.streaming {
  background: #fce7f3;
  color: #be185d;
  animation: pulse 2s infinite;
}

.metric .value.idle {
  background: #f1f5f9;
  color: #64748b;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.app-main {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.controls-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.charts-grid > * {
  transition: transform 0.2s ease;
}

.charts-grid > *:hover {
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  #app {
    padding: 12px;
  }
  
  .app-main {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .performance-info {
    justify-content: center;
  }
  
  .app-header h1 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .performance-info {
    gap: 12px;
  }
  
  .metric .value {
    font-size: 16px;
    padding: 4px 8px;
  }
}
</style>