'use client';

import { motion } from 'framer-motion';
import React from 'react';

type Props = {
  children: React.ReactNode;
  delay?: number;     // delay trước khi bắt đầu stagger
  interval?: number;  // khoảng cách giữa các item
  className?: string;
};

export function StaggerContainer({ children, delay = 0, interval = 0.08, className }: Props) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: interval, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
      }}
    >
      {children}
    </motion.div>
  );
}
