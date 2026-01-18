import { useParallax } from '@/hooks/useParallax';
import { motion, useSpring } from 'framer-motion';

const ParallaxBackground = () => {
  const { offsetY, mouseX, mouseY } = useParallax(0.3);
  
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 30 });
  const smoothOffsetY = useSpring(offsetY, { stiffness: 100, damping: 30 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-10]">
      {/* Primary gradient orb - top left */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          top: '5%',
          left: '10%',
          background: 'radial-gradient(circle, hsl(220 90% 65% / 0.2) 0%, hsl(220 90% 65% / 0) 70%)',
          filter: 'blur(60px)',
          x: smoothMouseX,
          y: smoothOffsetY,
        }}
      />
      
      {/* Secondary gradient orb - top right */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          top: '15%',
          right: '5%',
          background: 'radial-gradient(circle, hsl(280 70% 60% / 0.18) 0%, hsl(280 70% 60% / 0) 70%)',
          filter: 'blur(50px)',
          x: smoothMouseX,
          y: smoothOffsetY,
          scale: 1.1,
        }}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Accent orb - bottom left */}
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full"
        style={{
          bottom: '10%',
          left: '5%',
          background: 'radial-gradient(circle, hsl(160 70% 50% / 0.15) 0%, hsl(160 70% 50% / 0) 70%)',
          filter: 'blur(45px)',
          x: smoothMouseX,
          y: smoothOffsetY,
        }}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      
      {/* Small floating orb - center right */}
      <motion.div
        className="absolute w-[200px] h-[200px] rounded-full"
        style={{
          top: '45%',
          right: '15%',
          background: 'radial-gradient(circle, hsl(220 90% 70% / 0.12) 0%, hsl(220 90% 70% / 0) 70%)',
          filter: 'blur(35px)',
          x: smoothMouseX,
          y: smoothOffsetY,
        }}
        initial={{ y: 0 }}
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Bottom gradient orb */}
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full"
        style={{
          bottom: '5%',
          right: '20%',
          background: 'radial-gradient(circle, hsl(250 70% 55% / 0.14) 0%, hsl(250 70% 55% / 0) 70%)',
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
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 100% 100% at 0% 0%, hsl(220 90% 65% / 0.05) 0%, transparent 50%),
            radial-gradient(ellipse 100% 100% at 100% 100%, hsl(280 70% 60% / 0.04) 0%, transparent 50%)
          `,
        }}
      />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
};

export default ParallaxBackground;
