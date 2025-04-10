import { useState, useEffect } from "react";
import { TestResult, Employee } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

interface TestFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  employees: Employee[];
  test?: TestResult;
  onSave: (test: TestResult) => void;
  selectedEmployeeId?: string;
}

export function TestForm({ 
  open, 
  setOpen, 
  employees, 
  test, 
  onSave,
  selectedEmployeeId
}: TestFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<TestResult>>(
    test || {
      employeeId: selectedEmployeeId || "",
      date: new Date(),
      time: format(new Date(), "HH:mm"),
      result: "negative",
      notes: "",
      alcoholLevel: 0.00,
      // Adicionar siteId e siteName do usuário atual se for usuário de obra
      siteId: user?.siteId,
      siteName: user?.siteName
    }
  );

  useEffect(() => {
    if (selectedEmployeeId && !test) {
      const employee = employees.find(e => e.id === selectedEmployeeId);
      setFormData(prev => ({
        ...prev,
        employeeId: selectedEmployeeId,
        employeeName: employee?.name,
        siteId: employee?.siteId || user?.siteId,
        siteName: employee?.siteName || user?.siteName
      }));
    }
  }, [selectedEmployeeId, employees, test, user]);

  const handleChange = (field: string, value: any) => {
    if (field === "employeeId") {
      const employee = employees.find(e => e.id === value);
      setFormData(prev => ({
        ...prev,
        employeeId: value,
        employeeName: employee?.name
      }));
    } else if (field === "alcoholLevel") {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setFormData(prev => ({
          ...prev,
          [field]: parseFloat(numValue.toFixed(2)),
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.date || !formData.time || !formData.result) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const employee = employees.find(e => e.id === formData.employeeId);
    
    if (!employee) {
      toast.error("Colaborador não encontrado");
      return;
    }

    let alcoholLevel = formData.alcoholLevel;
    if (alcoholLevel === undefined || alcoholLevel === null) {
      alcoholLevel = formData.result === "positive" ? 0.05 : 0.00;
    }

    const newTest: TestResult = {
      id: test?.id || crypto.randomUUID(),
      employeeId: formData.employeeId,
      employeeName: employee.name,
      date: formData.date ? new Date(formData.date) : new Date(),
      time: formData.time || format(new Date(), "HH:mm"),
      result: formData.result as "positive" | "negative",
      notes: formData.notes || "",
      alcoholLevel,
      // Usar siteId e siteName do funcionário ou padrão definido ao iniciar o formulário
      siteId: employee.siteId || formData.siteId || user?.siteId,
      siteName: employee.siteName || formData.siteName || user?.siteName,
      createdAt: test?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(newTest);
    setOpen(false);
    toast.success(
      test ? "Teste atualizado com sucesso" : "Teste registrado com sucesso"
    );
  };

  // Filter out inactive employees
  const activeEmployees = employees.filter(e => e.active !== false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {test ? "Editar Teste" : "Registrar Novo Teste"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do teste de etilômetro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Colaborador *</Label>
              <Select
                value={formData.employeeId || undefined}
                onValueChange={(value) => handleChange("employeeId", value)}
                disabled={!!selectedEmployeeId}
              >
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Selecione o colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {activeEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date ? format(new Date(formData.date), "yyyy-MM-dd") : ""}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Hora *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time || ""}
                  onChange={(e) => handleChange("time", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resultado *</Label>
              <RadioGroup
                value={formData.result || "negative"}
                onValueChange={(value) => handleChange("result", value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="negative" id="negative" />
                  <Label htmlFor="negative" className="cursor-pointer">Negativo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="positive" id="positive" />
                  <Label htmlFor="positive" className="cursor-pointer">Positivo</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alcoholLevel">Nível de Álcool (mg/L) *</Label>
              <Input
                id="alcoholLevel"
                type="number"
                min="0"
                max="2"
                step="0.01"
                placeholder="0.00"
                value={formData.alcoholLevel ?? 0}
                onChange={(e) => handleChange("alcoholLevel", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Limite legal: 0.04 mg/L
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Observações sobre o teste..."
                className="resize-none"
                rows={3}
              />
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
              {test ? "Atualizar" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
