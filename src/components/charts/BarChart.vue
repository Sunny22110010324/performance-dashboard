<template>
  <div class="chart-container">
    <canvas ref="canvasRef" class="chart-canvas"></canvas>
    <div class="chart-overlay">
      <div class="chart-title">📊 Bar Chart</div>
      <div class="chart-stats">Points: {{ data.length }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { DataPoint } from '@/types/dashboard.types';
import { CanvasRenderer } from '@/utils/canvasUtils';

interface Props {
  data: DataPoint[];
}

const props = defineProps<Props>();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const viewport = ref({ width: 800, height: 400 });

let renderer: CanvasRenderer | null = null;
let animationFrameId: number;

const render = () => {
  if (!renderer || !canvasRef.value) return;

  const { width, height } = viewport.value;
  renderer.clear(width, height);
  renderer.drawGrid(width, height);

  // Simple bar chart implementation
  if (props.data.length > 0) {
    const barWidth = width / Math.min(props.data.length, 50);
    const maxValue = Math.max(...props.data.map(d => d.value));
    
    // Take only first 50 points for bar chart clarity
    const displayData = props.data.slice(0, 50);
    
    displayData.forEach((point, index) => {
      const barHeight = (point.value / maxValue) * height * 0.8;
      const x = index * barWidth;
      const y = height - barHeight;
      
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
      const color = colors[index % colors.length];
      
      renderer!.drawRect(x + 1, y, barWidth - 2, barHeight, color);
    });
  }
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
  const animate = () => {
    render();
    animationFrameId = requestAnimationFrame(animate);
  };
  animate();
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
      console.log('✅ BarChart mounted successfully');
    } catch (error) {
      console.error('❌ BarChart mount error:', error);
    }
  }
});

onUnmounted(() => {
  stopAnimation();
  window.removeEventListener('resize', handleResize);
});

watch(() => props.data, () => {
  // Data changed, will be rendered in next animation frame
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