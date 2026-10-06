import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PlatformAnalytics } from '@/types'

const AXIS = { stroke: '#6B7280', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0b0f0b',
    border: '1px solid #1c261c',
    borderRadius: 10,
    fontSize: 12,
    fontFamily: 'JetBrains Mono, monospace',
    color: '#f5f7f5',
  },
  labelStyle: { color: '#9CA3AF' },
  cursor: { fill: 'rgba(34,197,94,0.06)' },
}

const DIFFICULTY_COLORS = { easy: '#22C55E', medium: '#FBBF24', hard: '#FB7185' }

export function ContributionsOverTime({ data }: { data: PlatformAnalytics['contributionsOverTime'] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#22C55E" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1c261c" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={AXIS} tickLine={false} axisLine={{ stroke: '#1c261c' }} />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Area
            type="monotone"
            dataKey="contributions"
            name="Merged PRs"
            stroke="#22C55E"
            strokeWidth={2}
            fill="url(#xpFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DifficultyDistribution({ data }: { data: PlatformAnalytics['difficultyDistribution'] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="difficulty"
            innerRadius={54}
            outerRadius={86}
            paddingAngle={3}
            stroke="#0b0f0b"
          >
            {data.map((entry) => (
              <Cell key={entry.difficulty} fill={DIFFICULTY_COLORS[entry.difficulty]} />
            ))}
          </Pie>
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#9CA3AF', fontSize: 12, textTransform: 'capitalize' }}>
                {String(value)} · {total ? Math.round((data.find((d) => d.difficulty === value)?.count ?? 0) / total * 100) : 0}%
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ProjectActivity({ data }: { data: PlatformAnalytics['projectActivity'] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#1c261c" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={AXIS} tickLine={false} axisLine={{ stroke: '#1c261c' }} interval={0} angle={-18} textAnchor="end" height={46} />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Bar dataKey="contributions" name="Contributions" fill="#2F8D46" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function XpDistribution({ data }: { data: PlatformAnalytics['xpDistribution'] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#1c261c" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="range" tick={AXIS} tickLine={false} axisLine={{ stroke: '#1c261c' }} />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Bar dataKey="participants" name="Participants" fill="#86EFAC" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
