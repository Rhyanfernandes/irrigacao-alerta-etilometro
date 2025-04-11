
import { useEffect, useState } from "react";
import { Employee } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { getEmployees, saveEmployee, deleteEmployee } from "@/lib/storage";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { useSite } from "@/context/SiteContext";
import { useAuth } from "@/context/AuthContext";

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { selectedSiteId, currentSite, isViewingAllSites } = useSite();
  const { user } = useAuth();

  useEffect(() => {
    console.log("Employees page - site selecionado:", selectedSiteId);
    console.log("Employees page - site atual:", currentSite);
    console.log("Employees page - visualizando todas as obras:", isViewingAllSites);
    loadEmployees();

    // Add event listener for storage changes
    window.addEventListener("storage", loadEmployees);

    return () => {
      window.removeEventListener("storage", loadEmployees);
    };
  }, [selectedSiteId, isViewingAllSites]); // Recarregar quando a obra selecionada ou visualização mudar

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      console.log('Colaboradores carregados:', data);
      
      // Se for usuário de obra, filtra apenas os funcionários da obra
      if (user?.role === 'site' && user.siteId) {
        const filteredEmployees = data.filter(emp => emp.siteId === user.siteId);
        setEmployees(filteredEmployees);
      } 
      // Se for usuário master e tiver uma obra selecionada, filtra por essa obra
      else if (user?.role === 'master' && selectedSiteId && !isViewingAllSites) {
        console.log('Filtrando apenas colaboradores da obra:', selectedSiteId);
        const filteredEmployees = data.filter(emp => emp.siteId === selectedSiteId);
        setEmployees(filteredEmployees);
      }
      // Caso contrário, mostra todos
      else {
        setEmployees(data);
      }
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

  // Determinar o título da página
  const pageTitle = isViewingAllSites
    ? "Colaboradores - Todas as Obras"
    : currentSite
    ? `Colaboradores - ${currentSite.name}`
    : "Colaboradores";

  return (
    <>
      <PageHeader 
        title={pageTitle} 
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
