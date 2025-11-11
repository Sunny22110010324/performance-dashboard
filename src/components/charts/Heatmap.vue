<template>
  <div class="chart-container">
    <canvas 
      ref="canvasRef" 
      class="chart-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
    />
    <div class="chart-overlay">
      <div class="chart-title">🔥 Heatmap</div>
      <div class="chart-stats">Points: {{ data.length }} | Rendering: {{ renderStatus }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import type { DataPoint } from '@/types/dashboard.types';

interface Props {
  data: DataPoint[];
}

const props = defineProps<Props>();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWidth = ref(800);
const canvasHeight = ref(400);
const renderStatus = ref('Initializing...');
const ctx = ref<CanvasRenderingContext2D | null>(null);

// Simple test data to ensure heatmap works
const testData = ref<DataPoint[]>([
  { id: '1', timestamp: Date.now(), value: 25, category: 'A', x: 100, y: 100 },
  { id: '2', timestamp: Date.now(), value: 50, category: 'B', x: 200, y: 200 },
  { id: '3', timestamp: Date.now(), value: 75, category: 'C', x: 300, y: 300 },
  { id: '4', timestamp: Date.now(), value: 100, category: 'D', x: 400, y: 400 },
  { id: '5', timestamp: Date.now(), value: 25, category: 'A', x: 500, y: 500 },
]);

const initializeCanvas = () => {
  if (!canvasRef.value) {
    renderStatus.value = 'Canvas element not found';
    return false;
  }

  try {
    const context = canvasRef.value.getContext('2d');
    if (!context) {
      renderStatus.value = 'Could not get 2D context';
      return false;
    }
    
    ctx.value = context;
    renderStatus.value = 'Canvas ready';
    console.log('✅ Canvas context initialized successfully');
    return true;
  } catch (error) {
    renderStatus.value = `Canvas error: ${error}`;
    console.error('❌ Canvas initialization failed:', error);
    return false;
  }
};

const drawHeatmap = () => {
  if (!ctx.value || !canvasRef.value) {
    renderStatus.value = 'Canvas not ready';
    return;
  }

  const width = canvasWidth.value;
  const height = canvasHeight.value;
  
  console.log('🎨 Drawing heatmap...', { width, height, dataPoints: props.data.length });

  // Clear canvas with white background
  ctx.value.fillStyle = '#ffffff';
  ctx.value.fillRect(0, 0, width, height);

  // Draw a simple test pattern first to verify canvas works
  drawTestPattern();
  
  // If we have real data, draw the actual heatmap
  if (props.data.length > 0) {
    drawActualHeatmap();
  }

  renderStatus.value = `Rendered ${props.data.length} points`;
};

const drawTestPattern = () => {
  if (!ctx.value) return;

  // Draw a simple gradient to verify canvas is working
  const gradient = ctx.value.createLinearGradient(0, 0, canvasWidth.value, 0);
  gradient.addColorStop(0, 'red');
  gradient.addColorStop(0.5, 'green');
  gradient.addColorStop(1, 'blue');
  
  ctx.value.fillStyle = gradient;
  ctx.value.fillRect(10, 10, canvasWidth.value - 20, 50);
  
  ctx.value.fillStyle = '#000000';
  ctx.value.font = '14px Arial';
  ctx.value.fillText('Heatmap Test - Canvas is working!', 20, 40);
};

const drawActualHeatmap = () => {
  if (!ctx.value) return;

  const width = canvasWidth.value;
  const height = canvasHeight.value;
  
  // Heatmap configuration
  const cellSize = 25;
  const cols = Math.floor(width / cellSize);
  const rows = Math.floor(height / cellSize);
  
  console.log(`🔢 Heatmap grid: ${cols}x${rows} cells`);

  // Create density grid
  const grid: number[][] = [];
  for (let i = 0; i < rows; i++) {
    grid[i] = new Array(cols).fill(0);
  }

  // Use actual data or test data
  const dataToUse = props.data.length > 0 ? props.data : testData.value;
  
  // Calculate densities
  dataToUse.forEach(point => {
    // Normalize coordinates to fit the grid
    const normalizedX = point.x ? point.x / 1000 : Math.random();
    const normalizedY = point.value / 100; // Values 0-100
    
    const col = Math.floor(normalizedX * cols);
    const row = Math.floor(normalizedY * rows);
    
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      grid[row][col] += 1;
    }
  });

  // Find max density for color scaling
  let maxDensity = 1;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] > maxDensity) {
        maxDensity = grid[row][col];
      }
    }
  }

  console.log(`📊 Max density: ${maxDensity}`);

  // Draw heatmap cells
  let cellsDrawn = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const density = grid[row][col];
      if (density > 0) {
        const intensity = density / maxDensity;
        
        // Color from blue (low) to red (high)
        const r = Math.floor(255 * intensity);
        const g = Math.floor(100 * (1 - intensity));
        const b = Math.floor(255 * (1 - intensity));
        
        ctx.value.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.value.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        
        // Add cell border
        ctx.value.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.value.lineWidth = 1;
        ctx.value.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
        
        cellsDrawn++;
      }
    }
  }

  console.log(`✅ Drew ${cellsDrawn} heatmap cells`);

  // Draw legend
  drawLegend();
};

const drawLegend = () => {
  if (!ctx.value) return;

  const width = canvasWidth.value;
  const height = canvasHeight.value;

  // Legend background
  ctx.value.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.value.fillRect(width - 120, 10, 110, 80);

  // Legend title
  ctx.value.fillStyle = '#000000';
  ctx.value.font = '12px Arial';
  ctx.value.fillText('Density Legend', width - 110, 25);

  // Color gradient
  const gradient = ctx.value.createLinearGradient(width - 110, 40, width - 10, 40);
  gradient.addColorStop(0, 'blue');
  gradient.addColorStop(1, 'red');
  
  ctx.value.fillStyle = gradient;
  ctx.value.fillRect(width - 110, 40, 100, 15);

  // Labels
  ctx.value.fillStyle = '#000000';
  ctx.value.font = '10px Arial';
  ctx.value.fillText('Low', width - 110, 70);
  ctx.value.fillText('High', width - 30, 70);
};

const handleResize = () => {
  if (!canvasRef.value) return;
  
  const container = canvasRef.value.parentElement;
  if (container) {
    const rect = container.getBoundingClientRect();
    canvasWidth.value = rect.width;
    canvasHeight.value = rect.height;
    
    console.log('📏 Canvas resized:', { width: canvasWidth.value, height: canvasHeight.value });
    
    // Redraw after resize
    nextTick(() => {
      if (initializeCanvas()) {
        drawHeatmap();
      }
    });
  }
};

onMounted(() => {
  console.log('🔄 Heatmap component mounting...');
  
  nextTick(() => {
    // Initial setup
    handleResize();
    
    // Draw after a short delay to ensure DOM is ready
    setTimeout(() => {
      if (initializeCanvas()) {
        drawHeatmap();
        renderStatus.value = `Ready - ${props.data.length} points`;
      }
    }, 100);

    // Add resize listener
    window.addEventListener('resize', handleResize);
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// Redraw when data changes
watch(() => props.data, (newData) => {
  console.log('🔄 Heatmap data updated:', newData.length, 'points');
  
  if (ctx.value) {
    drawHeatmap();
  } else {
    console.log('⚠️ Canvas context not ready, reinitializing...');
    if (initializeCanvas()) {
      drawHeatmap();
    }
  }
}, { deep: true });

// Debug: Force redraw every 2 seconds to test
setInterval(() => {
  if (ctx.value && canvasRef.value) {
    console.log('🔄 Periodic redraw check');
    drawHeatmap();
  }
}, 2000);
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 400px;
  background: #f8f9fa;
  border: 2px solid #dc3545;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.chart-canvas {
  display: block;
  width: 100%;
  height: 100%;
  background: white;
}

.chart-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%);
  pointer-events: none;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}

.chart-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.chart-stats {
  font-size: 12px;
  opacity: 0.9;
}
</style>