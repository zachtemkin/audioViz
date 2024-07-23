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

  const velocitiesRef = useRef([]);

  // const { particlesRef, emitParticles } = useParticles();

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

  // Initialize random velocities for each circle
  if (velocitiesRef.current.length === 0) {
    for (let i = 0; i < bufferLengthRef.current; i++) {
      velocitiesRef.current.push(Math.random() * (0.08 - 0.01) + 0.01);
    }
  }

  const draw = () => {
    requestAnimationFrame(draw);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    ///////////////// GRID /////////////////

    // ctx.strokeStyle = "rgb(171, 171, 171)";
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

    ///////////////// BARS /////////////////

    // const maxBarHeight = window.innerHeight - 50;
    // const scalingFactor = maxBarHeight / 255;

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

    ///////////////// AVERAGE FREQ /////////////////

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

    ///////////////// Gloop Effect /////////////////

    // Set the blur
    ctx.save();
    ctx.filter = "blur(12px)";

    // Calculate center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Set Gloop parameters
    const centerRadius = 256;
    const orbitRadius = centerRadius - 48;
    const minRad = orbitRadius / 6 + 6;
    const maxRad = minRad * 2.5;
    let gloopRad = minRad;
    let gloopx = centerX;
    let gloopy = centerY;

    // Make some gradients
    const grad1 = ctx.createLinearGradient(
      gloopx,
      gloopy - gloopRad,
      gloopx,
      gloopy + gloopRad
    );
    grad1.addColorStop(0, "#ff0000");
    grad1.addColorStop(1, "#00ff00");

    const grad2 = ctx.createLinearGradient(
      gloopx,
      gloopy - gloopRad,
      gloopx,
      gloopy + gloopRad
    );
    grad2.addColorStop(0, "#00ff00");
    grad2.addColorStop(1, "#0000ff");

    const grad3 = ctx.createLinearGradient(
      gloopx,
      gloopy - gloopRad,
      gloopx,
      gloopy + gloopRad
    );
    grad3.addColorStop(0, "#00ffff");
    grad3.addColorStop(1, "#ff0000");

    const grad4 = ctx.createLinearGradient(
      gloopx,
      gloopy - gloopRad,
      gloopx,
      gloopy + gloopRad
    );
    grad4.addColorStop(0, "#ffff00");
    grad4.addColorStop(1, "#0000ff");

    const grads = [grad1, grad2, grad3, grad4];
    let currentGradient = grad1;

    const currentTime = Date.now();

    // Draw a Gloop for each FFT band and modulate it's radius with the band
    // Rotate the Gloop around the main circle at it's own velocity
    for (let i = 0; i < bufferLengthRef.current; i++) {
      const angle =
        ((currentTime * velocitiesRef.current[i]) / 50) % (2 * Math.PI);

      gloopRad = mapExp(dataArrayRef.current[i], 0, 255, minRad, maxRad);

      gloopx =
        centerX +
        orbitRadius *
          Math.cos(angle + (i * 2 * Math.PI) / bufferLengthRef.current);

      gloopy =
        centerY +
        orbitRadius *
          Math.sin(angle + (i * 2 * Math.PI) / bufferLengthRef.current);

      currentGradient = grads[i % grads.length];

      drawCircle(ctx, gloopx, gloopy, gloopRad, currentGradient);
    }

    ctx.restore();
    ctx.save();
    ctx.filter = "blur(24px)";

    // Center Circle
    drawCircle(ctx, centerX, centerY, centerRadius, "rgb(0, 0, 0)");

    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "color-dodge";
    ctx.fillStyle = "#cccbcb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "color-burn";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
    ctx.save();

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

  // const mapRange = (value, inMin, inMax, outMin, outMax) => {
  //   return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  // };

  function mapExp(value, inMin, inMax, outMin, outMax) {
    // Ensure the input range is valid
    if (inMin >= inMax || outMin >= outMax) {
      throw new Error("Invalid range");
    }

    // Normalize the input value to the range [0, 1]
    const normalized = (value - inMin) / (inMax - inMin);

    // Apply an exponential transformation
    const expValue = Math.pow(normalized, 2.5); // Adjust the exponent as needed

    // Map the transformed value to the output range
    return outMin + expValue * (outMax - outMin);
  }

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
