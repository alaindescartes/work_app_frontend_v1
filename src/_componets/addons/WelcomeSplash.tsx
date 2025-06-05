// components/WelcomeSplash.tsx
'use client';

import { motion } from 'framer-motion';
import SplitText from '@/TextAnimations/SplitText/SplitText';

interface Props {
  userFirstName?: string;
  onDone?: () => void; // optional callback when both animations finish
}

export default function WelcomeSplash({ userFirstName, onDone }: Props) {
  const greeting = `Welcome back${userFirstName ? `, ${userFirstName}` : ''}!`;
  const prompt = 'Pick the home you’re working in today.';

  return (
    <div className="text-center space-y-4">
      {/* Span #1 – greeting with per‑letter animation */}
      <motion.span
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="block"
      >
        <SplitText
          text={greeting}
          className="text-2xl sm:text-3xl font-semibold text-white drop-shadow-lg"
          onLetterAnimationComplete={() => {
            document.getElementById('prompt-line')?.classList.remove('invisible');
          }}
        />
      </motion.span>

      {/* Span #2 – prompt, hidden until first finishes */}
      <motion.span
        id="prompt-line"
        className="block text-base sm:text-lg text-purple-100 invisible"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        onAnimationComplete={onDone}
      >
        {prompt}
      </motion.span>
    </div>
  );
}
