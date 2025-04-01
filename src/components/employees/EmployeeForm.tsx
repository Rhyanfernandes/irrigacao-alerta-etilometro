
import { useState } from "react";
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

interface EmployeeFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  employee?: Employee;
  onSave: (employee: Employee) => void;
}

export function EmployeeForm({ open, setOpen, employee, onSave }: EmployeeFormProps) {
  const [formData, setFormData] = useState<Partial<Employee>>(
    employee || {
      name: "",
      department: "",
      position: "",
      active: true,
    }
  );

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.department || !formData.position) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const newEmployee: Employee = {
      id: employee?.id || crypto.randomUUID(),
      name: formData.name || "",
      department: formData.department || "",
      position: formData.position || "",
      active: formData.active ?? true,
      createdAt: employee?.createdAt || new Date(),
    };

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
                value={formData.active ? "active" : "inactive"}
                onValueChange={(value) => 
                  handleChange("active", value === "active")
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
