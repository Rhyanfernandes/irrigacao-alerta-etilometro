
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
  const { currentSite, selectedSiteId } = useSite();
  const [formData, setFormData] = useState<Partial<Employee>>(
    employee || {
      name: "",
      department: "",
      position: "",
      status: "active",
    }
  );

  // Atualiza os dados do formulário quando o currentSite muda
  useEffect(() => {
    if (!employee && currentSite) {
      setFormData(prev => ({
        ...prev,
        siteId: currentSite.id,
        siteName: currentSite.name
      }));
    }
  }, [currentSite, employee]);

  // Inicializa o formulário com os dados corretos do funcionário ou da obra selecionada
  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData(prev => ({
        ...prev,
        name: "",
        department: "",
        position: "",
        status: "active",
        siteId: currentSite?.id || selectedSiteId || user?.siteId,
        siteName: currentSite?.name || user?.siteName,
      }));
    }
  }, [employee, currentSite, selectedSiteId, user]);

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
    const siteId = formData.siteId || currentSite?.id || selectedSiteId || user?.siteId;
    const siteName = formData.siteName || currentSite?.name || user?.siteName;

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
      siteName: siteName,
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
            {currentSite && (
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
