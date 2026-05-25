import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

/** Smoothly animates numeric stat changes (spec: 0.3–0.5s ease-out) */
export default function AnimatedNumber({ value, decimals = 0, suffix = '', className, style }) {
  const spring = useSpring(value, { stiffness: 90, damping: 20, mass: 0.6 });
  const display = useTransform(spring, (v) => {
    const n = decimals > 0 ? v.toFixed(decimals) : Math.round(v);
    return `${n}${suffix}`;
  });
  const [text, setText] = useState(String(value));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsub = display.on('change', (v) => setText(v));
    return () => unsub();
  }, [display]);

  return (
    <motion.span className={className} style={style} key={text}>
      {text}
    </motion.span>
  );
}
