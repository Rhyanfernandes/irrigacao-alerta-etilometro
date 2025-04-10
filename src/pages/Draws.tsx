
import { useEffect, useState } from "react";
import { Employee, DrawResult } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { DrawTable } from "@/components/draws/DrawTable";
import { DrawForm } from "@/components/draws/DrawForm";
import { getEmployees, getDraws, saveDraw, deleteDraw } from "@/lib/storage";
import { toast } from "sonner";
import { Shuffle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSite } from "@/context/SiteContext";

export default function Draws() {
  const [draws, setDraws] = useState<DrawResult[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { selectedSiteId } = useSite();

  useEffect(() => {
    loadData();

    // Add event listener for storage changes
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
    };
  }, [selectedSiteId]); // Re-load when selected site changes

  const loadData = async () => {
    setLoading(true);
    try {
      const [drawsData, employeesData] = await Promise.all([
        getDraws(),
        getEmployees()
      ]);
      setDraws(drawsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error loading draw data:", error);
      toast.error("Erro ao carregar dados de sorteios");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300); // Pequeno delay para efeito visual
    }
  };

  const handleAddClick = () => {
    setFormOpen(true);
  };

  const handleSave = async (draw: DrawResult) => {
    try {
      await saveDraw(draw);
      await loadData();
      toast.success("Sorteio salvo com sucesso");
    } catch (error) {
      console.error("Error saving draw:", error);
      toast.error("Erro ao salvar sorteio");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDraw(id);
      await loadData();
      toast.success("Sorteio excluído com sucesso");
    } catch (error) {
      console.error("Error deleting draw:", error);
      toast.error("Erro ao excluir sorteio");
    }
  };

  const handleCreateTests = (draw: DrawResult) => {
    // Redirect to testing page for the first employee in the draw
    if (draw.employeeIds && draw.employeeIds.length > 0) {
      navigate("/tests", { state: { employeeId: draw.employeeIds[0] } });
    } else {
      toast.error("Nenhum colaborador encontrado no sorteio");
    }
  };

  const refreshData = () => {
    toast.info("Atualizando dados...");
    loadData();
  };

  return (
    <>
      <PageHeader 
        title="Sorteios irricom" 
        description="Sorteio de colaboradores para testes de etilômetro" 
        action={{
          label: "Novo Sorteio",
          onClick: handleAddClick,
          icon: <Shuffle className="h-4 w-4" />,
        }}
      />

      <div className="grid gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-green-800">Sistema de Sorteio irricom</h3>
                <p className="text-sm text-green-700">
                  Realize sorteios aleatórios para selecionar colaboradores para testes de etilômetro.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="mt-3 md:mt-0 border-green-300 text-green-700 hover:bg-green-100"
                onClick={refreshData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar dados
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <DrawTable 
        draws={draws}
        onDelete={handleDelete}
        onCreateTests={handleCreateTests}
        loading={loading}
      />

      <DrawForm 
        open={formOpen}
        setOpen={setFormOpen}
        employees={employees}
        onSave={handleSave}
      />
    </>
  );
}
