import { AlertTriangle, TrendingDown, Flame, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { InactivityInfo, Rank } from "@/hooks/useGamification";

interface InactivityWarningProps {
  info: InactivityInfo;
  onDismiss: () => void;
}

export const InactivityWarning = ({ info, onDismiss }: InactivityWarningProps) => {
  if (!info.wasInactive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <Card className="relative overflow-hidden border-2 border-red-500/50 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10">
          {/* Animated background */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5"
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="relative p-4 md:p-6">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Icon */}
              <motion.div 
                className="p-3 rounded-full bg-red-500/20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </motion.div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Você ficou {info.daysInactive} {info.daysInactive === 1 ? 'dia' : 'dias'} sem abrir o app!
                </h3>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span>
                      Você perdeu <strong className="text-red-500">{info.pointsLost} pontos</strong> por inatividade
                    </span>
                  </p>
                  
                  {info.rankDropped && info.previousRank && (
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      ⚠️ Você caiu de rank: {info.previousRank.icon} {info.previousRank.name} → {info.currentRank.icon} {info.currentRank.name}
                    </p>
                  )}
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    💡 <strong>Dica:</strong> Mantenha o app aberto diariamente para ganhar bônus e evitar perder pontos!
                  </p>
                </div>
              </div>
            </div>

            {/* Warning Footer */}
            <div className="mt-4 pt-3 border-t border-red-500/20">
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                  ✓ Bônus diário: +5 pontos por abrir o app
                </span>
                <span className="flex items-center gap-1 bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                  ✗ Penalidade: -15 pontos por dia inativo
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-4 flex justify-center">
              <Button 
                onClick={onDismiss}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                Entendi! Vou usar mais o app 💪
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
