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
    
    // If not on enterprise trial, start one
    if (!isOnTrial || planId !== 'enterprise') {
      startTrial('enterprise', 'Empresarial', 7);
      toast.success('🎉 Conta Demo ativada! Todas as funcionalidades liberadas por 7 dias.', {
        duration: 5000,
      });
    }
    
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
