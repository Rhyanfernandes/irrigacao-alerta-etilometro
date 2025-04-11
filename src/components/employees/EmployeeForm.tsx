
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
    if (employee) {
      setFormData(employee);
    } else {
      let siteId = currentSite?.id;
      let siteName = currentSite?.name;

      // Se for usuário de obra, usar a obra do usuário
      if (user?.role === 'site') {
        siteId = user.siteId;
        siteName = user.siteName;
      } else if (user?.role === 'master' && selectedSiteId) {
        // Se for master e tiver obra selecionada, usar a obra selecionada
        const selectedSite = sites.find(s => s.id === selectedSiteId);
        if (selectedSite) {
          siteName = selectedSite.name;
        }
      }

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
    if (user?.role === 'site') {
      siteId = user.siteId;
      siteName = user.siteName;
    } else if (!siteId && user?.role === 'master' && selectedSiteId) {
      // Se for master sem siteId definido mas com obra selecionada
      siteId = selectedSiteId;
      const selectedSite = sites.find(s => s.id === selectedSiteId);
      if (selectedSite) {
        siteName = selectedSite.name;
      }
    }

    if (!siteId) {
      toast.error("Nenhuma obra selecionada. Selecione uma obra primeiro.");
      return;
    }

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
                Obra: {user.siteName}
              </p>
            ) : currentSite && (
              <p className="mt-1 text-sm font-medium text-blue-600">
                Obra: {currentSite.name}
              </p>
            )}
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
