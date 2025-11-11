export interface DataPoint {
  id: string;
  timestamp: number;
  value: number;
  category: string;
  x?: number;
  y?: number;
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'scatter' | 'heatmap';
  dataKey: string;
  color: string;
  visible: boolean;
  aggregation: 'none' | '1min' | '5min' | '1hour';
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  dataProcessingTime: number;
  dataPointCount: number;
}

export interface Viewport {
  width: number;
  height: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface FilterState {
  categories: string[];
  timeRange: [number, number];
  valueRange: [number, number];
}