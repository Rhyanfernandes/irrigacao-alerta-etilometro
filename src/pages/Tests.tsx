
import { useEffect, useState } from "react";
import { Employee, TestResult } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { TestTable } from "@/components/tests/TestTable";
import { TestForm } from "@/components/tests/TestForm";
import { TestDetails } from "@/components/tests/TestDetails";
import { getEmployees, getTests, saveTest, deleteTest } from "@/lib/storage";
import { toast } from "sonner";
import { ClipboardPlus, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Tests() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [filteredTests, setFilteredTests] = useState<TestResult[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestResult | undefined>(undefined);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>(undefined);
  const [employeeName, setEmployeeName] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  
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
    if (location.state) {
      if (location.state.employeeId) {
        setSelectedEmployeeId(location.state.employeeId);
        setFormOpen(true);
      } else if (location.state.employeeFilter) {
        // Filter tests for a specific employee
        setEmployeeFilter(location.state.employeeFilter);
        setEmployeeName(location.state.employeeName);
      }
    }
  }, [location.state]);

  useEffect(() => {
    // Filter tests by employee if needed
    if (employeeFilter) {
      setFilteredTests(tests.filter(test => test.employeeId === employeeFilter));
    } else {
      setFilteredTests(tests);
    }
  }, [tests, employeeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [testsData, employeesData] = await Promise.all([
        getTests(),
        getEmployees()
      ]);
      setTests(testsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
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

  const handleSave = async (test: TestResult) => {
    try {
      await saveTest(test);
      await loadData();
      toast.success("Teste salvo com sucesso");
    } catch (error) {
      console.error("Error saving test:", error);
      toast.error("Erro ao salvar teste");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTest(id);
      await loadData();
      toast.success("Teste excluído com sucesso");
    } catch (error) {
      console.error("Error deleting test:", error);
      toast.error("Erro ao excluir teste");
    }
  };

  const clearEmployeeFilter = () => {
    setEmployeeFilter(undefined);
    setEmployeeName(undefined);
    navigate('/tests', { replace: true });
  };

  return (
    <>
      <PageHeader 
        title={employeeFilter ? `Testes de ${employeeName}` : "Testes de Etilômetro - irricom"} 
        description={employeeFilter ? "Gerenciando testes para este colaborador" : "Gerencie os resultados dos testes"} 
        action={{
          label: "Novo Teste",
          onClick: handleAddClick,
          icon: <ClipboardPlus className="h-4 w-4" />,
        }}
      />

      {employeeFilter && (
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={clearEmployeeFilter}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para todos os testes
          </Button>
        </div>
      )}

      <TestTable 
        tests={filteredTests}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
        loading={loading}
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
