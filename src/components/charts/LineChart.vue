<template>
  <div class="chart-container">
    <canvas 
      ref="canvasRef" 
      class="chart-canvas"
      :width="viewport.width"
      :height="viewport.height"
    />
    <div class="chart-overlay">
      <div class="chart-title">📈 Real-time Line Chart</div>
      <div class="chart-stats">
        Points: {{ displayData.length }} | FPS: {{ Math.round(fps) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import type { DataPoint } from '@/types/dashboard.types';
import { CanvasRenderer } from '@/utils/canvasUtils';

interface Props {
  data: DataPoint[];
}

const props = defineProps<Props>();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const fps = ref(60);

const viewport = ref({
  width: 800,
  height: 400,
  xMin: 0,
  xMax: 1000,
  yMin: 0,
  yMax: 100
});

// OPTIMIZATION: Sample data for better performance
const displayData = computed(() => {
  if (props.data.length <= 2000) return props.data;
  
  // Sample data - take every nth point
  const sampleRate = Math.ceil(props.data.length / 2000);
  return props.data.filter((_, index) => index % sampleRate === 0);
});

let renderer: CanvasRenderer | null = null;
let animationFrameId: number;
let lastRenderTime = 0;

const scaleX = (timestamp: number) => {
  const { width, xMin, xMax } = viewport.value;
  return ((timestamp - xMin) / (xMax - xMin)) * width;
};

const scaleY = (value: number) => {
  const { height, yMin, yMax } = viewport.value;
  return height - ((value - yMin) / (yMax - yMin)) * height;
};

const render = (timestamp: number) => {
  if (!renderer || !canvasRef.value) return;

  // Calculate FPS
  const deltaTime = timestamp - lastRenderTime;
  if (deltaTime > 0) {
    fps.value = Math.round(1000 / deltaTime);
  }
  lastRenderTime = timestamp;

  const { width, height } = viewport.value;

  // OPTIMIZATION: Only clear if necessary
  renderer.clear(width, height);
  renderer.drawGrid(width, height, 100); // Larger grid for performance

  if (displayData.value.length > 0) {
    // Convert data points to canvas coordinates
    const points = displayData.value.map(point => ({
      x: scaleX(point.timestamp),
      y: scaleY(point.value)
    }));

    // Draw line (much faster with sampled data)
    renderer.drawLine(points, '#3b82f6', 1.5);
    
    // OPTIMIZATION: Only draw points for very small datasets
    if (displayData.value.length < 500) {
      renderer.drawPoints(points, '#3b82f6', 2);
    }
  }

  animationFrameId = requestAnimationFrame(render);
};

const handleResize = () => {
  if (!canvasRef.value) return;
  
  const container = canvasRef.value.parentElement;
  if (container) {
    viewport.value.width = container.clientWidth;
    viewport.value.height = container.clientHeight;
    
    canvasRef.value.width = viewport.value.width;
    canvasRef.value.height = viewport.value.height;
  }
};

const startAnimation = () => {
  lastRenderTime = performance.now();
  animationFrameId = requestAnimationFrame(render);
};

const stopAnimation = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
};

onMounted(() => {
  if (canvasRef.value) {
    try {
      renderer = new CanvasRenderer(canvasRef.value);
      handleResize();
      startAnimation();
      window.addEventListener('resize', handleResize);
    } catch (error) {
      console.error('LineChart mount error:', error);
    }
  }
});

onUnmounted(() => {
  stopAnimation();
  window.removeEventListener('resize', handleResize);
});

// Auto-adjust viewport when data changes
watch(() => props.data, (newData) => {
  if (newData.length > 0) {
    const values = newData.map(d => d.value);
    const timestamps = newData.map(d => d.timestamp);
    
    viewport.value.yMin = Math.min(...values) * 0.9;
    viewport.value.yMax = Math.max(...values) * 1.1;
    viewport.value.xMin = Math.min(...timestamps);
    viewport.value.xMax = Math.max(...timestamps);
  }
}, { deep: true });
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 400px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.chart-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.chart-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 100%);
  pointer-events: none;
}
</style>