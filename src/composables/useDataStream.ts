import { ref, computed, onUnmounted } from 'vue';
import type { DataPoint } from '@/types/dashboard.types';

export function useDataStream() {
  const data = ref<DataPoint[]>([]);
  const isStreaming = ref(false);
  let streamInterval: number | null = null;

  const categories = ['A', 'B', 'C', 'D'];

  const generateDataPoint = (): DataPoint => {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const value = 50 + Math.random() * 50 + Math.sin(Date.now() * 0.001) * 20;
    
    return {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      value,
      category,
      x: Math.random() * 1000,
      y: Math.random() * 1000,
    };
  };

  const generateInitialDataset = (count: number = 10000) => {
    console.log('🔄 Generating initial dataset with', count, 'points');
    const newData: DataPoint[] = [];
    const baseTime = Date.now() - (count * 100);
    
    for (let i = 0; i < count; i++) {
      newData.push({
        id: `initial-${i}`,
        timestamp: baseTime + (i * 100),
        value: 50 + Math.random() * 50 + Math.sin(i * 0.1) * 20,
        category: categories[i % categories.length],
        x: Math.random() * 1000,
        y: Math.random() * 1000,
      });
    }
    
    data.value = newData;
    console.log('✅ Dataset generated with', newData.length, 'points');
  };

  const startStream = (interval: number = 100) => {
    if (streamInterval) return;
    
    isStreaming.value = true;
    console.log('🔄 Starting data stream');
    streamInterval = window.setInterval(() => {
      const newPoint = generateDataPoint();
      data.value.push(newPoint);
      
      // Keep only last 20,000 points to prevent memory issues
      if (data.value.length > 20000) {
        data.value = data.value.slice(-15000);
      }
    }, interval);
  };

  const stopStream = () => {
    if (streamInterval) {
      clearInterval(streamInterval);
      streamInterval = null;
    }
    isStreaming.value = false;
    console.log('🛑 Data stream stopped');
  };

  onUnmounted(() => {
    stopStream();
  });

  return {
    data: computed(() => data.value),
    isStreaming,
    initializeData: generateInitialDataset,
    startStream,
    stopStream,
    totalPoints: computed(() => data.value.length)
  };
}