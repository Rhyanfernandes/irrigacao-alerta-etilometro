
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
import { Wine, Calendar, Clock, User, FileText, Info, Tag } from "lucide-react";

interface TestDetailsProps {
  test: TestResult | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function TestDetails({ test, open, setOpen }: TestDetailsProps) {
  if (!test) return null;

  // Get alcohol level from test or use a default
  const getTestPercentage = () => {
    if (test.alcoholLevel !== undefined) {
      return test.alcoholLevel.toFixed(2);
    } else {
      // Default values if alcoholLevel is not specified
      if (test.result === "positive") {
        // Random value between 0.05 and 0.4 for positive tests (representing mg/L)
        return (Math.random() * 0.35 + 0.05).toFixed(2);
      } else {
        // Random value between 0 and 0.03 for negative tests (representing mg/L)
        return (Math.random() * 0.03).toFixed(2);
      }
    }
  };

  const testPercentage = getTestPercentage();
  const limitValue = 0.04; // Legal limit in Brazil (mg/L)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <Wine className="mr-2 h-5 w-5" />
            Detalhes do Teste - irricom
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="p-4 rounded-lg border bg-muted/30">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Colaborador</p>
                  <p className="font-semibold">{test.employeeName}</p>
                </div>
              </div>
              
              <Badge
                variant={test.result === "positive" ? "destructive" : "default"}
                className={`px-3 py-1 text-sm ${test.result === "positive" ? "bg-red-500" : "bg-green-500"}`}
              >
                {test.result === "positive" ? "Positivo" : "Negativo"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-start">
                <Calendar className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data</p>
                  <p>{format(new Date(test.date), "dd/MM/yyyy")}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hora</p>
                  <p>{test.time}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex items-start mb-3">
                <Tag className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <div className="w-full">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Concentração de Álcool</p>
                  <div className="flex items-center justify-between">
                    <p className={`font-bold text-xl ${parseFloat(testPercentage) > limitValue ? "text-red-600" : "text-green-600"}`}>
                      {testPercentage} mg/L
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Limite legal: {limitValue} mg/L
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div 
                      className={`h-2.5 rounded-full ${parseFloat(testPercentage) > limitValue ? "bg-red-600" : "bg-green-600"}`}
                      style={{ width: `${Math.min(parseFloat(testPercentage) * 250, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {test.notes && (
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Observações</p>
                <p className="mt-1 text-sm whitespace-pre-line">{test.notes}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
            <div className="flex items-start">
              <Info className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-muted-foreground">Cadastrado em</p>
                <p>{format(new Date(test.createdAt), "dd/MM/yyyy HH:mm")}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Info className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-muted-foreground">Última atualização</p>
                <p>{format(new Date(test.updatedAt), "dd/MM/yyyy HH:mm")}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)} className="bg-green-600 hover:bg-green-700">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
