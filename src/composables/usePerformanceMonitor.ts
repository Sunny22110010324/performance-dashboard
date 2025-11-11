import { ref, onMounted, onUnmounted } from 'vue';
import type { PerformanceMetrics } from '@/types/dashboard.types';

export function usePerformanceMonitor() {
  const metrics = ref<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    dataProcessingTime: 0,
    dataPointCount: 0
  });

  let frameCount = 0;
  let lastTime = performance.now();
  let animationFrameId: number;
  let memoryCheckInterval: number;

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';

  const updateMetrics = () => {
    frameCount++;
    const currentTime = performance.now();
    
    // Update FPS every second
    if (currentTime >= lastTime + 1000) {
      metrics.value.fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      frameCount = 0;
      lastTime = currentTime;
      
      // Update memory usage if supported
      updateMemoryUsage();
      
      // Log performance for debugging (only in development)
      if (isDevelopment) {
        console.log(`🎯 Performance: ${metrics.value.fps} FPS, ${metrics.value.memoryUsage}MB, ${metrics.value.dataPointCount} points`);
      }
    }
    
    animationFrameId = requestAnimationFrame(updateMetrics);
  };

  const updateMemoryUsage = () => {
    // Check if memory API is available (Chrome only)
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      metrics.value.memoryUsage = Math.round(memory.usedJSHeapSize / 1048576); // Convert to MB
      
      // Log memory warnings
      if (metrics.value.memoryUsage > 100 && isDevelopment) {
        console.warn(`⚠️ High memory usage: ${metrics.value.memoryUsage}MB`);
      }
    }
  };

  const startMemoryMonitoring = () => {
    // Check memory every 5 seconds
    memoryCheckInterval = window.setInterval(updateMemoryUsage, 5000);
  };

  const stopMemoryMonitoring = () => {
    if (memoryCheckInterval) {
      clearInterval(memoryCheckInterval);
    }
  };

  // Individual chart performance monitoring
  const startChartMonitor = (chartName: string) => {
    let chartFrameCount = 0;
    let chartLastTime = performance.now();
    let chartFps = 60;

    const updateChartFPS = () => {
      chartFrameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= chartLastTime + 1000) {
        chartFps = Math.round((chartFrameCount * 1000) / (currentTime - chartLastTime));
        chartFrameCount = 0;
        chartLastTime = currentTime;
        
        if (isDevelopment) {
          console.log(`📊 ${chartName} FPS: ${chartFps}`);
        }
      }
      
      requestAnimationFrame(updateChartFPS);
    };
    
    updateChartFPS();
    return chartFps;
  };

  // Performance optimization helpers
  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func.apply(null, args), wait);
    };
  };

  const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // Performance benchmarking
  const measureExecutionTime = <T extends (...args: any[]) => any>(
    func: T,
    name: string = 'Function'
  ): ((...args: Parameters<T>) => ReturnType<T>) => {
    return (...args: Parameters<T>): ReturnType<T> => {
      const startTime = performance.now();
      const result = func.apply(null, args);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;
      
      if (isDevelopment && executionTime > 16) { // Longer than one frame at 60fps
        console.warn(`🐢 ${name} took ${executionTime.toFixed(2)}ms (may affect FPS)`);
      }
      
      return result;
    };
  };

  // Memory usage analysis
  const getMemoryStats = () => {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576),
        total: Math.round(memory.totalJSHeapSize / 1048576),
        limit: Math.round(memory.jsHeapSizeLimit / 1048576)
      };
    }
    return null;
  };

  // Performance alerts
  const checkPerformanceAlerts = () => {
    const alerts: string[] = [];
    
    if (metrics.value.fps < 30) {
      alerts.push(`Low FPS: ${metrics.value.fps}. Consider reducing data points or optimizing rendering.`);
    }
    
    if (metrics.value.memoryUsage > 200) {
      alerts.push(`High memory usage: ${metrics.value.memoryUsage}MB. Check for memory leaks.`);
    }
    
    if (metrics.value.renderTime > 16) {
      alerts.push(`Slow rendering: ${metrics.value.renderTime.toFixed(2)}ms per frame.`);
    }
    
    if (metrics.value.dataProcessingTime > 10) {
      alerts.push(`Slow data processing: ${metrics.value.dataProcessingTime.toFixed(2)}ms.`);
    }
    
    return alerts;
  };

  // Performance optimization suggestions
  const getOptimizationSuggestions = () => {
    const suggestions: string[] = [];
    
    if (metrics.value.fps < 45) {
      suggestions.push('• Reduce number of data points displayed');
      suggestions.push('• Implement data sampling for large datasets');
      suggestions.push('• Use simpler chart rendering techniques');
    }
    
    if (metrics.value.memoryUsage > 150) {
      suggestions.push('• Implement data pagination or windowing');
      suggestions.push('• Clear unused data from memory');
      suggestions.push('• Use object pooling for frequent creations');
    }
    
    if (metrics.value.dataPointCount > 5000) {
      suggestions.push('• Consider using Web Workers for data processing');
      suggestions.push('• Implement virtual scrolling for data tables');
      suggestions.push('• Use level-of-detail rendering (show less detail when zoomed out)');
    }
    
    return suggestions;
  };

  onMounted(() => {
    animationFrameId = requestAnimationFrame(updateMetrics);
    startMemoryMonitoring();
    
    if (isDevelopment) {
      console.log('🚀 Performance monitor started');
    }
  });

  onUnmounted(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    stopMemoryMonitoring();
    
    if (isDevelopment) {
      console.log('🛑 Performance monitor stopped');
    }
  });

  const updateRenderTime = (time: number) => {
    metrics.value.renderTime = time;
  };

  const updateDataProcessingTime = (time: number) => {
    metrics.value.dataProcessingTime = time;
  };

  const updateDataPointCount = (count: number) => {
    metrics.value.dataPointCount = count;
  };

  // Reset all metrics
  const resetMetrics = () => {
    metrics.value = {
      fps: 60,
      memoryUsage: 0,
      renderTime: 0,
      dataProcessingTime: 0,
      dataPointCount: 0
    };
    frameCount = 0;
    lastTime = performance.now();
  };

  // Get performance summary
  const getPerformanceSummary = () => {
    const alerts = checkPerformanceAlerts();
    const suggestions = getOptimizationSuggestions();
    const memoryStats = getMemoryStats();
    
    return {
      current: { ...metrics.value },
      alerts,
      suggestions,
      memoryStats,
      timestamp: Date.now()
    };
  };

  return {
    metrics,
    updateRenderTime,
    updateDataProcessingTime,
    updateDataPointCount,
    startChartMonitor,
    debounce,
    throttle,
    measureExecutionTime,
    getMemoryStats,
    checkPerformanceAlerts,
    getOptimizationSuggestions,
    resetMetrics,
    getPerformanceSummary
  };
}