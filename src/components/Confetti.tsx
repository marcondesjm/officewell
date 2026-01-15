import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
}

const colors = [
  "bg-red-500",
  "bg-yellow-500", 
  "bg-green-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
];

const Confetti = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
      });
    }
    setPieces(newPieces);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={`absolute rounded-sm ${piece.color} opacity-80`}
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            animation: `confetti-fall ${piece.duration}s ease-in-out ${piece.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(500px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Confetti;
