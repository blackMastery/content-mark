"use client";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef, type ReactNode } from "react";
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 1, y: 0 }}
      whileInView={reduced ? {} : { y: [18, 0], opacity: [0.3, 1] }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function HeroLine({
  children,
  delay,
  className = "",
}: {
  children: ReactNode;
  delay: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <span className="line-mask">
      <motion.span
        className={className}
        initial={false}
        animate={reduced ? {} : { y: ["105%", "0%"] }}
        transition={{ delay, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}
export function HeroComposition({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 45]);
  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className="hero-composition"
      style={reduced ? undefined : { y }}
      initial={false}
      animate={reduced ? {} : { opacity: [0, 1], scale: [0.96, 1] }}
      transition={{ delay: 0.45, duration: 1 }}
    >
      {children}
    </motion.div>
  );
}
