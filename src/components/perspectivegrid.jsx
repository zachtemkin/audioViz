import React, { useEffect, useRef, useState } from "react";

const PerspectiveGrid = ({ speed = 2, delay = 500 }) => {
  const canvasRef = useRef(null);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const width = window.innerWidth;
    const height = window.innerHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const horizonY = centerY; // Horizon at the center of the screen
    const initialLineWidth = 100; // Initial width of the horizontal lines

    // Set canvas dimensions to full viewport
    canvas.width = width;
    canvas.height = height;

    const drawGrid = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "black";
      context.fillRect(0, 0, width, height); // Fill background with black
      context.strokeStyle = "green";
      context.lineWidth = 3; // Set line weight

      // Draw vertical lines converging towards the horizon
      const numVerticalLines = 20;
      for (let i = -numVerticalLines; i <= numVerticalLines; i++) {
        const x = i * initialLineWidth;
        context.beginPath();
        context.moveTo(centerX + x, horizonY);
        context.lineTo(centerX + x * 10, height);
        context.stroke();
      }

      // Draw persistent horizontal line at the center
      context.beginPath();
      context.moveTo(0, centerY);
      context.lineTo(width, centerY);
      context.stroke();

      // Draw horizontal lines moving towards the viewer
      lines.forEach((line, index) => {
        context.beginPath();
        context.moveTo(0, line.y); // Start from the left edge of the viewport
        context.lineTo(width, line.y); // End at the right edge of the viewport
        context.stroke();

        line.y += speed; // Move the line down

        // Remove the line if it's out of the canvas
        if (line.y > height) {
          lines.splice(index, 1);
        }
      });
    };

    const intervalId = setInterval(() => {
      setLines((prevLines) => [...prevLines, { y: horizonY }]);
    }, delay);

    const animationId = requestAnimationFrame(function animate() {
      drawGrid();
      requestAnimationFrame(animate);
    });

    return () => {
      clearInterval(intervalId);
      cancelAnimationFrame(animationId);
    };
  }, [lines, speed, delay]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        margin: "0",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    />
  );
};

export default PerspectiveGrid;
