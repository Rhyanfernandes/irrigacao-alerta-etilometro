
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
import { Check, Shuffle, X, User, Building, Briefcase } from "lucide-react";
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
  const [isDrawing, setIsDrawing] = useState(false);

  const activeEmployees = employees.filter(e => e.active);

  useEffect(() => {
    if (open) {
      setDate(format(new Date(), "yyyy-MM-dd"));
      setCount(3);
      setSelectedEmployees([]);
      setHasDrawn(false);
      setIsDrawing(false);
    }
  }, [open]);

  const performDraw = () => {
    if (count > activeEmployees.length) {
      toast.error(`Não há colaboradores suficientes. Disponíveis: ${activeEmployees.length}`);
      return;
    }

    setIsDrawing(true);
    setSelectedEmployees([]);
    setHasDrawn(false);
    
    // Simulating a more dynamic draw with animation
    let currentIndex = 0;
    const interval = setInterval(() => {
      // Shuffle the array of employees each time for visual effect
      const shuffled = [...activeEmployees].sort(() => 0.5 - Math.random());
      const temporarySelection = shuffled.slice(0, count);
      setSelectedEmployees(temporarySelection);
      
      currentIndex++;
      if (currentIndex >= 8) { // Do 8 iterations for animation
        clearInterval(interval);
        
        // Final selection
        const finalShuffled = [...activeEmployees].sort(() => 0.5 - Math.random());
        const selected = finalShuffled.slice(0, count);
        setSelectedEmployees(selected);
        setHasDrawn(true);
        setIsDrawing(false);
        toast.success(`${count} colaboradores sorteados com sucesso!`, {
          icon: <Shuffle className="h-4 w-4 text-white" />
        });
      }
    }, 200);
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
    toast.success("Sorteio irricom registrado com sucesso", {
      icon: <Check className="h-4 w-4 text-white" />
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] border-green-200">
        <DialogHeader>
          <DialogTitle className="text-green-800">Novo Sorteio de Colaboradores - irricom</DialogTitle>
          <DialogDescription>
            Realize um sorteio aleatório de colaboradores para testes de etilômetro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-green-700">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-green-200 focus-visible:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="count" className="text-green-700">Número de colaboradores</Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={activeEmployees.length}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="border-green-200 focus-visible:ring-green-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="button" 
                onClick={performDraw}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isDrawing}
              >
                <Shuffle className={`mr-2 h-4 w-4 ${isDrawing ? 'animate-spin' : ''}`} />
                {isDrawing ? 'Sorteando...' : 'Realizar Sorteio'}
              </Button>
            </div>

            {(hasDrawn || isDrawing) && selectedEmployees.length > 0 && (
              <div className="pt-2">
                <Label className="text-green-700">Colaboradores Sorteados</Label>
                <div className="rounded-md border border-green-200 p-3 mt-1.5 space-y-2 bg-green-50">
                  {selectedEmployees.map((employee) => (
                    <div 
                      key={employee.id} 
                      className={`flex items-center justify-between py-1 px-3 rounded-md ${isDrawing ? 'bg-white animate-pulse' : 'bg-white'}`}
                    >
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">{employee.name}</p>
                          <div className="flex items-center text-sm text-green-600">
                            <Building className="h-3 w-3 mr-1" />
                            {employee.department}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-green-200 text-green-700 flex items-center">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {employee.position}
                      </Badge>
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
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={!hasDrawn}
              className="bg-green-600 hover:bg-green-700 text-white"
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
