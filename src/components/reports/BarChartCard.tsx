
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface BarChartCardProps {
  title: string;
  description?: string;
  data: any[];
  xKey: string;
  bars: Array<{ key: string; name: string; color: string }>;
}

export function BarChartCard({ title, description, data, xKey, bars }: BarChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} />
              <XAxis dataKey={xKey} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              {bars.map((bar, index) => (
                <Bar
                  key={`bar-${index}`}
                  dataKey={bar.key}
                  name={bar.name}
                  fill={bar.color}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
