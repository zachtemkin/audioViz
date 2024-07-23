import React, { useRef, useEffect, useState } from "react";
// import useParticles from "../useParticles";
// import usePerspectiveGrid from "../usePerspectiveGrid";

const Visualizer = () => {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const bufferLengthRef = useRef(null);
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMessage, setShowMessage] = useState(true);
  // const { particlesRef, emitParticles } = useParticles();
  const orbitAngle = useRef(0);

  // const numVerticalLines = 20;
  // const speed = 2;
  // const delay = 1000;
  // const steepness = 5;
  // const { verticalLinesRef, horizontalLinesRef } = usePerspectiveGrid(
  //   numVerticalLines,
  //   speed,
  //   delay,
  //   steepness,
  //   isPlaying
  // );

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === "Space") {
        if (!audioContextInitialized) {
          initializeAudioContext();
        } else {
          togglePlayPause();
        }
      } else if (event.code === "Backspace") {
        if (audioContextInitialized) {
          restartAudio();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioContextInitialized, isPlaying]);

  const initializeAudioContext = () => {
    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 64;
    bufferLengthRef.current = analyserRef.current.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLengthRef.current);

    const audioElement = audioRef.current;
    const source =
      audioContextRef.current.createMediaElementSource(audioElement);
    source.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);

    draw();
    setAudioContextInitialized(true);
    togglePlayPause();
  };

  const togglePlayPause = () => {
    const audioElement = audioRef.current;
    if (audioElement.paused) {
      audioElement.play();
      setShowMessage(false);
    } else {
      audioElement.pause();
      setShowMessage(true);
    }
    setIsPlaying(!audioElement.paused);
  };

  const restartAudio = () => {
    const audioElement = audioRef.current;
    audioElement.currentTime = 0;
    if (audioElement.paused) {
      audioElement.play();
    }
    setShowMessage(false);
    setIsPlaying(true);
  };

  const draw = () => {
    requestAnimationFrame(draw);

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // const maxBarHeight = window.innerHeight - 50;
    // const scalingFactor = maxBarHeight / 255;

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw perspective grid
    // ctx.strokeStyle = "rgb(255, 0, 255)";
    // ctx.lineWidth = 2;
    // verticalLinesRef.current.forEach((line) => {
    //   ctx.beginPath();
    //   ctx.moveTo(line.x1, line.y1);
    //   ctx.lineTo(line.x2, line.y2);
    //   ctx.stroke();
    // });
    // horizontalLinesRef.current.forEach((line) => {
    //   ctx.beginPath();
    //   ctx.moveTo(line.x1, line.y1);
    //   ctx.lineTo(line.x2, line.y2);
    //   ctx.stroke();
    // });

    // const barWidth = canvas.width / bufferLengthRef.current - 1;
    // let barHeight;
    // let x = 0;

    // for (let i = 0; i < bufferLengthRef.current; i++) {
    //   barHeight = dataArrayRef.current[i] * scalingFactor;

    //   // Set bar color based on frequency range
    //   if (i < bufferLengthRef.current * 0.33) {
    //     ctx.fillStyle = `rgb(
    //         ${barHeight / scalingFactor + 100},
    //         0,
    //         0
    //     )`;
    //   } else if (i < bufferLengthRef.current * 0.66) {
    //     ctx.fillStyle = `rgb(
    //         0,
    //         ${barHeight / scalingFactor + 100},
    //         0
    //     )`;
    //   } else {
    //     ctx.fillStyle = `rgb(
    //         0,
    //         0,
    //         ${barHeight / scalingFactor + 100}
    //     )`;
    //   }
    //   ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
    //   x += barWidth + 1;
    // }

    // Calculate average amplitude for low, mid, and high frequencies
    // const lowFreqAvg = getAverageAmplitude(
    //   dataArrayRef.current.slice(0, bufferLengthRef.current * 0.33)
    // );
    // const midFreqAvg = getAverageAmplitude(
    //   dataArrayRef.current.slice(
    //     bufferLengthRef.current * 0.33,
    //     bufferLengthRef.current * 0.66
    //   )
    // );
    // const highFreqAvg = getAverageAmplitude(
    //   dataArrayRef.current.slice(
    //     bufferLengthRef.current * 0.66,
    //     bufferLengthRef.current
    //   )
    // );

    // Check if mid frequency band exceeds 120 and emit particles if true
    // if (lowFreqAvg > 79) {
    //   emitParticles(canvas.width / 2, canvas.height / 2);
    // }

    // Calculate circle positions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    // const radius = (canvas.height - 350) / 2;

    // const lowCircleX = centerX + lowFreqAvg * 0.25;
    // const lowCircleY = centerY - lowFreqAvg * 0.25;

    // const midCircleX = centerX - midFreqAvg * 0.125;
    // const midCircleY = centerY - midFreqAvg * 0.125;

    // const highCircleX = centerX;
    // const highCircleY = centerY + highFreqAvg * 0.25;

    // Map average amplitude to opacity
    // const lowOpacity = mapRange(lowFreqAvg, 0, 255, 0.5, 1);
    // const midOpacity = mapRange(midFreqAvg, 0, 255, 0.5, 1);
    // const highOpacity = mapRange(highFreqAvg, 0, 255, 0.5, 1);

    // Draw circles
    // ctx.save();
    // ctx.globalCompositeOperation = "screen";

    ///////////////// Gloop Effect /////////////////

    // Map freq to scale
    // const lowSize = mapRange(lowFreqAvg, 0, 255, 0.5, 1.5);
    // const midSize = mapRange(midFreqAvg, 0, 255, 0.5, 1.5);
    // const highSize = mapRange(highFreqAvg, 0, 255, 0.5, 1.5);

    // Draw Gloop
    const orbitRadius = 140;
    // const smallRadius = 275 * lowSize;
    // const medRadius = 275 * midSize;
    // const largeRadius = 275 * highSize;

    // Calculate positions for orbiting circles
    // const xs = centerX + orbitRadius * Math.cos(orbitAngle.current * 1.5);
    // const ys = centerY + orbitRadius * Math.sin(orbitAngle.current * 1.5);
    // const xm = centerX + orbitRadius * Math.cos(orbitAngle.current + Math.PI);
    // const ym = centerY + orbitRadius * Math.sin(orbitAngle.current + Math.PI);
    // const xl =
    //   centerX + orbitRadius * Math.cos(orbitAngle.current * 2 + Math.PI / 3);
    // const yl =
    //   centerY + orbitRadius * Math.sin(orbitAngle.current * 2 + Math.PI / 3);

    let gloopRad = 275;
    let gloopx = centerX;
    let gloopy = centerY;

    const smallGradient = ctx.createLinearGradient(
      gloopx,
      gloopy - gloopRad,
      gloopx,
      gloopy + gloopRad
    );
    smallGradient.addColorStop(0, "#36a036");
    smallGradient.addColorStop(1, "#bc2d2d");

    const medGradient = ctx.createLinearGradient(
      gloopx,
      gloopy - gloopRad,
      gloopx,
      gloopy + gloopRad
    );
    medGradient.addColorStop(0, "#a08b36");
    medGradient.addColorStop(1, "#2dbca4");

    const largeGradient = ctx.createLinearGradient(
      gloopx,
      gloopy - gloopRad,
      gloopx,
      gloopy + gloopRad
    );
    largeGradient.addColorStop(0, "#22c473");
    largeGradient.addColorStop(1, "#b521c6");

    ctx.save();
    ctx.filter = "blur(24px)";

    let currentGradient = smallGradient;
    for (let i = 0; i < bufferLengthRef.current; i++) {
      gloopRad = mapRange(dataArrayRef.current[i], 0, 255, 140, 200) + 60;
      gloopx =
        centerX +
        orbitRadius *
          Math.cos(
            orbitAngle.current +
              ((2 * Math.PI) / bufferLengthRef.current) * i +
              1
          );
      gloopy =
        centerY +
        orbitRadius *
          Math.sin(
            orbitAngle.current +
              ((2 * Math.PI) / bufferLengthRef.current) * i +
              1
          );
      if (i % 3 === 0) currentGradient = smallGradient;
      if (i % 3 === 1) currentGradient = medGradient;
      if (i % 3 === 2) currentGradient = largeGradient;

      drawCircle(ctx, gloopx, gloopy, gloopRad, currentGradient);
    }
    orbitAngle.current += 0.02;

    // drawCircle(ctx, xm, ym, gloopRad, medGradient);
    // drawCircle(ctx, xl, yl, gloopRad, largeGradient);
    drawCircle(ctx, centerX, centerY, orbitRadius + 140, "rgb(0, 0, 0)");

    ctx.restore();
    ctx.save();

    ctx.globalCompositeOperation = "color-dodge";
    ctx.fillStyle = "#ccc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
    ctx.save();

    ctx.globalCompositeOperation = "color-burn";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
    ctx.save();

    // drawCircle(
    //   ctx,
    //   lowCircleX,
    //   lowCircleY,
    //   radius,
    //   `rgba(255, 0, 0, ${lowOpacity})`
    // );
    // drawCircle(
    //   ctx,
    //   midCircleX,
    //   midCircleY,
    //   radius,
    //   `rgba(0, 255, 0, ${midOpacity})`
    // );
    // drawCircle(
    //   ctx,
    //   highCircleX,
    //   highCircleY,
    //   radius,
    //   `rgba(0, 0, 255, ${highOpacity})`
    // );

    // const particleRadius = mapRange(midFreqAvg, 0, 255, 5, 20);
    // const particleY = mapRange(midFreqAvg, 0, 255, -50, 50);

    // // Draw particles
    // particlesRef.current.forEach((particle) => {
    //   particle.velocity.y = (Math.random() - 0.5) * particleY;
    //   ctx.beginPath();
    //   ctx.arc(
    //     particle.x,
    //     particle.y + Math.random() * particleY,
    //     particleRadius,
    //     0,
    //     Math.PI * 2
    //   );
    //   ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
    //   ctx.fill();
    // });

    // ctx.restore();
    // ctx.save();
  };

  const mapRange = (value, inMin, inMax, outMin, outMax) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };

  // const getAverageAmplitude = (array) => {
  //   const sum = array.reduce((a, b) => a + b, 0);
  //   return sum / array.length;
  // };

  const drawCircle = (context, x, y, radius, color) => {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        overflow: "hidden",
      }}>
      <audio ref={audioRef} style={{ display: "none" }}>
        <source src='/audio/op-z_9.mp3' type='audio/mp3' />
        Your browser does not support the audio element.
      </audio>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}></canvas>
      {showMessage && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: "24px",
            textAlign: "center",
          }}>
          {isPlaying
            ? "Press space to pause\nPress backspace to restart"
            : "Press space to start"}
        </div>
      )}
    </div>
  );
};

export default Visualizer;
