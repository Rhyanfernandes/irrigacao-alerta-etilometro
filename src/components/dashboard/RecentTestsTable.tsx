
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TestResult } from "@/types";
import { format } from "date-fns";
import { Wine } from "lucide-react";

interface RecentTestsTableProps {
  tests: TestResult[];
}

export function RecentTestsTable({ tests }: RecentTestsTableProps) {
  // Get alcohol level from test or use a default
  const getTestLevel = (test: TestResult) => {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Colaborador</TableHead>
            <TableHead>Resultado</TableHead>
            <TableHead>Nível (mg/L)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Nenhum teste registrado recentemente
              </TableCell>
            </TableRow>
          ) : (
            tests.map((test) => (
              <TableRow key={test.id}>
                <TableCell>
                  {format(new Date(test.date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>{test.time}</TableCell>
                <TableCell>{test.employeeName}</TableCell>
                <TableCell>
                  <Badge
                    variant={test.result === "positive" ? "destructive" : "default"}
                    className={test.result === "positive" ? "bg-blue-500" : "bg-green-500"}
                  >
                    {test.result === "positive" ? "Positivo" : "Negativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Wine className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="font-semibold">{getTestLevel(test)}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
