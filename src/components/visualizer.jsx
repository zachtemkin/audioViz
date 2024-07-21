import React, { useRef, useEffect, useState } from "react";

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
    analyserRef.current.fftSize = 2048;
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
    const maxBarHeight = window.innerHeight - 50;
    const scalingFactor = maxBarHeight / 255;

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // const barWidth = canvas.width / bufferLengthRef.current - 1;
    let barHeight;
    // let x = 0;

    for (let i = 0; i < bufferLengthRef.current; i++) {
      barHeight = dataArrayRef.current[i] * scalingFactor;

      // Set bar color based on frequency range
      if (i < bufferLengthRef.current * 0.33) {
        ctx.fillStyle = `rgb(
            ${barHeight / scalingFactor + 100},
            0,
            0
        )`;
      } else if (i < bufferLengthRef.current * 0.66) {
        ctx.fillStyle = `rgb(
            0, 
            ${barHeight / scalingFactor + 100}, 
            0
        )`;
      } else {
        ctx.fillStyle = `rgb(
            0,
            0,
            ${barHeight / scalingFactor + 100}
        )`;
      }
      //   ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
      //   x += barWidth + 1;
    }

    // Calculate average amplitude for low, mid, and high frequencies
    const lowFreqAvg = getAverageAmplitude(
      dataArrayRef.current.slice(0, bufferLengthRef.current * 0.33)
    );
    const midFreqAvg = getAverageAmplitude(
      dataArrayRef.current.slice(
        bufferLengthRef.current * 0.33,
        bufferLengthRef.current * 0.66
      )
    );
    const highFreqAvg = getAverageAmplitude(
      dataArrayRef.current.slice(
        bufferLengthRef.current * 0.66,
        bufferLengthRef.current
      )
    );

    // Calculate circle positions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = (canvas.height - 150) / 2;
    const distanceFactor = 0.5;

    const lowCircleX = centerX + lowFreqAvg * distanceFactor;
    const lowCircleY = centerY - lowFreqAvg * distanceFactor;
    const midCircleX = centerX - midFreqAvg * distanceFactor;
    const midCircleY = centerY - midFreqAvg * distanceFactor;
    const highCircleX = centerX;
    const highCircleY = centerY + highFreqAvg * distanceFactor;

    // Map average amplitude to opacity
    const lowOpacity = mapRange(lowFreqAvg, 0, 255, 0.75, 1);
    const midOpacity = mapRange(midFreqAvg, 0, 255, 0.75, 1);
    const highOpacity = mapRange(highFreqAvg, 0, 255, 0.75, 1);

    // Draw circles
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    drawCircle(
      ctx,
      lowCircleX,
      lowCircleY,
      radius,
      `rgba(255, 0, 0, ${lowOpacity})`
    );
    drawCircle(
      ctx,
      midCircleX,
      midCircleY,
      radius,
      `rgba(0, 255, 0, ${midOpacity})`
    );
    drawCircle(
      ctx,
      highCircleX,
      highCircleY,
      radius,
      `rgba(0, 0, 255, ${highOpacity})`
    );
    ctx.restore();
  };

  const mapRange = (value, inMin, inMax, outMin, outMax) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };

  const getAverageAmplitude = (array) => {
    const sum = array.reduce((a, b) => a + b, 0);
    return sum / array.length;
  };

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
