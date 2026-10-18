import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getDomainStats, getDailyActivity, getHourlyActivity, getProductivity } from '../api.js';

const CATEGORY_COLORS = {
  productive: '#22c55e',
  educational: '#38bdf8',
  news: '#a78bfa',
  shopping: '#fbbf24',
  social: '#f472b6',
  entertainment: '#f87171',
  other: '#6b7280'
};

export default function Dashboard() {
  const [domainStats, setDomainStats] = useState([]);
  const [daily, setDaily] = useState({});
  const [hourly, setHourly] = useState({});
  const [productivity, setProductivity] = useState(null);

  useEffect(() => {
    getDomainStats().then(setDomainStats);
    getDailyActivity().then(setDaily);
    getHourlyActivity().then(setHourly);
    getProductivity().then(setProductivity);
  }, []);

  const dailyData = Object.entries(daily).map(([day, count]) => ({ day, count }));
  const hourlyData = Object.entries(hourly).map(([hour, count]) => ({ hour: `${hour}:00`, count }));
  const topDomains = domainStats.slice(0, 10);

  const categoryPieData = productivity
    ? Object.entries(productivity.visitsByCategory).map(([category, count]) => ({ name: category, value: count }))
    : [];

  return (
    <div>
      {productivity && (
        <div className="card">
          <h3>Productivity Score</h3>
          <div className="score-circle" style={{ color: scoreColor(productivity.overallScore) }}>
            {productivity.overallScore.toFixed(1)} / 100
          </div>
          <p style={{ color: '#999', fontSize: '0.85rem' }}>
            Based on the mix of productive, educational, social, and entertainment sites you visited.
          </p>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <h3>Browsing Activity Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyData}>
              <XAxis dataKey="day" stroke="#888" fontSize={11} />
              <YAxis stroke="#888" fontSize={11} />
              <Tooltip contentStyle={{ background: '#171923', border: '1px solid #2a2d3a' }} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Hourly Usage Pattern</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyData}>
              <XAxis dataKey="hour" stroke="#888" fontSize={9} interval={2} />
              <YAxis stroke="#888" fontSize={11} />
              <Tooltip contentStyle={{ background: '#171923', border: '1px solid #2a2d3a' }} />
              <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Top Domains</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topDomains} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" stroke="#888" fontSize={11} />
              <YAxis type="category" dataKey="domain" stroke="#888" fontSize={10} width={120} />
              <Tooltip contentStyle={{ background: '#171923', border: '1px solid #2a2d3a' }} />
              <Bar dataKey="visitCount" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryPieData} dataKey="value" nameKey="name" outerRadius={90} label>
                {categoryPieData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ background: '#171923', border: '1px solid #2a2d3a' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function scoreColor(score) {
  if (score >= 65) return '#22c55e';
  if (score >= 40) return '#fbbf24';
  return '#f87171';
}
