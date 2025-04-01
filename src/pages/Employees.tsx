
import { useEffect, useState } from "react";
import { Employee } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { getEmployees, saveEmployee, deleteEmployee } from "@/lib/storage";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);

  useEffect(() => {
    loadEmployees();

    // Add event listener for storage changes
    window.addEventListener("storage", loadEmployees);

    return () => {
      window.removeEventListener("storage", loadEmployees);
    };
  }, []);

  const loadEmployees = () => {
    setEmployees(getEmployees());
  };

  const handleAddClick = () => {
    setEditingEmployee(undefined);
    setFormOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  const handleSave = (employee: Employee) => {
    saveEmployee(employee);
    loadEmployees();
  };

  const handleDelete = (id: string) => {
    deleteEmployee(id);
    loadEmployees();
    toast.success("Colaborador excluído com sucesso");
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
