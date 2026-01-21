import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { toast } from 'sonner';

const Demo = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startTrial, isOnTrial, planId } = useTrialStatus();
  
  useEffect(() => {
    const redirectTo = searchParams.get('redirect') || '/';
    
    // Always reset demo state for fresh experience
    localStorage.removeItem('officewell_tour_completed');
    localStorage.removeItem('officewell_water_count');
    localStorage.removeItem('officewell_stretch_count');
    localStorage.removeItem('officewell_eye_count');
    localStorage.removeItem('officewell_points');
    localStorage.removeItem('officewell_daily_goal');
    localStorage.removeItem('officewell_mood_today');
    localStorage.removeItem('officewell_last_report_date');
    sessionStorage.setItem('officewell_new_demo', 'true');
    
    // Always start fresh enterprise trial
    startTrial('enterprise', 'Empresarial', 7);
    toast.success('🎉 Conta Demo ativada! Painel resetado com todas as funcionalidades por 7 dias.', {
      duration: 5000,
    });
    
    // Redirect to the requested page or home
    navigate(redirectTo, { replace: true });
  }, [navigate, searchParams, startTrial, isOnTrial, planId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Ativando conta demo...</p>
      </div>
    </div>
  );
};

export default Demo;
