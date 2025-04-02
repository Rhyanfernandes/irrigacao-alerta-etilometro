
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
import { Search, MoreHorizontal, Trash2, Wine, Users, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface DrawTableProps {
  draws: DrawResult[];
  onDelete: (id: string) => void;
  onCreateTests: (draw: DrawResult) => void;
  loading?: boolean;
}

export function DrawTable({ draws, onDelete, onCreateTests, loading = false }: DrawTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDraw, setSelectedDraw] = useState<DrawResult | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const filteredDraws = draws.filter(draw => 
    draw.employeeNames && draw.employeeNames.some(name => 
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
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-600" />
          <Input
            placeholder="Buscar por colaborador sorteado..."
            className="pl-8 border-green-200 focus-visible:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border border-green-200">
        <Table>
          <TableHeader className="bg-green-50">
            <TableRow>
              <TableHead className="text-green-700">Data</TableHead>
              <TableHead className="text-green-700">Colaboradores</TableHead>
              <TableHead className="text-green-700">Criado em</TableHead>
              <TableHead className="text-green-700 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(3).fill(0).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-56" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : sortedDraws.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-green-600">
                    <Users className="h-8 w-8 mb-2 opacity-50" />
                    <p>Nenhum sorteio encontrado</p>
                    <p className="text-sm text-green-500">Crie um novo sorteio para começar</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedDraws.map((draw) => (
                <TableRow key={draw.id} className="hover:bg-green-50/50">
                  <TableCell>
                    <Badge variant="outline" className="bg-white border-green-300 text-green-700 font-normal">
                      <CalendarClock className="h-3 w-3 mr-1 text-green-500" />
                      {format(new Date(draw.date), "dd/MM/yyyy")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-green-800 font-medium">{draw.employeeNames.length} colaboradores</span>
                      <span 
                        className="text-sm text-green-600 truncate max-w-[300px]"
                        title={draw.employeeNames.join(', ')}
                      >
                        {draw.employeeNames.join(', ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-green-700">
                    {format(new Date(draw.createdAt), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-green-700 hover:bg-green-100 hover:text-green-800">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-green-200">
                        <DropdownMenuLabel className="text-green-800">Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-green-100" />
                        <DropdownMenuItem 
                          onClick={() => viewDetails(draw)}
                          className="text-green-700 hover:text-green-800 focus:text-green-800 cursor-pointer"
                        >
                          <Users className="mr-2 h-4 w-4 text-green-600" /> Ver colaboradores
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onCreateTests(draw)}
                          className="text-green-700 hover:text-green-800 focus:text-green-800 cursor-pointer"
                        >
                          <Wine className="mr-2 h-4 w-4 text-green-600" /> Cadastrar testes
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteId(draw.id)}
                          className="text-red-600 hover:text-red-700 focus:text-red-700 cursor-pointer"
                        >
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
        <AlertDialogContent className="border-green-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-800">Confirmação de exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este sorteio? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-green-200 text-green-700 hover:bg-green-50">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => deleteId && confirmDelete(deleteId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedDraw && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="border-green-200">
            <DialogHeader>
              <DialogTitle className="text-green-800">Colaboradores Sorteados - irricom</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-4 text-green-700 flex items-center">
                <CalendarClock className="h-4 w-4 mr-2" />
                Data do sorteio: {format(new Date(selectedDraw.date), "dd/MM/yyyy")}
              </p>
              <div className="space-y-2 mt-4">
                {selectedDraw.employeeNames.map((name, index) => (
                  <div key={index} className="p-3 rounded-md border border-green-200 bg-green-50">
                    <p className="font-medium text-green-800">{name}</p>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={() => setDetailsOpen(false)} 
                className="bg-green-600 hover:bg-green-700"
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
