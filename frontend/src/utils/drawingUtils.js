// src/utils/drawingUtils.js
    let i=2;
export function toNDigits(num, digits = 2) {

    if(i<4){
        console.log("in the function");
        console.log(Number(num).toFixed(digits));
        i++;
    }
        
    return Number(num).toFixed(digits);
  }
  
  export function getStrokeProperties(selectedTool, brushSize, eraserSize) {
    switch (selectedTool) {
      case 'brush':
        return {
          strokeWidth: brushSize * 2,
          strokeOpacity: 0.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        };
      case 'highlighter':
        return {
          strokeWidth: brushSize * 3,
          strokeOpacity: 0.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        };
      case 'eraser':
        return {
          strokeWidth: eraserSize,
          strokeOpacity: 1,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        };
      default: // pen
        return {
          strokeWidth: brushSize,
          strokeOpacity: 1,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        };
    }
  }


  // @note createDrawingObject (UTILITY)
export function createDrawingObject(
    path,
    tool,
    selectedColor,
    brushSize,
    eraserSize
  ) {
    // Get stroke props for the current tool
    const strokeProps = getStrokeProperties(tool, brushSize, eraserSize);
  
    // Compose the drawing object
    const baseDrawing = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      path,
      color: selectedColor,
      tool,
      timestamp: new Date().toISOString(),
      ...strokeProps,
    };
  
    // Add tool-specific 'size' property for legacy/compat code:
    switch (tool) {
      case 'brush':
        return { ...baseDrawing, size: brushSize * 2 };
      case 'highlighter':
        return { ...baseDrawing, size: brushSize * 3 };
      case 'eraser':
        return { ...baseDrawing, size: eraserSize };
      default: // pen
        return { ...baseDrawing, size: brushSize };
    }
  }
  
export function isPointNearPath (x, y, pathString, eraserRadius) {
    const pathPoints = pathString.match(/\d+\.?\d*/g);
    if (!pathPoints || pathPoints.length < 2) return false;
   
    for (let i = 0; i < pathPoints.length - 1; i += 2) {
      const px = parseFloat(pathPoints[i]);
      const py = parseFloat(pathPoints[i + 1]);
      const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (distance <= eraserRadius) {
        return true;
      }
    }
    return false;
};