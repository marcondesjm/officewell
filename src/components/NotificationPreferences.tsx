import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  BellOff, 
  Droplets, 
  Eye, 
  Activity,
  Sun,
  Clock,
  Save,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationPreference {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreference[] = [
  {
    type: 'water',
    label: 'Lembrete de Água',
    description: 'Receba lembretes para se hidratar',
    icon: <Droplets className="w-5 h-5 text-blue-500" />,
    enabled: true
  },
  {
    type: 'eye',
    label: 'Descanso Visual',
    description: 'Lembretes para descansar os olhos',
    icon: <Eye className="w-5 h-5 text-purple-500" />,
    enabled: true
  },
  {
    type: 'stretch',
    label: 'Alongamento',
    description: 'Hora de se alongar e movimentar',
    icon: <Activity className="w-5 h-5 text-green-500" />,
    enabled: true
  },
  {
    type: 'daily_greeting',
    label: 'Bom Dia',
    description: 'Mensagem motivacional ao iniciar o dia',
    icon: <Sun className="w-5 h-5 text-yellow-500" />,
    enabled: true
  },
  {
    type: 'end_of_day',
    label: 'Fim do Expediente',
    description: 'Lembrete ao término do horário de trabalho',
    icon: <Clock className="w-5 h-5 text-orange-500" />,
    enabled: true
  }
];

// Função para obter session_id
function getSessionId(): string {
  let sessionId = localStorage.getItem('officewell_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('officewell_session_id', sessionId);
  }
  return sessionId;
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>(DEFAULT_PREFERENCES);
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Carregar preferências do banco
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        const sessionId = getSessionId();
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('session_id', sessionId);

        if (error) throw error;

        if (data && data.length > 0) {
          // Verificar master toggle
          const masterPref = data.find(p => p.notification_type === 'master');
          if (masterPref) {
            setMasterEnabled(masterPref.is_enabled);
          }

          // Atualizar preferências individuais
          setPreferences(prev => prev.map(pref => {
            const savedPref = data.find(p => p.notification_type === pref.type);
            return savedPref ? { ...pref, enabled: savedPref.is_enabled } : pref;
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar preferências:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Toggle preferência individual
  const togglePreference = (type: string) => {
    setPreferences(prev => prev.map(pref => 
      pref.type === type ? { ...pref, enabled: !pref.enabled } : pref
    ));
    setHasChanges(true);
  };

  // Toggle master
  const toggleMaster = () => {
    const newValue = !masterEnabled;
    setMasterEnabled(newValue);
    
    // Se desabilitando master, desabilitar todos
    if (!newValue) {
      setPreferences(prev => prev.map(pref => ({ ...pref, enabled: false })));
    } else {
      // Se habilitando, restaurar valores padrão
      setPreferences(DEFAULT_PREFERENCES);
    }
    setHasChanges(true);
  };

  // Salvar preferências
  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const sessionId = getSessionId();
      
      // Preparar dados para upsert
      const prefsToSave = [
        { 
          session_id: sessionId, 
          notification_type: 'master', 
          is_enabled: masterEnabled,
          updated_at: new Date().toISOString()
        },
        ...preferences.map(pref => ({
          session_id: sessionId,
          notification_type: pref.type,
          is_enabled: pref.enabled,
          updated_at: new Date().toISOString()
        }))
      ];

      const { error } = await supabase
        .from('notification_preferences')
        .upsert(prefsToSave, { 
          onConflict: 'session_id,notification_type' 
        });

      if (error) throw error;

      setHasChanges(false);
      toast.success('Preferências salvas!');
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast.error('Erro ao salvar preferências');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Preferências de Notificação
            </CardTitle>
            <CardDescription>
              Escolha quais lembretes deseja receber
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {masterEnabled ? (
              <Bell className="w-5 h-5 text-primary" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
            <Switch 
              checked={masterEnabled} 
              onCheckedChange={toggleMaster}
              aria-label="Ativar todas as notificações"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de preferências */}
        <div className={`space-y-3 ${!masterEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          {preferences.map((pref) => (
            <div 
              key={pref.type}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background">
                  {pref.icon}
                </div>
                <div>
                  <Label htmlFor={pref.type} className="font-medium cursor-pointer">
                    {pref.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {pref.description}
                  </p>
                </div>
              </div>
              <Switch 
                id={pref.type}
                checked={pref.enabled}
                onCheckedChange={() => togglePreference(pref.type)}
                disabled={!masterEnabled}
              />
            </div>
          ))}
        </div>

        {/* Botão salvar */}
        {hasChanges && (
          <Button 
            onClick={savePreferences} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Preferências
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
