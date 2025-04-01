
import { TestResult } from "@/types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface TestDetailsProps {
  test: TestResult | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function TestDetails({ test, open, setOpen }: TestDetailsProps) {
  if (!test) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Teste</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data</p>
              <p>{format(new Date(test.date), "dd/MM/yyyy")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hora</p>
              <p>{test.time}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Colaborador</p>
            <p>{test.employeeName}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Resultado</p>
            <Badge
              variant={test.result === "negative" ? "outline" : "destructive"}
              className="mt-1"
            >
              {test.result === "negative" ? "Negativo" : "Positivo"}
            </Badge>
          </div>

          {test.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Observações</p>
              <p className="mt-1 text-sm whitespace-pre-line">{test.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Cadastrado em</p>
              <p>{format(new Date(test.createdAt), "dd/MM/yyyy HH:mm")}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Última atualização</p>
              <p>{format(new Date(test.updatedAt), "dd/MM/yyyy HH:mm")}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
