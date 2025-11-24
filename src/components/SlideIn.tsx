'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import React from 'react';

type Direction = 'left' | 'right';
type Props = {
  children: React.ReactNode;
  delay?: number;
  dir?: Direction;
  className?: string;
  offset?: number; // px
};

export default function SlideIn({ children, delay = 0, dir = 'left', className, offset = 60 }: Props) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const x = dir === 'left' ? -offset : offset;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}
