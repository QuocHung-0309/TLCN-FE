'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

type Props = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export default function FadeInWhenVisible({ children, delay = 0, className }: Props) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}
