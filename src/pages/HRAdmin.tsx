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

  return (
    <div className="min-h-screen p-4 md:p-8 bg-decoration">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Painel Administrativo RH</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie funcionários e avisos da empresa
            </p>
          </div>
        </div>

        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employees" className="gap-2">
              <Users className="h-4 w-4" />
              Funcionários ({employees.length})
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
                                  {new Date(emp.birthday).toLocaleDateString("pt-BR")}
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
