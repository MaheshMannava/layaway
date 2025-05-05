"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Define passport size (adjust as needed)
const IMAGE_WIDTH_PX = 100;
const IMAGE_HEIGHT_PX = 200;

// Define props interface
interface FloatingCopiumProps {
  imageSrc: string;
  initialDelay?: number; // Optional delay to stagger animations
}

export function FloatingCopium({ imageSrc, initialDelay = 0 }: FloatingCopiumProps) {
  // Destructure props
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });

  // Get viewport size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize(); // Initial size
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Set initial random position once viewport size is known
  useEffect(() => {
    if (viewportSize.width > 0 && viewportSize.height > 0) {
      const maxX = viewportSize.width - IMAGE_WIDTH_PX;
      const maxY = viewportSize.height - IMAGE_HEIGHT_PX;
      setInitialPosition({ x: Math.random() * maxX, y: Math.random() * maxY });
    }
  }, [viewportSize]);

  if (!viewportSize.width || !viewportSize.height) {
    // Avoid rendering until viewport size is known
    return null;
  }

  // Ensure image stays within viewport boundaries
  const maxX = viewportSize.width - IMAGE_WIDTH_PX;
  const maxY = viewportSize.height - IMAGE_HEIGHT_PX;

  return (
    <motion.div
      style={{
        position: "fixed",
        zIndex: 9999, // Ensure it's above other content
        pointerEvents: "none", // Prevent interaction
        width: `${IMAGE_WIDTH_PX}px`,
        height: `${IMAGE_HEIGHT_PX}px`,
      }}
      initial={initialPosition} // Use state for initial position
      animate={{
        x: [
          Math.random() * maxX,
          Math.random() * maxX,
          Math.random() * maxX,
          Math.random() * maxX,
          Math.random() * maxX,
        ],
        y: [
          Math.random() * maxY,
          Math.random() * maxY,
          Math.random() * maxY,
          Math.random() * maxY,
          Math.random() * maxY,
        ],
      }}
      transition={{
        delay: initialDelay, // Apply initial delay
        duration: 40 + Math.random() * 10, // Add slight random variation to duration
        ease: "linear",
        repeat: Infinity,
        repeatType: "mirror",
      }}
    >
      <Image
        src={imageSrc} // Use the imageSrc prop
        alt="Floating Image"
        width={IMAGE_WIDTH_PX}
        height={IMAGE_HEIGHT_PX}
        style={{ display: "block" }}
      />
    </motion.div>
  );
}
