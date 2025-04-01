
import { useEffect, useState } from "react";
import { Employee, TestResult, DrawResult } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentTestsTable } from "@/components/dashboard/RecentTestsTable";
import { getEmployees, getTests, getDraws } from "@/lib/storage";
import { 
  Users, 
  Wine, 
  ClipboardCheck, 
  AlertTriangle, 
  Shuffle,
  CalendarClock
} from "lucide-react";
import { ChartCard } from "@/components/reports/ChartCard";
import { format, subDays, isWithinInterval } from "date-fns";

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [draws, setDraws] = useState<DrawResult[]>([]);
  const [recentTests, setRecentTests] = useState<TestResult[]>([]);

  useEffect(() => {
    const loadData = () => {
      setEmployees(getEmployees());
      setTests(getTests());
      setDraws(getDraws());
    };

    loadData();

    // Add event listener for storage changes
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
    };
  }, []);

  useEffect(() => {
    // Get the 5 most recent tests
    const sorted = [...tests].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setRecentTests(sorted.slice(0, 5));
  }, [tests]);

  // Calculate statistics
  const activeEmployees = employees.filter(e => e.active).length;
  const totalTests = tests.length;
  const positiveTests = tests.filter(t => t.result === "positive").length;
  const negativeTests = tests.filter(t => t.result === "negative").length;
  const totalDraws = draws.length;

  // Calculate recent statistics (last 30 days)
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);

  const recentTestsCount = tests.filter(test => 
    isWithinInterval(new Date(test.date), {
      start: thirtyDaysAgo,
      end: today
    })
  ).length;

  // Chart data
  const resultChartData = [
    { name: "Negativos", value: negativeTests, color: "#10b981" },
    { name: "Positivos", value: positiveTests, color: "#ef4444" },
  ];

  return (
    <>
      <PageHeader 
        title="Dashboard" 
        description="Visão geral dos testes e sorteios" 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard 
          title="Total de Colaboradores" 
          value={activeEmployees}
          description={`${employees.length} cadastrados (${activeEmployees} ativos)`}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard 
          title="Total de Testes" 
          value={totalTests}
          description={`${recentTestsCount} nos últimos 30 dias`}
          icon={<Wine className="h-4 w-4" />}
        />
        <StatCard 
          title="Total de Sorteios" 
          value={totalDraws}
          description={`${draws.length > 0 ? format(new Date(draws[draws.length - 1].date), "dd/MM/yyyy") : 'N/A'} (último sorteio)`}
          icon={<Shuffle className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Resultados dos Testes"
          description="Distribuição dos resultados positivos e negativos"
          data={resultChartData}
        />
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Testes Recentes</h2>
          <RecentTestsTable tests={recentTests} />
        </div>
      </div>
    </>
  );
}
