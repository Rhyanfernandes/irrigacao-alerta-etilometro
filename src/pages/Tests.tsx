
import { useEffect, useState } from "react";
import { Employee, TestResult } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { TestTable } from "@/components/tests/TestTable";
import { TestForm } from "@/components/tests/TestForm";
import { TestDetails } from "@/components/tests/TestDetails";
import { getEmployees, getTests, saveTest, deleteTest } from "@/lib/storage";
import { toast } from "sonner";
import { ClipboardPlus } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Tests() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestResult | undefined>(undefined);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  
  const location = useLocation();
  
  useEffect(() => {
    loadData();

    // Add event listener for storage changes
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
    };
  }, []);
  
  useEffect(() => {
    // Check if we have an employee ID in the location state (from Draw page)
    if (location.state && location.state.employeeId) {
      setSelectedEmployeeId(location.state.employeeId);
      setFormOpen(true);
    }
  }, [location.state]);

  const loadData = () => {
    setTests(getTests());
    setEmployees(getEmployees());
  };

  const handleAddClick = () => {
    setEditingTest(undefined);
    setSelectedEmployeeId(undefined);
    setFormOpen(true);
  };

  const handleEdit = (test: TestResult) => {
    setEditingTest(test);
    setSelectedEmployeeId(undefined);
    setFormOpen(true);
  };

  const handleViewDetails = (test: TestResult) => {
    setSelectedTest(test);
    setDetailsOpen(true);
  };

  const handleSave = (test: TestResult) => {
    saveTest(test);
    loadData();
  };

  const handleDelete = (id: string) => {
    deleteTest(id);
    loadData();
    toast.success("Teste excluído com sucesso");
  };

  return (
    <>
      <PageHeader 
        title="Testes de Etilômetro - irricom" 
        description="Gerencie os resultados dos testes" 
        action={{
          label: "Novo Teste",
          onClick: handleAddClick,
          icon: <ClipboardPlus className="h-4 w-4" />,
        }}
      />

      <TestTable 
        tests={tests}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
      />

      <TestForm 
        open={formOpen}
        setOpen={setFormOpen}
        employees={employees}
        test={editingTest}
        onSave={handleSave}
        selectedEmployeeId={selectedEmployeeId}
      />

      <TestDetails
        test={selectedTest}
        open={detailsOpen}
        setOpen={setDetailsOpen}
      />
    </>
  );
}
