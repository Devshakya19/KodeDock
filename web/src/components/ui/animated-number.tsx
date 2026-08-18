"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1.5,
  prefix = "",
  decimals = 0,
  className = "",
}: AnimatedNumberProps) {
  // We only start the animation after mount to ensure it happens on client-side correctly.
  const [mounted, setMounted] = useState(false);

  // useSpring handles the tweening of a raw number
  const springValue = useSpring(0, {
    bounce: 0,
    duration: duration * 1000,
  });

  useEffect(() => {
    setMounted(true);
    springValue.set(value);
  }, [value, springValue]);

  // Format the raw animated number to a locale string
  const displayValue = useTransform(springValue, (current) => {
    if (!mounted) {
      return `${prefix}${(0).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;
    }
    
    return `${prefix}${current.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  });

  return (
    <motion.span className={className}>
      {mounted ? displayValue : `${prefix}${(value).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`}
    </motion.span>
  );
}
