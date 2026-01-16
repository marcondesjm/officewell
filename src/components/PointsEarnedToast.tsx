import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Flame } from "lucide-react";

interface PointsEarnedToastProps {
  points: number;
  activityName: string;
  streakBonus?: number;
  onClose: () => void;
}

export const PointsEarnedToast = ({ 
  points, 
  activityName, 
  streakBonus = 0,
  onClose 
}: PointsEarnedToastProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Star className="h-6 w-6 fill-white" />
            </motion.div>
            
            <div>
              <p className="font-bold text-lg">
                +{points} pontos!
              </p>
              <p className="text-xs opacity-90">
                {activityName}
                {streakBonus > 0 && (
                  <span className="ml-1 inline-flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    +{streakBonus} bônus
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook to manage toast display
export const usePointsToast = () => {
  const [toastData, setToastData] = useState<{
    points: number;
    activityName: string;
    streakBonus?: number;
  } | null>(null);

  const showPointsToast = (points: number, activityName: string, streakBonus?: number) => {
    setToastData({ points, activityName, streakBonus });
  };

  const closeToast = () => {
    setToastData(null);
  };

  const ToastComponent = toastData ? (
    <PointsEarnedToast
      points={toastData.points}
      activityName={toastData.activityName}
      streakBonus={toastData.streakBonus}
      onClose={closeToast}
    />
  ) : null;

  return { showPointsToast, ToastComponent };
};