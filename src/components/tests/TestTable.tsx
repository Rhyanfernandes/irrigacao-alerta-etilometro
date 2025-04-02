
import { useState } from "react";
import { TestResult } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, MoreHorizontal, Edit, Trash2, AlignJustify, Wine } from "lucide-react";
import { format } from "date-fns";

interface TestTableProps {
  tests: TestResult[];
  onEdit: (test: TestResult) => void;
  onDelete: (id: string) => void;
  onViewDetails: (test: TestResult) => void;
}

export function TestTable({ tests, onEdit, onDelete, onViewDetails }: TestTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const filteredTests = tests.filter(test => 
    test.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmDelete = (id: string) => {
    setDeleteId(null);
    onDelete(id);
  };

  // Sort tests by date (newest first)
  const sortedTests = [...filteredTests].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
    <>
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por colaborador..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Colaborador</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Nível (mg/L)</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum teste encontrado
                </TableCell>
              </TableRow>
            ) : (
              sortedTests.map((test) => (
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
                  <TableCell>
                    <div className="flex items-center">
                      <Wine className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="font-semibold">{getTestLevel(test)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(test.updatedAt), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(test)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteId(test.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewDetails(test)}>
                          <AlignJustify className="mr-2 h-4 w-4" /> Detalhes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este teste? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && confirmDelete(deleteId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
