import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const modelData = [
  { label: "YMCA - Canada", model: "openai-gpt-4.1-nano", value: 12 },
  { label: "YMCA - US", model: "openai-gpt-4.1", value: 8 },
  { label: "YMCA - Europe", model: "openai-o3-mini", value: 5 },
  { label: "YMCA - France", model: "anthropic-claude-3.7", value: 3 },
  { label: "YMCA - Germany", model: "google-gemini-2.0", value: 7 },
  { label: "YMCA - Spain", model: "google-gemini-pro", value: 4 },
  { label: "YMCA - Italy", model: "xai-grok-3-mini", value: 2 },
  { label: "YMCA - United Kingdom", model: "xai-grok2", value: 6 },
];

const pieData = [
  { name: 'Active', value: 18 },
  { name: 'Inactive', value: 6 },
  { name: 'Pending', value: 3 },
];

const COLORS = ['#2563eb', '#f59e42', '#10b981', '#f43f5e', '#6366f1', '#fbbf24', '#14b8a6', '#a21caf'];

export default function ModelUsageCharts() {
  return (
    <div className="flex justify-around md:flex-row gap-8 w-full items-center mt-8">
      <div className="bg-white rounded-lg shadow p-4 w-full max-w-lg">
        <h3 className="font-semibold mb-2">Model Usage (Bar)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={modelData}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb">
              {modelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-lg shadow p-4 w-full max-w-xs">
        <h3 className="font-semibold mb-2">Status Distribution (Pie)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-pie-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
