import React, { useEffect, useRef, useCallback } from 'react';

const InteractiveDots = ({
  backgroundColor = '#1e1e1e', // Matched with --bg
  dotColor = '#c5a85c', // Matched with --gold-primary
  gridSpacing = 30,
  animationSpeed = 0.005,
  removeWaveLine = true,
}) => {
  const canvasRef = useRef(null);
  const timeRef = useRef(0);
  const animationFrameId = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, isDown: false });
  const ripples = useRef([]);
  const dotsRef = useRef([]);
  const dprRef = useRef(1);

  const getMouseInfluence = (x, y) => {
    const dx = x - mouseRef.current.x;
    const dy = y - mouseRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 150;
    return Math.max(0, 1 - distance / maxDistance);
  };

  const getRippleInfluence = (x, y, currentTime) => {
    let totalInfluence = 0;
    ripples.current.forEach((ripple) => {
      const age = currentTime - ripple.time;
      const maxAge = 3000;
      if (age < maxAge) {
        const dx = x - ripple.x;
        const dy = y - ripple.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const rippleRadius = (age / maxAge) * 300;
        const rippleWidth = 60;
        if (Math.abs(distance - rippleRadius) < rippleWidth) {
          const rippleStrength = (1 - age / maxAge) * ripple.intensity;
          const proximityToRipple =
            1 - Math.abs(distance - rippleRadius) / rippleWidth;
          totalInfluence += rippleStrength * proximityToRipple;
        }
      }
    });
    return Math.min(totalInfluence, 2);
  };

  const initializeDots = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const dots = [];
    for (let x = gridSpacing / 2; x < canvasWidth; x += gridSpacing) {
      for (let y = gridSpacing / 2; y < canvasHeight; y += gridSpacing) {
        dots.push({
          x,
          y,
          originalX: x,
          originalY: y,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
    dotsRef.current = dots;
  }, [gridSpacing]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    initializeDots();
  }, [initializeDots]);

  const handleMouseMove = useCallback((e) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.x = -1000;
    mouseRef.current.y = -1000;
  }, []);

  const handleMouseDown = useCallback((e) => {
    mouseRef.current.isDown = true;
    ripples.current.push({
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      intensity: 2,
    });
    const now = Date.now();
    ripples.current = ripples.current.filter(
      (ripple) => now - ripple.time < 3000
    );
  }, []);

  const handleMouseUp = useCallback(() => {
    mouseRef.current.isDown = false;
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    timeRef.current += animationSpeed;
    const currentTime = Date.now();
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    if (backgroundColor === 'transparent') {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    dotsRef.current.forEach((dot) => {
      const mouseInfluence = getMouseInfluence(dot.originalX, dot.originalY);
      const rippleInfluence = getRippleInfluence(
        dot.originalX,
        dot.originalY,
        currentTime
      );
      const totalInfluence = mouseInfluence + rippleInfluence;
      dot.x = dot.originalX;
      dot.y = dot.originalY;
      const baseDotSize = 2;
      const dotSize =
        baseDotSize +
        totalInfluence * 6 +
        Math.sin(timeRef.current + dot.phase) * 0.5;
      const opacity = Math.max(
        0.1, // lowered base opacity
        0.3 +
          totalInfluence * 0.4 +
          Math.abs(Math.sin(timeRef.current * 0.5 + dot.phase)) * 0.1
      );
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
      
      let red, green, blue;
      if (dotColor.startsWith('#')) {
        red = Number.parseInt(dotColor.slice(1, 3), 16);
        green = Number.parseInt(dotColor.slice(3, 5), 16);
        blue = Number.parseInt(dotColor.slice(5, 7), 16);
      } else {
        // default fallback to gold-primary
        red = 197; green = 168; blue = 92; 
      }
      
      ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
      ctx.fill();
    });
    
    if (!removeWaveLine) {
      ripples.current.forEach((ripple) => {
        const age = currentTime - ripple.time;
        const maxAge = 3000;
        if (age < maxAge) {
          const progress = age / maxAge;
          const radius = progress * 300;
          const alpha = (1 - progress) * 0.3 * ripple.intensity;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(100, 100, 100, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.arc(ripple.x, ripple.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
          const innerRadius = progress * 150;
          const innerAlpha = (1 - progress) * 0.2 * ripple.intensity;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(120, 120, 120, ${innerAlpha})`;
          ctx.lineWidth = 1;
          ctx.arc(ripple.x, ripple.y, innerRadius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      });
    }
    animationFrameId.current = requestAnimationFrame(animate);
  }, [backgroundColor, dotColor, removeWaveLine, animationSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    resizeCanvas();
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      timeRef.current = 0;
      ripples.current = [];
      dotsRef.current = [];
    };
  }, [animate, resizeCanvas, handleMouseMove, handleMouseLeave, handleMouseDown, handleMouseUp]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor, zIndex: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
};

export default InteractiveDots;
