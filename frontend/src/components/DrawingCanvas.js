import React, { useRef, useState } from 'react';
import { PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import styles from '../styleSheets/NoteDetailScreenStyles';

// @note util imports
import { toNDigits, getStrokeProperties, isPointNearPath, createDrawingObject } from '../utils/drawingUtils';

// @note DrawingCanvas
export default function DrawingCanvas(props) {
  // @note props
  const {
    drawings,
    setDrawings,
    currentDrawing,
    setCurrentDrawing,
    selectTool: selectedTool,
    selectedColor,
    brushSize,
    eraserSize,
    drawingMode,
  } = props;

  // @note local drawing state and refs
  const pathRef = useRef('');
  const [isDrawing, setIsDrawing] = useState(false);
  const lastUpdateTime = useRef(Date.now());

  // @note panResponder logic
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => drawingMode,
    onMoveShouldSetPanResponder: () => drawingMode,
    onPanResponderGrant: (evt) => {
      console.log('drawing cavnas touched');
      if (!drawingMode) return;
      setIsDrawing(true);
      let { locationX, locationY } = evt.nativeEvent;
      locationX = toNDigits(locationX, 2);
      locationY = toNDigits(locationY, 2);
      if (selectedTool === 'eraser') {
        const updatedDrawings = drawings.filter(drawing =>
          !isPointNearPath(locationX, locationY, drawing.path, eraserSize / 2)
        );
        setDrawings && setDrawings(updatedDrawings);
      } else {
        pathRef.current = `M${locationX} ${locationY}`;
        setCurrentDrawing &&
          setCurrentDrawing({
            path: pathRef.current,
            color: selectedColor,
            tool: selectedTool,
            ...getStrokeProperties(selectedTool, brushSize, eraserSize),
          });
      }
    },
    onPanResponderMove: (evt) => {
      if (!isDrawing || !drawingMode) return;
      const now = Date.now();
      if (now - lastUpdateTime.current < 16) return;
      lastUpdateTime.current = now;
      let { locationX, locationY } = evt.nativeEvent;
      locationX = toNDigits(locationX, 2);
      locationY = toNDigits(locationY, 2);
      if (selectedTool === 'eraser') {
        const updatedDrawings = drawings.filter(drawing =>
          !isPointNearPath(locationX, locationY, drawing.path, eraserSize / 2)
        );
        setDrawings && setDrawings(updatedDrawings);
      } else {
        pathRef.current += ` L${locationX} ${locationY}`;
        setCurrentDrawing &&
          setCurrentDrawing(prev => ({
            ...prev,
            path: pathRef.current,
          }));
      }
    },
    onPanResponderRelease: () => {
      if (isDrawing && drawingMode) {
        if (selectedTool !== 'eraser' && currentDrawing && pathRef.current) {
          const finalDrawing = createDrawingObject(
            pathRef.current,
            selectedTool,
            selectedColor,
            brushSize,
            eraserSize
          );
          setDrawings && setDrawings(prev => [...prev, finalDrawing]);
          setCurrentDrawing && setCurrentDrawing(null);
          pathRef.current = '';
        }
        setIsDrawing(false);
      }
    },
    
  });

  // @note SVG Drawing and overlay render
  return (
    <Svg height="100%" width="100%" style={styles.svgOverlay} {...panResponder.panHandlers}>
      {/* @note past drawings */}
      {drawings
        .filter(
          (drawing) =>
            drawing &&
            drawing.path &&
            drawing.path.length > 0 &&
            drawing.color
        )
        .map((drawing, index) => (
          <Path
            key={drawing.id || `drawing_${index}`}
            d={drawing.path}
            stroke={drawing.color}
            strokeWidth={drawing.strokeWidth || 2}
            strokeOpacity={drawing.strokeOpacity || 1}
            strokeLinecap={drawing.strokeLinecap || 'round'}
            strokeLinejoin={drawing.strokeLinejoin || 'round'}
            fill="none"
          />
        ))}
      {/* @note current drawing */}
      {currentDrawing && selectedTool !== 'eraser' && (
        <Path
          d={currentDrawing.path}
          stroke={currentDrawing.color}
          strokeWidth={currentDrawing.strokeWidth}
          strokeOpacity={currentDrawing.strokeOpacity}
          strokeLinecap={currentDrawing.strokeLinecap}
          strokeLinejoin={currentDrawing.strokeLinejoin}
          fill="none"
        />
      )}
    </Svg>
  );
}

// @note End of DrawingCanvas.js
