export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  
  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = context;
  }

  clear(width: number, height: number) {
    this.ctx.clearRect(0, 0, width, height);
  }

  drawLine(points: { x: number; y: number }[], color: string, lineWidth: number = 2) {
    if (points.length < 2) return;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    this.ctx.stroke();
  }

  drawPoints(points: { x: number; y: number }[], color: string, radius: number = 3) {
    this.ctx.fillStyle = color;
    
    points.forEach(point => {
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      this.ctx.fill();
    });
  }

  drawRect(x: number, y: number, width: number, height: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  drawGrid(width: number, height: number, cellSize: number = 50, color: string = '#f0f0f0') {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= width; x += cellSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += cellSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
  }

  drawText(text: string, x: number, y: number, color: string = '#000', fontSize: number = 12) {
    this.ctx.fillStyle = color;
    this.ctx.font = `${fontSize}px system-ui`;
    this.ctx.fillText(text, x, y);
  }
}