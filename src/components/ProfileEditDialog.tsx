import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, User, Dumbbell, Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExerciseType = 'none' | 'light' | 'moderate' | 'intense';

const exerciseLabels: Record<ExerciseType, { label: string; description: string; emoji: string }> = {
  none: { label: 'Não pratico', description: 'Sedentário', emoji: '🪑' },
  light: { label: 'Leve', description: '1-2 horas/semana', emoji: '🚶' },
  moderate: { label: 'Moderado', description: '3-5 horas/semana', emoji: '🏃' },
  intense: { label: 'Intenso', description: '6+ horas/semana', emoji: '💪' },
};

// Pre-configured avatars
const defaultAvatars = [
  { id: 'avatar-1', emoji: '👤', bg: 'from-blue-500 to-cyan-500' },
  { id: 'avatar-2', emoji: '👨‍💼', bg: 'from-violet-500 to-purple-500' },
  { id: 'avatar-3', emoji: '👩‍💼', bg: 'from-pink-500 to-rose-500' },
  { id: 'avatar-4', emoji: '🧑‍💻', bg: 'from-green-500 to-emerald-500' },
  { id: 'avatar-5', emoji: '👨‍🔬', bg: 'from-amber-500 to-orange-500' },
  { id: 'avatar-6', emoji: '👩‍🔬', bg: 'from-red-500 to-pink-500' },
  { id: 'avatar-7', emoji: '🦸', bg: 'from-indigo-500 to-blue-500' },
  { id: 'avatar-8', emoji: '🧘', bg: 'from-teal-500 to-cyan-500' },
];

export function ProfileEditDialog({ open, onOpenChange }: ProfileEditDialogProps) {
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [age, setAge] = useState<number | ''>(profile?.age || '');
  const [exerciseType, setExerciseType] = useState<ExerciseType>(profile?.exercise_type || 'none');
  const [exerciseHours, setExerciseHours] = useState<number>(profile?.exercise_hours_per_week || 0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [selectedDefaultAvatar, setSelectedDefaultAvatar] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && profile) {
      setDisplayName(profile.display_name);
      setAge(profile.age || '');
      setExerciseType(profile.exercise_type || 'none');
      setExerciseHours(profile.exercise_hours_per_week || 0);
      setAvatarUrl(profile.avatar_url);
      setSelectedDefaultAvatar(null);
    }
    onOpenChange(newOpen);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      setSelectedDefaultAvatar(null);
      toast.success('Foto carregada com sucesso!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Erro ao carregar foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDefaultAvatarSelect = (avatarId: string) => {
    setSelectedDefaultAvatar(avatarId);
    setAvatarUrl(null);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const updates: Record<string, unknown> = {
        display_name: displayName.trim() || profile?.display_name,
        age: age === '' ? null : Number(age),
        exercise_type: exerciseType,
        exercise_hours_per_week: exerciseHours,
        updated_at: new Date().toISOString(),
      };

      // Handle avatar
      if (selectedDefaultAvatar) {
        updates.avatar_url = `default:${selectedDefaultAvatar}`;
      } else if (avatarUrl !== profile?.avatar_url) {
        updates.avatar_url = avatarUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Perfil atualizado com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatar = profile?.avatar_url;
  const isDefaultAvatar = currentAvatar?.startsWith('default:');
  const currentDefaultAvatarId = isDefaultAvatar ? currentAvatar.replace('default:', '') : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Perfil
          </DialogTitle>
          <DialogDescription>
            Configure suas informações pessoais
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Foto de Perfil</Label>
            
            {/* Current Avatar Preview */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {selectedDefaultAvatar ? (
                  <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${defaultAvatars.find(a => a.id === selectedDefaultAvatar)?.bg} flex items-center justify-center text-4xl`}>
                    {defaultAvatars.find(a => a.id === selectedDefaultAvatar)?.emoji}
                  </div>
                ) : avatarUrl ? (
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-2xl">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : currentDefaultAvatarId ? (
                  <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${defaultAvatars.find(a => a.id === currentDefaultAvatarId)?.bg} flex items-center justify-center text-4xl`}>
                    {defaultAvatars.find(a => a.id === currentDefaultAvatarId)?.emoji}
                  </div>
                ) : (
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Carregar Foto
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Default Avatars Grid */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Ou escolha um avatar:</Label>
              <div className="grid grid-cols-4 gap-2">
                {defaultAvatars.map((avatar) => (
                  <motion.button
                    key={avatar.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDefaultAvatarSelect(avatar.id)}
                    className={`h-12 w-12 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-xl transition-all ${
                      selectedDefaultAvatar === avatar.id || currentDefaultAvatarId === avatar.id
                        ? 'ring-2 ring-offset-2 ring-primary ring-offset-background'
                        : 'hover:ring-2 hover:ring-muted'
                    }`}
                  >
                    {avatar.emoji}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Nome</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age">Idade</Label>
            <Input
              id="age"
              type="number"
              min={10}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Sua idade"
            />
          </div>

          {/* Exercise Type */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Pratica Exercícios?
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(exerciseLabels) as [ExerciseType, typeof exerciseLabels[ExerciseType]][]).map(([type, info]) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExerciseType(type)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    exerciseType === type
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{info.emoji}</span>
                    <div>
                      <p className="text-sm font-medium">{info.label}</p>
                      <p className="text-[10px] text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Exercise Hours (only show if exercising) */}
          <AnimatePresence>
            {exerciseType !== 'none' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Label>Horas por semana</Label>
                  <span className="text-sm font-semibold text-primary">{exerciseHours}h</span>
                </div>
                <Slider
                  value={[exerciseHours]}
                  onValueChange={(value) => setExerciseHours(value[0])}
                  max={20}
                  step={0.5}
                  className="py-2"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0h</span>
                  <span>20h+</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full gradient-primary"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}