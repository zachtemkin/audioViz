import { useEffect, useRef } from "react";

const usePerspectiveGrid = (
  numVerticalLines,
  speed,
  acceleration,
  delay,
  steepness,
  isPlaying
) => {
  const verticalLinesRef = useRef([]);
  const horizontalLinesRef = useRef([]);

  useEffect(() => {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    const horizon = { x: canvasWidth / 2, y: canvasHeight / 2 };

    const initGrid = () => {
      const newVerticalLines = [];
      const spacing = canvasWidth / (numVerticalLines - 1);

      for (let i = 0; i < numVerticalLines; i++) {
        const x = i * spacing;
        newVerticalLines.push({
          x1: x,
          y1: horizon.y,
          x2: horizon.x + (x - horizon.x) * steepness,
          y2: canvasHeight,
        });
      }

      verticalLinesRef.current = newVerticalLines;
      horizontalLinesRef.current = [
        { x1: 0, y1: horizon.y, x2: canvasWidth, y2: horizon.y },
      ]; // Add persistent horizon line
    };

    const updateGrid = () => {
      horizontalLinesRef.current = horizontalLinesRef.current
        .map((line, index) => {
          line.speed += acceleration;
          if (index === 0) return line; // Skip the persistent horizon line
          const newY1 = line.y1 + line.speed;
          const newY2 = line.y2 + line.speed;
          return { ...line, y1: newY1, y2: newY2 };
        })
        .filter((line, index) => index === 0 || line.y1 < canvasHeight); // Keep the persistent horizon line
    };

    const emitHorizontalLine = () => {
      if (isPlaying) {
        horizontalLinesRef.current.push({
          x1: 0,
          y1: horizon.y,
          x2: canvasWidth,
          y2: horizon.y,
          speed: speed,
        });
      }
    };

    const handleResize = () => {
      initGrid();
    };

    initGrid();
    const interval = setInterval(updateGrid, 1000 / 60); // 60 FPS
    const emitInterval = setInterval(emitHorizontalLine, delay);
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      clearInterval(emitInterval);
      window.removeEventListener("resize", handleResize);
    };
  }, [numVerticalLines, speed, acceleration, delay, steepness, isPlaying]);

  return { verticalLinesRef, horizontalLinesRef };
};

export default usePerspectiveGrid;
