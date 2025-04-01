
import { useState } from "react";
import { DrawResult } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, MoreHorizontal, Trash2, Wine, Users } from "lucide-react";
import { format } from "date-fns";

interface DrawTableProps {
  draws: DrawResult[];
  onDelete: (id: string) => void;
  onCreateTests: (draw: DrawResult) => void;
}

export function DrawTable({ draws, onDelete, onCreateTests }: DrawTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDraw, setSelectedDraw] = useState<DrawResult | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const filteredDraws = draws.filter(draw => 
    draw.employeeNames.some(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const confirmDelete = (id: string) => {
    setDeleteId(null);
    onDelete(id);
  };

  const viewDetails = (draw: DrawResult) => {
    setSelectedDraw(draw);
    setDetailsOpen(true);
  };

  // Sort draws by date (newest first)
  const sortedDraws = [...filteredDraws].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por colaborador sorteado..."
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
              <TableHead>Colaboradores</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDraws.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhum sorteio encontrado
                </TableCell>
              </TableRow>
            ) : (
              sortedDraws.map((draw) => (
                <TableRow key={draw.id}>
                  <TableCell>
                    {format(new Date(draw.date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{draw.employeeNames.length} colaboradores</span>
                      <span 
                        className="text-sm text-muted-foreground truncate max-w-[300px]"
                        title={draw.employeeNames.join(', ')}
                      >
                        {draw.employeeNames.join(', ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(draw.createdAt), "dd/MM/yyyy HH:mm")}
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
                        <DropdownMenuItem onClick={() => viewDetails(draw)}>
                          <Users className="mr-2 h-4 w-4" /> Ver colaboradores
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onCreateTests(draw)}>
                          <Wine className="mr-2 h-4 w-4" /> Cadastrar testes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteId(draw.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
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
              Tem certeza que deseja excluir este sorteio? Esta ação não pode ser desfeita.
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

      {selectedDraw && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Colaboradores Sorteados</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-2 text-muted-foreground">
                Data do sorteio: {format(new Date(selectedDraw.date), "dd/MM/yyyy")}
              </p>
              <div className="space-y-2 mt-4">
                {selectedDraw.employeeNames.map((name, index) => (
                  <div key={index} className="p-3 rounded-md border">
                    <p className="font-medium">{name}</p>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setDetailsOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
