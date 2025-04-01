
import { useEffect, useState } from "react";
import { TestResult, Employee, DrawResult } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/reports/DateRangePicker";
import { ChartCard } from "@/components/reports/ChartCard";
import { BarChartCard } from "@/components/reports/BarChartCard";
import { getTests, getEmployees, getDraws, exportToCSV } from "@/lib/storage";
import { toast } from "sonner";
import { FileDown, BarChart3, PieChart } from "lucide-react";
import { format, subMonths, isWithinInterval, startOfMonth, endOfMonth, getMonth, getYear } from "date-fns";

export default function Reports() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [draws, setDraws] = useState<DrawResult[]>([]);
  
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  const [filteredTests, setFilteredTests] = useState<TestResult[]>([]);

  useEffect(() => {
    loadData();

    // Add event listener for storage changes
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
    };
  }, []);

  useEffect(() => {
    // Filter tests by date range
    setFilteredTests(
      tests.filter((test) =>
        isWithinInterval(new Date(test.date), {
          start: startDate,
          end: endDate,
        })
      )
    );
  }, [tests, startDate, endDate]);

  const loadData = () => {
    setTests(getTests());
    setEmployees(getEmployees());
    setDraws(getDraws());
  };

  const handleRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleExportTests = () => {
    if (filteredTests.length === 0) {
      toast.error("Não há dados para exportar no período selecionado");
      return;
    }

    // Format the data for export
    const formattedData = filteredTests.map(test => ({
      Data: format(new Date(test.date), "dd/MM/yyyy"),
      Hora: test.time,
      Colaborador: test.employeeName,
      Resultado: test.result === "positive" ? "Positivo" : "Negativo",
      Observações: test.notes || "",
    }));

    exportToCSV(
      formattedData,
      `relatorio-testes-${format(startDate, "dd-MM-yyyy")}-a-${format(endDate, "dd-MM-yyyy")}.csv`
    );
    
    toast.success("Relatório exportado com sucesso");
  };

  // Prepare data for charts
  const positiveTestsCount = filteredTests.filter(test => test.result === "positive").length;
  const negativeTestsCount = filteredTests.filter(test => test.result === "negative").length;

  const resultChartData = [
    { name: "Negativos", value: negativeTestsCount, color: "#10b981" },
    { name: "Positivos", value: positiveTestsCount, color: "#ef4444" },
  ];

  // Prepare data for monthly bar chart
  const getMonthlyData = () => {
    const monthNames = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];
    
    const currentYear = getYear(new Date());
    const monthlyData: { [key: string]: { month: string; positive: number; negative: number } } = {};
    
    // Initialize data for all months in the current year
    monthNames.forEach((month, index) => {
      monthlyData[month] = { month, positive: 0, negative: 0 };
    });
    
    // Fill in the data from tests
    tests.forEach(test => {
      const testDate = new Date(test.date);
      const testYear = getYear(testDate);
      
      if (testYear === currentYear) {
        const monthIndex = getMonth(testDate);
        const monthName = monthNames[monthIndex];
        
        if (test.result === "positive") {
          monthlyData[monthName].positive += 1;
        } else {
          monthlyData[monthName].negative += 1;
        }
      }
    });
    
    return Object.values(monthlyData);
  };

  const monthlyData = getMonthlyData();

  return (
    <>
      <PageHeader 
        title="Relatórios" 
        description="Visualize e exporte relatórios dos testes" 
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione o período para visualizar os relatórios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onRangeChange={handleRangeChange}
            />
            <Button 
              onClick={handleExportTests}
              disabled={filteredTests.length === 0}
              className="w-full md:w-auto"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 mb-2 text-lg font-medium">
        Dados do período: {format(startDate, "dd/MM/yyyy")} até {format(endDate, "dd/MM/yyyy")}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Positivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positiveTestsCount}</div>
            {filteredTests.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {((positiveTestsCount / filteredTests.length) * 100).toFixed(1)}% do total
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Negativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{negativeTestsCount}</div>
            {filteredTests.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {((negativeTestsCount / filteredTests.length) * 100).toFixed(1)}% do total
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Resultados dos Testes"
          description="Distribuição dos resultados no período selecionado"
          data={resultChartData}
        />
        <BarChartCard
          title="Testes por Mês"
          description="Distribuição mensal dos testes no ano atual"
          data={monthlyData}
          xKey="month"
          bars={[
            { key: "negative", name: "Negativos", color: "#10b981" },
            { key: "positive", name: "Positivos", color: "#ef4444" },
          ]}
        />
      </div>
    </>
  );
}
