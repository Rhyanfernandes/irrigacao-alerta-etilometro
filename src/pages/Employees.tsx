
import { useEffect, useState } from "react";
import { Employee } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { getEmployees, saveEmployee, deleteEmployee } from "@/lib/storage";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { useSite } from "@/context/SiteContext";

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { selectedSiteId } = useSite();

  useEffect(() => {
    loadEmployees();

    // Add event listener for storage changes
    window.addEventListener("storage", loadEmployees);

    return () => {
      window.removeEventListener("storage", loadEmployees);
    };
  }, [selectedSiteId]); // Recarregar quando a obra selecionada mudar

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
      console.log('Colaboradores carregados:', data);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Erro ao carregar colaboradores");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingEmployee(undefined);
    setFormOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  const handleSave = async (employee: Employee) => {
    try {
      console.log('Salvando colaborador:', employee);
      await saveEmployee(employee);
      await loadEmployees();
      toast.success("Colaborador salvo com sucesso");
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error("Erro ao salvar colaborador");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmployee(id);
      await loadEmployees();
      toast.success("Colaborador excluído com sucesso");
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Erro ao excluir colaborador");
    }
  };

  return (
    <>
      <PageHeader 
        title="Colaboradores" 
        description="Gerencie os colaboradores da empresa" 
        action={{
          label: "Novo Colaborador",
          onClick: handleAddClick,
          icon: <UserPlus className="h-4 w-4" />,
        }}
      />

      <EmployeeTable 
        employees={employees}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <EmployeeForm 
        open={formOpen}
        setOpen={setFormOpen}
        employee={editingEmployee}
        onSave={handleSave}
      />
    </>
  );
}
