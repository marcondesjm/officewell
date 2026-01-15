import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Users,
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Cake,
  Building,
  PartyPopper,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  department: string | null;
  birthday: string | null;
  email: string | null;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string | null;
  is_active: boolean | null;
  created_at: string;
}

// Helper function to parse date without timezone issues
const parseDateLocal = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Helper functions for birthday checks
const isBirthdayToday = (birthday: string | null): boolean => {
  if (!birthday) return false;
  const today = new Date();
  const bday = parseDateLocal(birthday);
  if (!bday) return false;
  return bday.getDate() === today.getDate() && bday.getMonth() === today.getMonth();
};

const isBirthdayThisWeek = (birthday: string | null): boolean => {
  if (!birthday) return false;
  const today = new Date();
  const bday = parseDateLocal(birthday);
  if (!bday) return false;
  bday.setFullYear(today.getFullYear());
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return bday >= startOfWeek && bday <= endOfWeek;
};

const isBirthdayThisMonth = (birthday: string | null): boolean => {
  if (!birthday) return false;
  const today = new Date();
  const bday = parseDateLocal(birthday);
  if (!bday) return false;
  return bday.getMonth() === today.getMonth();
};

const formatBirthdayDisplay = (birthday: string | null): string => {
  if (!birthday) return "";
  const bday = parseDateLocal(birthday);
  if (!bday) return "";
  return bday.toLocaleDateString("pt-BR");
};

const HRAdmin = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Employee form state
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeDepartment, setEmployeeDepartment] = useState("");
  const [employeeBirthday, setEmployeeBirthday] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");

  // Announcement form state
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementPriority, setAnnouncementPriority] = useState("normal");

  const fetchData = async () => {
    try {
      const { data: empData } = await supabase
        .from("employees")
        .select("*")
        .order("name");

      const { data: annData } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      setEmployees(empData || []);
      setAnnouncements(annData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 10 minutes
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Employee CRUD
  const openEmployeeDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setEmployeeName(employee.name);
      setEmployeeDepartment(employee.department || "");
      setEmployeeBirthday(employee.birthday || "");
      setEmployeeEmail(employee.email || "");
    } else {
      setEditingEmployee(null);
      setEmployeeName("");
      setEmployeeDepartment("");
      setEmployeeBirthday("");
      setEmployeeEmail("");
    }
    setEmployeeDialogOpen(true);
  };

  const saveEmployee = async () => {
    if (!employeeName.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    try {
      if (editingEmployee) {
        const { error } = await supabase
          .from("employees")
          .update({
            name: employeeName.trim(),
            department: employeeDepartment.trim() || null,
            birthday: employeeBirthday || null,
            email: employeeEmail.trim() || null,
          })
          .eq("id", editingEmployee.id);

        if (error) throw error;
        toast.success("Funcionário atualizado!");
      } else {
        const { error } = await supabase.from("employees").insert({
          name: employeeName.trim(),
          department: employeeDepartment.trim() || null,
          birthday: employeeBirthday || null,
          email: employeeEmail.trim() || null,
        });

        if (error) throw error;
        toast.success("Funcionário adicionado!");
      }

      setEmployeeDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error("Erro ao salvar funcionário");
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
      toast.success("Funcionário removido!");
      fetchData();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Erro ao remover funcionário");
    }
  };

  // Announcement CRUD
  const openAnnouncementDialog = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setAnnouncementTitle(announcement.title);
      setAnnouncementContent(announcement.content);
      setAnnouncementPriority(announcement.priority || "normal");
    } else {
      setEditingAnnouncement(null);
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setAnnouncementPriority("normal");
    }
    setAnnouncementDialogOpen(true);
  };

  const saveAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      toast.error("Título e conteúdo são obrigatórios");
      return;
    }

    try {
      if (editingAnnouncement) {
        const { error } = await supabase
          .from("announcements")
          .update({
            title: announcementTitle.trim(),
            content: announcementContent.trim(),
            priority: announcementPriority,
          })
          .eq("id", editingAnnouncement.id);

        if (error) throw error;
        toast.success("Aviso atualizado!");
      } else {
        const { error } = await supabase.from("announcements").insert({
          title: announcementTitle.trim(),
          content: announcementContent.trim(),
          priority: announcementPriority,
        });

        if (error) throw error;
        toast.success("Aviso publicado!");
      }

      setAnnouncementDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast.error("Erro ao salvar aviso");
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
      toast.success("Aviso removido!");
      fetchData();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Erro ao remover aviso");
    }
  };

  const toggleAnnouncementActive = async (id: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(currentStatus ? "Aviso desativado" : "Aviso ativado");
      fetchData();
    } catch (error) {
      console.error("Error toggling announcement:", error);
      toast.error("Erro ao alterar status");
    }
  };

  const priorityLabels = {
    low: "Baixa",
    normal: "Normal",
    high: "Alta",
    urgent: "Urgente",
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-decoration flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  // Calculate birthdays
  const birthdaysToday = employees.filter(emp => isBirthdayToday(emp.birthday));
  const birthdaysThisWeek = employees.filter(emp => isBirthdayThisWeek(emp.birthday) && !isBirthdayToday(emp.birthday));

  return (
    <div className="min-h-screen p-4 md:p-8 bg-decoration">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gradient">Painel Administrativo RH</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie funcionários e avisos da empresa
            </p>
          </div>
        </div>

        {/* Birthday Alert Banner */}
        {(birthdaysToday.length > 0 || birthdaysThisWeek.length > 0) && (
          <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-pink-500/10 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/20 animate-bounce">
                  <PartyPopper className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  {birthdaysToday.length > 0 && (
                    <div className="mb-2">
                      <p className="font-semibold text-primary flex items-center gap-2">
                        🎂 Aniversário Hoje!
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {birthdaysToday.map(emp => (
                          <Badge key={emp.id} className="bg-primary text-primary-foreground">
                            {emp.name} {emp.department && `(${emp.department})`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {birthdaysThisWeek.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Cake className="h-4 w-4" />
                        Próximos aniversários esta semana:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {birthdaysThisWeek.map(emp => (
                          <Badge key={emp.id} variant="secondary" className="text-xs">
                            {emp.name} - {formatBirthdayDisplay(emp.birthday)?.slice(0, 5)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="employees" className="gap-2">
              <Users className="h-4 w-4" />
              Funcionários ({employees.length})
            </TabsTrigger>
            <TabsTrigger value="birthdays" className="gap-2 relative">
              <Cake className="h-4 w-4" />
              Aniversários
              {birthdaysToday.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center animate-pulse">
                  {birthdaysToday.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Avisos ({announcements.length})
            </TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openEmployeeDialog()} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Funcionário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={employeeName}
                        onChange={(e) => setEmployeeName(e.target.value)}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Departamento</Label>
                      <Input
                        id="department"
                        value={employeeDepartment}
                        onChange={(e) => setEmployeeDepartment(e.target.value)}
                        placeholder="Ex: Marketing, TI, RH..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthday">Data de Nascimento</Label>
                      <Input
                        id="birthday"
                        type="date"
                        value={employeeBirthday}
                        onChange={(e) => setEmployeeBirthday(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={employeeEmail}
                        onChange={(e) => setEmployeeEmail(e.target.value)}
                        placeholder="email@empresa.com"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setEmployeeDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={saveEmployee}>Salvar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                {employees.length > 0 ? (
                  <div className="divide-y">
                    {employees.map((emp) => (
                      <div key={emp.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{emp.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {emp.department && (
                                <span className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {emp.department}
                                </span>
                              )}
                              {emp.birthday && (
                                <span className="flex items-center gap-1">
                                  <Cake className="h-3 w-3" />
                                  {formatBirthdayDisplay(emp.birthday)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEmployeeDialog(emp)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover funcionário?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. O funcionário "{emp.name}" será
                                  removido permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteEmployee(emp.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Nenhum funcionário cadastrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Birthdays Tab */}
          <TabsContent value="birthdays" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PartyPopper className="h-5 w-5 text-primary" />
                  Aniversariantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Today's Birthdays */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    🎂 Aniversariantes de Hoje
                  </h3>
                  {birthdaysToday.length > 0 ? (
                    <div className="space-y-2">
                      {birthdaysToday.map((emp) => (
                        <div
                          key={emp.id}
                          className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-pink-500/20 border border-primary/30"
                        >
                          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold animate-bounce">
                            🎉
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{emp.name}</p>
                            <p className="text-sm text-muted-foreground">{emp.department}</p>
                          </div>
                          <Badge className="bg-primary text-primary-foreground">
                            Hoje! 🎈
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Nenhum aniversariante hoje
                    </p>
                  )}
                </div>

                {/* This Week's Birthdays */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    📅 Esta Semana
                  </h3>
                  {birthdaysThisWeek.length > 0 ? (
                    <div className="space-y-2">
                      {birthdaysThisWeek.map((emp) => (
                        <div
                          key={emp.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                            <Cake className="h-5 w-5 text-secondary-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">{emp.department}</p>
                          </div>
                          <Badge variant="outline">
                            {formatBirthdayDisplay(emp.birthday)?.slice(0, 5)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Nenhum aniversariante esta semana
                    </p>
                  )}
                </div>

                {/* This Month's Birthdays */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    🗓️ Este Mês
                  </h3>
                  {(() => {
                    const thisMonth = employees.filter(emp => {
                      if (!emp.birthday) return false;
                      const bday = parseDateLocal(emp.birthday);
                      return bday && bday.getMonth() === new Date().getMonth() && 
                             !isBirthdayToday(emp.birthday) && 
                             !isBirthdayThisWeek(emp.birthday);
                    }).sort((a, b) => {
                      const bdayA = parseDateLocal(a.birthday);
                      const bdayB = parseDateLocal(b.birthday);
                      const dayA = bdayA ? bdayA.getDate() : 0;
                      const dayB = bdayB ? bdayB.getDate() : 0;
                      return dayA - dayB;
                    });
                    
                    return thisMonth.length > 0 ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {thisMonth.map((emp) => (
                          <div
                            key={emp.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                          >
                            <Cake className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm flex-1 truncate">{emp.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatBirthdayDisplay(emp.birthday)?.slice(0, 5)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Nenhum outro aniversariante este mês
                      </p>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openAnnouncementDialog()} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Aviso
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAnnouncement ? "Editar Aviso" : "Novo Aviso"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={announcementTitle}
                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                        placeholder="Título do aviso"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Conteúdo *</Label>
                      <Textarea
                        id="content"
                        value={announcementContent}
                        onChange={(e) => setAnnouncementContent(e.target.value)}
                        placeholder="Descreva o aviso..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <Select value={announcementPriority} onValueChange={setAnnouncementPriority}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={saveAnnouncement}>Publicar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                {announcements.length > 0 ? (
                  <div className="divide-y">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="flex items-start justify-between p-4 gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{ann.title}</p>
                            <Badge
                              variant={ann.is_active ? "default" : "secondary"}
                              className="text-[10px]"
                            >
                              {ann.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {priorityLabels[ann.priority as keyof typeof priorityLabels] ||
                                "Normal"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {ann.content}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {new Date(ann.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAnnouncementActive(ann.id, ann.is_active)}
                          >
                            {ann.is_active ? "Desativar" : "Ativar"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openAnnouncementDialog(ann)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover aviso?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. O aviso "{ann.title}" será
                                  removido permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteAnnouncement(ann.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Megaphone className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Nenhum aviso cadastrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HRAdmin;
