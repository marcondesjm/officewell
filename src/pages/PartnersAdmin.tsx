import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  Eye, 
  MousePointerClick,
  Building2,
  ShoppingBag,
  Utensils,
  Car,
  Briefcase,
  Heart,
  Zap,
  Star,
  Rocket,
  Gift,
  Coffee,
  Music,
  Camera,
  Gamepad2,
  Palette,
  GraduationCap,
  Plane,
  Sparkles,
  ChevronUp,
  ChevronDown,
  BarChart3
} from "lucide-react";

// Icon mapping for dynamic icons
const iconMap: Record<string, React.ElementType> = {
  "building-2": Building2,
  "shopping-bag": ShoppingBag,
  "utensils": Utensils,
  "car": Car,
  "briefcase": Briefcase,
  "heart": Heart,
  "zap": Zap,
  "star": Star,
  "rocket": Rocket,
  "gift": Gift,
  "coffee": Coffee,
  "music": Music,
  "camera": Camera,
  "gamepad-2": Gamepad2,
  "palette": Palette,
  "graduation-cap": GraduationCap,
  "plane": Plane,
};

// Color themes for quick selection
const colorThemes = [
  { 
    name: "Índigo/Violeta", 
    gradient: "from-indigo-600/20 via-violet-600/20 to-purple-600/20",
    borderColor: "border-indigo-500/30",
    iconBg: "from-indigo-500 to-violet-600",
    buttonGradient: "from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500",
    shadowColor: "shadow-violet-500/25",
    textGradient: "from-indigo-400 to-violet-400"
  },
  { 
    name: "Esmeralda/Verde", 
    gradient: "from-emerald-600/20 via-green-600/20 to-teal-600/20",
    borderColor: "border-emerald-500/30",
    iconBg: "from-emerald-500 to-green-600",
    buttonGradient: "from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500",
    shadowColor: "shadow-emerald-500/25",
    textGradient: "from-emerald-400 to-green-400"
  },
  { 
    name: "Laranja/Âmbar", 
    gradient: "from-orange-600/20 via-amber-600/20 to-yellow-600/20",
    borderColor: "border-orange-500/30",
    iconBg: "from-orange-500 to-amber-600",
    buttonGradient: "from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500",
    shadowColor: "shadow-orange-500/25",
    textGradient: "from-orange-400 to-amber-400"
  },
  { 
    name: "Azul/Ciano", 
    gradient: "from-blue-600/20 via-cyan-600/20 to-sky-600/20",
    borderColor: "border-blue-500/30",
    iconBg: "from-blue-500 to-cyan-600",
    buttonGradient: "from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500",
    shadowColor: "shadow-blue-500/25",
    textGradient: "from-blue-400 to-cyan-400"
  },
  { 
    name: "Rosa/Pink", 
    gradient: "from-rose-600/20 via-pink-600/20 to-fuchsia-600/20",
    borderColor: "border-rose-500/30",
    iconBg: "from-rose-500 to-pink-600",
    buttonGradient: "from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500",
    shadowColor: "shadow-rose-500/25",
    textGradient: "from-rose-400 to-pink-400"
  },
  { 
    name: "Roxo/Violeta", 
    gradient: "from-purple-600/20 via-violet-600/20 to-indigo-600/20",
    borderColor: "border-purple-500/30",
    iconBg: "from-purple-500 to-violet-600",
    buttonGradient: "from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500",
    shadowColor: "shadow-purple-500/25",
    textGradient: "from-purple-400 to-violet-400"
  },
];

interface Partner {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  gradient: string;
  border_color: string;
  icon_bg: string;
  button_gradient: string;
  shadow_color: string;
  text_gradient: string;
  badge: string | null;
  is_active: boolean;
  display_order: number;
  clicks: number;
  impressions: number;
  created_at: string;
}

const emptyPartner = {
  name: "",
  description: "",
  url: "",
  icon: "building-2",
  badge: "",
  is_active: true,
  display_order: 0,
  ...colorThemes[0]
};

const PartnersAdmin = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState(emptyPartner);
  const [selectedTheme, setSelectedTheme] = useState(0);

  // Fetch partners (including inactive for admin)
  const fetchPartners = async () => {
    setLoading(true);
    try {
      // Use RPC or direct query with service role for admin view
      // For now, we'll modify the query to show all
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast.error("Erro ao carregar parceiros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleOpenCreate = () => {
    setSelectedPartner(null);
    setFormData({
      ...emptyPartner,
      display_order: partners.length + 1
    });
    setSelectedTheme(0);
    setDialogOpen(true);
  };

  const handleOpenEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setFormData({
      name: partner.name,
      description: partner.description,
      url: partner.url,
      icon: partner.icon,
      badge: partner.badge || "",
      is_active: partner.is_active,
      display_order: partner.display_order,
      gradient: partner.gradient,
      borderColor: partner.border_color,
      iconBg: partner.icon_bg,
      buttonGradient: partner.button_gradient,
      shadowColor: partner.shadow_color,
      textGradient: partner.text_gradient
    });
    // Find matching theme
    const themeIndex = colorThemes.findIndex(t => t.gradient === partner.gradient);
    setSelectedTheme(themeIndex >= 0 ? themeIndex : 0);
    setDialogOpen(true);
  };

  const handleThemeChange = (index: number) => {
    setSelectedTheme(index);
    const theme = colorThemes[index];
    setFormData(prev => ({
      ...prev,
      gradient: theme.gradient,
      borderColor: theme.borderColor,
      iconBg: theme.iconBg,
      buttonGradient: theme.buttonGradient,
      shadowColor: theme.shadowColor,
      textGradient: theme.textGradient
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.url) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const partnerData = {
        name: formData.name,
        description: formData.description,
        url: formData.url,
        icon: formData.icon,
        badge: formData.badge || null,
        is_active: formData.is_active,
        display_order: formData.display_order,
        gradient: formData.gradient,
        border_color: formData.borderColor,
        icon_bg: formData.iconBg,
        button_gradient: formData.buttonGradient,
        shadow_color: formData.shadowColor,
        text_gradient: formData.textGradient
      };

      if (selectedPartner) {
        // Update
        const { error } = await supabase
          .from("partners")
          .update(partnerData)
          .eq("id", selectedPartner.id);

        if (error) throw error;
        toast.success("Parceiro atualizado com sucesso!");
      } else {
        // Create
        const { error } = await supabase
          .from("partners")
          .insert(partnerData);

        if (error) throw error;
        toast.success("Parceiro criado com sucesso!");
      }

      setDialogOpen(false);
      fetchPartners();
    } catch (error) {
      console.error("Error saving partner:", error);
      toast.error("Erro ao salvar parceiro");
    }
  };

  const handleDelete = async () => {
    if (!selectedPartner) return;

    try {
      const { error } = await supabase
        .from("partners")
        .delete()
        .eq("id", selectedPartner.id);

      if (error) throw error;
      toast.success("Parceiro excluído com sucesso!");
      setDeleteDialogOpen(false);
      setSelectedPartner(null);
      fetchPartners();
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast.error("Erro ao excluir parceiro");
    }
  };

  const handleToggleActive = async (partner: Partner) => {
    try {
      const { error } = await supabase
        .from("partners")
        .update({ is_active: !partner.is_active })
        .eq("id", partner.id);

      if (error) throw error;
      toast.success(partner.is_active ? "Parceiro desativado" : "Parceiro ativado");
      fetchPartners();
    } catch (error) {
      console.error("Error toggling partner:", error);
      toast.error("Erro ao alterar status");
    }
  };

  const handleMoveOrder = async (partner: Partner, direction: "up" | "down") => {
    const currentIndex = partners.findIndex(p => p.id === partner.id);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (swapIndex < 0 || swapIndex >= partners.length) return;
    
    const swapPartner = partners[swapIndex];
    
    try {
      await Promise.all([
        supabase.from("partners").update({ display_order: swapPartner.display_order }).eq("id", partner.id),
        supabase.from("partners").update({ display_order: partner.display_order }).eq("id", swapPartner.id)
      ]);
      
      fetchPartners();
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("Erro ao reordenar");
    }
  };

  const totalClicks = partners.reduce((acc, p) => acc + p.clicks, 0);
  const totalImpressions = partners.reduce((acc, p) => acc + p.impressions, 0);
  const activePartners = partners.filter(p => p.is_active).length;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background bg-decoration">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Gestão de Parceiros</h1>
              <p className="text-muted-foreground">Gerencie os anúncios e parceiros exibidos no app</p>
            </div>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Parceiro
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{partners.length}</p>
                <p className="text-xs text-muted-foreground">Total Parceiros</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Sparkles className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePartners}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalImpressions}</p>
                <p className="text-xs text-muted-foreground">Impressões</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <MousePointerClick className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalClicks}</p>
                <p className="text-xs text-muted-foreground">Cliques</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partners List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Parceiros Cadastrados
            </CardTitle>
            <CardDescription>
              Arraste para reordenar ou use os botões de seta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : partners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum parceiro cadastrado
              </div>
            ) : (
              <div className="space-y-3">
                {partners.map((partner, index) => {
                  const IconComponent = iconMap[partner.icon] || Building2;
                  return (
                    <div
                      key={partner.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        partner.is_active 
                          ? "bg-muted/30 border-border" 
                          : "bg-muted/10 border-muted opacity-60"
                      }`}
                    >
                      {/* Order controls */}
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveOrder(partner, "up")}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveOrder(partner, "down")}
                          disabled={index === partners.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${partner.icon_bg} flex items-center justify-center shadow-lg ${partner.shadow_color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{partner.name}</p>
                          {partner.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {partner.badge}
                            </Badge>
                          )}
                          {!partner.is_active && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {partner.description}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {partner.impressions}
                        </div>
                        <div className="flex items-center gap-1">
                          <MousePointerClick className="h-4 w-4" />
                          {partner.clicks}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={partner.is_active}
                          onCheckedChange={() => handleToggleActive(partner)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(partner.url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(partner)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedPartner(partner);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {selectedPartner ? "Editar Parceiro" : "Novo Parceiro"}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do parceiro/anunciante
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome do parceiro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badge">Badge (opcional)</Label>
                    <Input
                      id="badge"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="Ex: Novo, Popular"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descrição do parceiro"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://exemplo.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ícone</Label>
                    <Select
                      value={formData.icon}
                      onValueChange={(value) => setFormData({ ...formData, icon: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(iconMap).map(([key, Icon]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {key}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Ordem</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tema de Cores</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorThemes.map((theme, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleThemeChange(index)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedTheme === index
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-transparent"
                        } bg-gradient-to-r ${theme.gradient}`}
                      >
                        <span className="text-xs font-medium">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Ativo</Label>
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Pré-visualização</Label>
                  <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${formData.gradient} border ${formData.borderColor} p-4`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${formData.iconBg} flex items-center justify-center shadow-lg ${formData.shadowColor}`}>
                        {(() => {
                          const Icon = iconMap[formData.icon] || Building2;
                          return <Icon className="h-5 w-5 text-white" />;
                        })()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-bold bg-gradient-to-r ${formData.textGradient} bg-clip-text text-transparent`}>
                            {formData.name || "Nome do Parceiro"}
                          </p>
                          {formData.badge && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-medium">
                              <Sparkles className="h-3 w-3" />
                              {formData.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formData.description || "Descrição do parceiro"}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        className={`gap-1.5 bg-gradient-to-r ${formData.buttonGradient} text-white border-0`}
                        disabled
                      >
                        Conhecer
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {selectedPartner ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Parceiro</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir "{selectedPartner?.name}"? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PartnersAdmin;
