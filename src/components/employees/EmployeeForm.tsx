
import { useState, useEffect } from "react";
import { Employee } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useSite } from "@/context/SiteContext";

interface EmployeeFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  employee?: Employee;
  onSave: (employee: Employee) => void;
}

export function EmployeeForm({ open, setOpen, employee, onSave }: EmployeeFormProps) {
  const { user } = useAuth();
  const { currentSite, selectedSiteId, sites } = useSite();
  const [formData, setFormData] = useState<Partial<Employee>>(
    employee || {
      name: "",
      department: "",
      position: "",
      status: "active",
    }
  );

  // Inicializa o formulário com os dados corretos do funcionário ou da obra selecionada
  useEffect(() => {
    console.log("EmployeeForm - Inicializando com:", {
      employee,
      currentSite,
      selectedSiteId,
      user
    });
    
    if (employee) {
      console.log("Editando funcionário existente:", employee);
      setFormData(employee);
    } else {
      let siteId = null;
      let siteName = null;

      // Se for usuário de obra, usar a obra do usuário
      if (user?.role === 'site' && user.siteId) {
        console.log("Usuário de obra, usando site:", user.siteId, user.siteName);
        siteId = user.siteId;
        siteName = user.siteName;
      } else if (user?.role === 'master' && selectedSiteId) {
        // Se for master e tiver obra selecionada, usar a obra selecionada
        console.log("Master com site selecionado:", selectedSiteId);
        const selectedSite = sites.find(s => s.id === selectedSiteId);
        siteId = selectedSiteId;
        if (selectedSite) {
          siteName = selectedSite.name;
        }
      } else if (currentSite) {
        // Usar site atual como fallback
        console.log("Usando site atual como fallback:", currentSite.id);
        siteId = currentSite.id;
        siteName = currentSite.name;
      }

      console.log("Inicializando novo funcionário com site:", siteId, siteName);
      
      setFormData({
        name: "",
        department: "",
        position: "",
        status: "active",
        siteId: siteId,
        siteName: siteName,
      });
    }
  }, [employee, currentSite, selectedSiteId, sites, user]);

  const handleChange = (field: string, value: string | boolean) => {
    // Ensure department and position are never empty strings
    if ((field === 'department' || field === 'position') && value === '') {
      value = ' '; // Use a space instead of empty string
    }
    
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("Preencha o nome do colaborador");
      return;
    }

    // Ensure department and position have default values if empty
    const department = formData.department || "Geral";
    const position = formData.position || "Colaborador";

    // Garantir que o siteId está definido
    let siteId = formData.siteId;
    let siteName = formData.siteName;
    
    // Se for usuário de obra, forçar a obra do usuário
    if (user?.role === 'site' && user.siteId) {
      console.log("Forçando site do usuário de obra:", user.siteId);
      siteId = user.siteId;
      siteName = user.siteName;
    } else if (!siteId && user?.role === 'master' && selectedSiteId) {
      // Se for master sem siteId definido mas com obra selecionada
      console.log("Master com site selecionado:", selectedSiteId);
      siteId = selectedSiteId;
      const selectedSite = sites.find(s => s.id === selectedSiteId);
      if (selectedSite) {
        siteName = selectedSite.name;
      }
    } else if (!siteId && currentSite) {
      // Fallback para o site atual
      console.log("Usando site atual como fallback:", currentSite.id);
      siteId = currentSite.id;
      siteName = currentSite.name;
    }

    if (!siteId) {
      toast.error("Nenhuma obra selecionada. Selecione uma obra primeiro.");
      console.error("Tentativa de salvar sem obra definida");
      return;
    }

    console.log("Salvando colaborador com site:", siteId, siteName);

    const newEmployee: Employee = {
      id: employee?.id || crypto.randomUUID(),
      name: formData.name || "",
      department: department,
      position: position,
      registerNumber: formData.registerNumber || "",
      status: formData.status || "active",
      active: formData.status === "active",
      siteId: siteId,
      siteName: siteName || "",
      createdAt: employee?.createdAt || new Date(),
    };

    console.log("Salvando colaborador com dados:", newEmployee);
    onSave(newEmployee);
    setOpen(false);
    toast.success(
      employee ? "Colaborador atualizado com sucesso" : "Colaborador cadastrado com sucesso"
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Editar Colaborador" : "Cadastrar Novo Colaborador"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do colaborador abaixo.
            {user?.role === 'site' ? (
              <p className="mt-1 text-sm font-medium text-blue-600">
                Obra: {user.siteName || "Sua Obra"}
              </p>
            ) : selectedSiteId ? (
              <p className="mt-1 text-sm font-medium text-blue-600">
                Obra: {sites.find(s => s.id === selectedSiteId)?.name || "Obra Selecionada"}
              </p>
            ) : currentSite ? (
              <p className="mt-1 text-sm font-medium text-blue-600">
                Obra: {currentSite.name}
              </p>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nome do colaborador"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento *</Label>
              <Input
                id="department"
                value={formData.department || ""}
                onChange={(e) => handleChange("department", e.target.value)}
                placeholder="Departamento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo *</Label>
              <Input
                id="position"
                value={formData.position || ""}
                onChange={(e) => handleChange("position", e.target.value)}
                placeholder="Cargo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || "active"}
                onValueChange={(value) => 
                  handleChange("status", value)
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit">
              <Check className="mr-2 h-4 w-4" />
              {employee ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
