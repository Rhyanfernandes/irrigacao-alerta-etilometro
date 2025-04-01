
import { useState, useEffect } from "react";
import { DrawResult, Employee } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import { Check, Shuffle, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface DrawFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  employees: Employee[];
  onSave: (draw: DrawResult) => void;
}

export function DrawForm({ open, setOpen, employees, onSave }: DrawFormProps) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [count, setCount] = useState(3);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);

  const activeEmployees = employees.filter(e => e.active);

  useEffect(() => {
    if (open) {
      setDate(format(new Date(), "yyyy-MM-dd"));
      setCount(3);
      setSelectedEmployees([]);
      setHasDrawn(false);
    }
  }, [open]);

  const performDraw = () => {
    if (count > activeEmployees.length) {
      toast.error(`Não há colaboradores suficientes. Disponíveis: ${activeEmployees.length}`);
      return;
    }

    // Shuffle the array of employees and pick the first 'count' elements
    const shuffled = [...activeEmployees].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    setSelectedEmployees(selected);
    setHasDrawn(true);
    toast.success(`${count} colaboradores sorteados com sucesso!`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasDrawn) {
      toast.error("Realize o sorteio antes de salvar");
      return;
    }

    const drawResult: DrawResult = {
      id: crypto.randomUUID(),
      date: new Date(date),
      employeeIds: selectedEmployees.map(e => e.id),
      employeeNames: selectedEmployees.map(e => e.name),
      createdAt: new Date(),
    };

    onSave(drawResult);
    setOpen(false);
    toast.success("Sorteio registrado com sucesso");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Sorteio de Colaboradores</DialogTitle>
          <DialogDescription>
            Realize um sorteio aleatório de colaboradores para testes de etilômetro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="count">Número de colaboradores</Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={activeEmployees.length}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="button" 
                onClick={performDraw}
                className="w-full"
                variant="secondary"
              >
                <Shuffle className="mr-2 h-4 w-4" />
                Realizar Sorteio
              </Button>
            </div>

            {hasDrawn && selectedEmployees.length > 0 && (
              <div className="pt-2">
                <Label>Colaboradores Sorteados</Label>
                <div className="rounded-md border p-3 mt-1.5 space-y-2">
                  {selectedEmployees.map((employee) => (
                    <div 
                      key={employee.id} 
                      className="flex items-center justify-between py-1"
                    >
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.department}
                        </p>
                      </div>
                      <Badge variant="outline">{employee.position}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            <Button 
              type="submit"
              disabled={!hasDrawn}
            >
              <Check className="mr-2 h-4 w-4" />
              Salvar Sorteio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
