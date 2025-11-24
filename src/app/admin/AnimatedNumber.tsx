"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnimatedNumber({
  value,
  duration = 0.15, 
  direction = "up",
  hoverEffect = true,
}: {
  value: number;
  duration?: number;
  direction?: "up" | "down";
  hoverEffect?: boolean;
}) {
  const formatValue = (num: number) => num.toLocaleString("en-US");
  const [digits, setDigits] = useState<string[]>(formatValue(value).split(""));

  const animateDigitsSequentially = async (
    targetDigits: string[],
    delayPerDigit: number
  ) => {
    for (let idx = targetDigits.length - 1; idx >= 0; idx--) {
      if (targetDigits[idx] === ",") continue;

      await new Promise<void>((resolve) => {
        let count = 0;
        const interval = setInterval(() => {
          setDigits((prev) => {
            const copy = [...prev];
            copy[idx] = Math.floor(Math.random() * 10).toString();
            return copy;
          });
          count++;
          if (count >= 4) { 
            clearInterval(interval);
            setDigits((prev) => {
              const copy = [...prev];
              copy[idx] = targetDigits[idx];
              return copy;
            });
            resolve();
          }
        }, 60); 
      });
      
      await new Promise((res) => setTimeout(res, delayPerDigit));
    }
  };

  const runAnimation = () => {
    const finalDigits = formatValue(value).split("");
    const zeros = finalDigits.map((char) => (char === "," ? "," : "0"));

    setDigits(zeros); 
    setTimeout(() => {
      animateDigitsSequentially(finalDigits, 80); 
    }, 120);
  };

  useEffect(() => {
    runAnimation();
  }, [value]);

  return (
    <span
      className="flex text-base lg:text-2xl font-bold cursor-pointer select-none"
      onMouseEnter={() => hoverEffect && runAnimation()}
    >
      {digits.map((digit, i) => (
        <AnimatePresence mode="popLayout" key={i}>
          <motion.span
            key={`${i}-${digit}`}
            initial={{ y: direction === "up" ? 20 : -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: direction === "up" ? -20 : 20, opacity: 0 }}
            transition={{ duration }}
            className={`inline-block text-center ${
              digit === "," ? "w-[0.5ch]" : "w-[1ch]"
            }`}
          >
            {digit}
          </motion.span>
        </AnimatePresence>
      ))}
    </span>
  );
}
