import React, { useRef, useEffect, useState } from "react";
// import useParticles from "../useParticles";
import usePerspectiveGrid from "../usePerspectiveGrid";

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
  const gridIsOn = useRef(false);
  const horizonModeIsOn = useRef(false);
  const barsIsOn = useRef(false);

  const lastTime = useRef();
  // const medianAmplitude = useRef(255);
  const maxAmplitude = useRef(255);
  const newMaxAmplitude = useRef(255);
  const amplitudeDelta = useRef(0);
  const velocitiesRef = useRef([]);

  // const { particlesRef, emitParticles } = useParticles();

  const numVerticalLines = 20;
  const speed = 0.025;
  const acceleration = 0.05;
  const delay = 500;
  const steepness = 5;
  const { verticalLinesRef, horizontalLinesRef } = usePerspectiveGrid(
    numVerticalLines,
    speed,
    acceleration,
    delay,
    steepness,
    isPlaying
  );

  useEffect(() => {
    lastTime.current = Date.now();
  }, []);

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
      } else if (event.code === "KeyG") {
        !gridIsOn.current
          ? (gridIsOn.current = true)
          : (gridIsOn.current = false);
      } else if (event.code === "KeyH") {
        !horizonModeIsOn.current
          ? (horizonModeIsOn.current = true)
          : (horizonModeIsOn.current = false);
      } else if (event.code === "KeyB") {
        !barsIsOn.current
          ? (barsIsOn.current = true)
          : (barsIsOn.current = false);
      }
    };

    const handleClick = () => {
      if (!audioContextInitialized) {
        initializeAudioContext();
      } else {
        togglePlayPause();
      }
    };

    const handleTap = (event) => {
      const touch = event.touches[0] || event.changedTouches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;

      window.addEventListener(
        "touchend",
        (event) => {
          const touchEnd = event.changedTouches[0];
          const endX = touchEnd.clientX;
          const endY = touchEnd.clientY;

          const threshold = 10; // adjust as needed
          if (
            Math.abs(endX - startX) < threshold &&
            Math.abs(endY - startY) < threshold
          ) {
          }
        },
        { once: true }
      ); // Using { once: true } to automatically remove the touchend listener
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("click", handleClick);
    window.addEventListener("touchstart", handleTap, false);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleTap, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioContextInitialized, isPlaying, gridIsOn]);

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

    ///////////////// CALCULATE AVERAGE FREQ /////////////////

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
    // if (midFreqAvg > 60) {
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
    const desktopRadius = horizonModeIsOn.current ? 400 : 256;
    const mobileRadius = horizonModeIsOn.current
      ? canvas.width - 256
      : canvas.width - 256;

    const centerOffset = horizonModeIsOn.current ? 150 : 0;

    const centerRadius = canvas.width > 778 ? desktopRadius : mobileRadius;

    const orbitRadius = centerRadius - 0.19 * centerRadius;
    const minRad = orbitRadius / 6 + 6;
    const maxRad = minRad * 2.5;
    let gloopRad = minRad;
    let gloopx = centerX;
    let gloopy = centerY + centerOffset;

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

    // Every second determine the new max amplitude
    const currentTime = Date.now();
    if (currentTime - lastTime.current > 1000) {
      newMaxAmplitude.current = findMaxValue(dataArrayRef.current);
      amplitudeDelta.current = maxAmplitude.current - newMaxAmplitude.current;

      if (amplitudeDelta.current > 0 && newMaxAmplitude.current > 0) {
        maxAmplitude.current = newMaxAmplitude.current;
      } else if (amplitudeDelta.current < -15) {
        maxAmplitude.current = newMaxAmplitude.current;
      }

      lastTime.current = currentTime;
    }

    // Draw a Gloop for each FFT band and modulate it's radius with the band
    // Rotate the Gloop around the main circle at it's own velocity
    for (let i = 0; i < bufferLengthRef.current; i++) {
      const angle =
        ((currentTime * velocitiesRef.current[i]) / 50) % (2 * Math.PI);

      gloopRad = mapExp(
        dataArrayRef.current[i],
        0,
        maxAmplitude.current,
        minRad,
        maxRad
      );

      gloopx =
        centerX +
        orbitRadius *
          Math.cos(angle + (i * 2 * Math.PI) / bufferLengthRef.current);

      gloopy =
        centerY +
        centerOffset +
        orbitRadius *
          Math.sin(angle + (i * 2 * Math.PI) / bufferLengthRef.current);

      currentGradient = grads[i % grads.length];

      drawCircle(ctx, gloopx, gloopy, gloopRad, currentGradient);
    }
    ctx.restore();
    ctx.save();

    // Center Circle
    ctx.filter = "blur(24px)";
    drawCircle(
      ctx,
      centerX,
      centerY + centerOffset,
      centerRadius,
      "rgb(0, 0, 0)"
    );
    ctx.restore();
    ctx.save();

    ///////////////// GRID /////////////////

    // Mask under grid
    ctx.strokeStyle = "rgb(171, 171, 171)";
    ctx.lineWidth = 2;

    if (gridIsOn.current) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, centerY, canvas.width, canvas.height / 2);
      verticalLinesRef.current.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      });
      horizontalLinesRef.current.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      });
    }

    //////////////// Particles ////////////////

    // ctx.filter = "blur(2px)";

    // const particleRadius = mapRange(midFreqAvg, 0, 255, 5, 7);
    // const particleY = mapRange(midFreqAvg, 0, 255, -10, 10);

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
    //   ctx.fillStyle = `rgba(
    //     ${Math.random() * 255},
    //     ${Math.random() * 255},
    //     ${Math.random() * 255},
    //     ${particle.opacity})`;
    //   ctx.fill();
    // });
    // ctx.restore();
    // ctx.save();

    // Filters
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

    //////////////// Draw Bars /////////////////

    const maxBarHeight = window.innerHeight / 3;
    const barPadding = 24;
    const barWidth = canvas.width / bufferLengthRef.current - barPadding;
    let barHeight;
    let x = 0;

    if (barsIsOn.current) {
      for (let i = 0; i < bufferLengthRef.current; i++) {
        barHeight = mapExp(
          dataArrayRef.current[i],
          0,
          maxAmplitude.current,
          0,
          maxBarHeight
        );

        // Set bar color based on frequency range
        if (i < bufferLengthRef.current * 0.33) {
          ctx.fillStyle = `rgba(0, 255, 0, ${dataArrayRef.current[i] / 255})`;
        } else if (i < bufferLengthRef.current * 0.66) {
          ctx.fillStyle = `rgba(0, 255, 0, ${dataArrayRef.current[i] / 255})`;
        } else {
          ctx.fillStyle = `rgba(0, 255, 0, ${dataArrayRef.current[i] / 255})`;
        }
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + barPadding;
      }
    }
  };

  // Function to draw a circle
  const drawCircle = (context, x, y, radius, color) => {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
  };

  // Function to map range lineraly
  // const mapRange = (value, inMin, inMax, outMin, outMax) => {
  //   return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  // };

  // Function to map range exponentially
  function mapExp(value, inMin, inMax, outMin, outMax) {
    // Ensure the input range is valid
    if (inMin >= inMax || outMin >= outMax) {
      throw new Error(`Invalid range`);
    }
    // Clamp the input value to the input range
    value = Math.max(inMin, Math.min(value, inMax));
    // Normalize the input value to the range [0, 1]
    const normalized = (value - inMin) / (inMax - inMin);
    // Apply an exponential transformation
    const expValue = Math.pow(normalized, 3); // Adjust the exponent as needed
    // Map the transformed value to the output range
    return outMin + expValue * (outMax - outMin);
  }

  // Function to get the average of an array
  // const getAverageAmplitude = (array) => {
  //   const sum = array.reduce((a, b) => a + b, 0);
  //   return sum / array.length;
  // };

  // Function to find the max value of an array
  const findMaxValue = (arr) => {
    if (arr.length === 0) {
      return null;
    }

    let maxValue = arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > maxValue) {
        maxValue = arr[i];
      }
    }
    return maxValue;
  };

  // Function to find the median of an array
  // function findMedian(arr) {
  //   // Check if the array is empty
  //   if (arr.length === 0) {
  //     return null; // or throw an error if preferred
  //   }

  //   // Sort the array in ascending order
  //   arr.sort((a, b) => a - b);

  //   // Find the middle index
  //   const midIndex = Math.floor(arr.length / 2);

  //   // If the array has an odd length, return the middle element
  //   if (arr.length % 2 !== 0) {
  //     return arr[midIndex];
  //   } else {
  //     // If the array has an even length, return the average of the two middle elements
  //     return (arr[midIndex - 1] + arr[midIndex]) / 2;
  //   }
  // }

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        overflow: "hidden",
      }}>
      {/* <div
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          backgroundColor: "#010101",
          mixBlendMode: "color-burn",
          zIndex: "99",
        }}></div>
      <div
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          backgroundColor: "#a5a5a5",
          mixBlendMode: "color-dodge",
          zIndex: "98",
        }}></div> */}
      <audio ref={audioRef} style={{ display: "none" }}>
        <source src='/audio/op-z_9.mp3' type='audio/mp3' />
        Your browser does not support the audio element.
      </audio>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={
          {
            // position: "relative",
            // filter: "blur(16px)",
            // zIndex: "97",
          }
        }></canvas>
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
            : "Touch to start"}
        </div>
      )}
    </div>
  );
};

export default Visualizer;
