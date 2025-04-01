
import { useEffect, useState } from "react";
import { Employee, DrawResult } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { DrawTable } from "@/components/draws/DrawTable";
import { DrawForm } from "@/components/draws/DrawForm";
import { getEmployees, getDraws, saveDraw, deleteDraw } from "@/lib/storage";
import { toast } from "sonner";
import { Shuffle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Draws() {
  const [draws, setDraws] = useState<DrawResult[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();

    // Add event listener for storage changes
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
    };
  }, []);

  const loadData = () => {
    setDraws(getDraws());
    setEmployees(getEmployees());
  };

  const handleAddClick = () => {
    setFormOpen(true);
  };

  const handleSave = (draw: DrawResult) => {
    saveDraw(draw);
    loadData();
  };

  const handleDelete = (id: string) => {
    deleteDraw(id);
    loadData();
    toast.success("Sorteio excluído com sucesso");
  };

  const handleCreateTests = (draw: DrawResult) => {
    // Redirect to testing page for the first employee in the draw
    if (draw.employeeIds.length > 0) {
      navigate("/tests", { state: { employeeId: draw.employeeIds[0] } });
    } else {
      toast.error("Nenhum colaborador encontrado no sorteio");
    }
  };

  return (
    <>
      <PageHeader 
        title="Sorteios" 
        description="Sorteio de colaboradores para testes" 
        action={{
          label: "Novo Sorteio",
          onClick: handleAddClick,
          icon: <Shuffle className="h-4 w-4" />,
        }}
      />

      <DrawTable 
        draws={draws}
        onDelete={handleDelete}
        onCreateTests={handleCreateTests}
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
