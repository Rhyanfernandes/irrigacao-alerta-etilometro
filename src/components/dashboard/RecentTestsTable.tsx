
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

interface RecentTestsTableProps {
  tests: TestResult[];
}

export function RecentTestsTable({ tests }: RecentTestsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Colaborador</TableHead>
            <TableHead>Resultado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
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
                    className={test.result === "positive" ? "bg-red-500" : "bg-green-500"}
                  >
                    {test.result === "positive" ? "Positivo" : "Negativo"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
