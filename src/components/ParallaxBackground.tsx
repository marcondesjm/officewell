import { useParallax } from '@/hooks/useParallax';
import { motion, useSpring } from 'framer-motion';

const ParallaxBackground = () => {
  const { offsetY, mouseX, mouseY } = useParallax(0.3);
  
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 30 });
  const smoothOffsetY = useSpring(offsetY, { stiffness: 100, damping: 30 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-10]">
      {/* Primary gradient orb - Corporate Blue - top left */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          top: '5%',
          left: '10%',
          background: 'radial-gradient(circle, hsl(217 91% 60% / 0.18) 0%, hsl(217 91% 60% / 0) 70%)',
          filter: 'blur(60px)',
          x: smoothMouseX,
          y: smoothOffsetY,
        }}
      />
      
      {/* Secondary gradient orb - Wellness Teal - top right */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          top: '15%',
          right: '5%',
          background: 'radial-gradient(circle, hsl(173 80% 45% / 0.15) 0%, hsl(173 80% 45% / 0) 70%)',
          filter: 'blur(50px)',
          x: smoothMouseX,
          y: smoothOffsetY,
          scale: 1.1,
        }}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Accent orb - Coral Orange - bottom left */}
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full"
        style={{
          bottom: '10%',
          left: '5%',
          background: 'radial-gradient(circle, hsl(24 95% 55% / 0.12) 0%, hsl(24 95% 55% / 0) 70%)',
          filter: 'blur(45px)',
          x: smoothMouseX,
          y: smoothOffsetY,
        }}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      
      {/* Success orb - Emerald Green - center right */}
      <motion.div
        className="absolute w-[200px] h-[200px] rounded-full"
        style={{
          top: '45%',
          right: '15%',
          background: 'radial-gradient(circle, hsl(160 84% 42% / 0.10) 0%, hsl(160 84% 42% / 0) 70%)',
          filter: 'blur(35px)',
          x: smoothMouseX,
          y: smoothOffsetY,
        }}
        initial={{ y: 0 }}
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Primary secondary blend - bottom right */}
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full"
        style={{
          bottom: '5%',
          right: '20%',
          background: 'radial-gradient(circle, hsl(217 91% 55% / 0.10) 0%, hsl(173 80% 45% / 0.05) 50%, transparent 70%)',
          filter: 'blur(55px)',
          x: smoothMouseX,
          y: smoothOffsetY,
        }}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
      
      {/* Subtle mesh gradient overlay */}
      <div 
        className="absolute inset-0 opacity-25"
        style={{
          background: `
            radial-gradient(ellipse 100% 100% at 0% 0%, hsl(217 91% 60% / 0.04) 0%, transparent 50%),
            radial-gradient(ellipse 100% 100% at 100% 100%, hsl(173 80% 45% / 0.03) 0%, transparent 50%)
          `,
        }}
      />
      
      {/* Subtle dot pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
};

export default ParallaxBackground;
