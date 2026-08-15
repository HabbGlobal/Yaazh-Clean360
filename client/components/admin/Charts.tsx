const CHART_COLORS = ["#36cfa0", "#8655ef", "#ec64ad", "#ffbd24", "#1d293d", "#5aa9e6", "#f08a24", "#7fc08a"];

export interface ChartDatum { label: string; value: number; title?: string; }

export function DonutChart({ data, size = 176, thickness = 26, centerTitle, centerValue }: { data: ChartDatum[]; size?: number; thickness?: number; centerTitle?: string; centerValue?: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let cursor = 0;
  const segments = data.map((item, index) => {
    const fraction = total ? item.value / total : 0;
    const segment = { ...item, color: CHART_COLORS[index % CHART_COLORS.length], fraction, dash: fraction * circumference, start: cursor };
    cursor += fraction;
    return segment;
  });
  return (
    <div className="admin-donut">
      <div className="admin-donut-wrap">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={centerTitle}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e7e1d1" strokeWidth={thickness} />
          {segments.map((segment) => segment.fraction > 0 && (
            <circle key={segment.label} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={segment.color} strokeWidth={thickness}
              strokeDasharray={`${segment.dash} ${circumference - segment.dash}`} strokeDashoffset={-(segment.start * circumference)}>
              {segment.title && <title>{segment.title}</title>}
            </circle>
          ))}
        </svg>
        <div className="admin-donut-center"><strong>{centerValue}</strong><span>{centerTitle}</span></div>
      </div>
      <ul className="admin-chart-legend">
        {segments.map((segment) => (
          <li key={segment.label}><i style={{ background: segment.color }} /><span>{segment.label}</span><b>{segment.value}</b></li>
        ))}
      </ul>
    </div>
  );
}

export function BarChart({ data, colors }: { data: ChartDatum[]; colors?: string[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <ul className="admin-bars">
      {data.map((item, index) => (
        <li key={item.label}>
          <span className="admin-bar-label">{item.label}</span>
          <span className="admin-bar-track"><i style={{ width: `${Math.round((item.value / max) * 100)}%`, background: (colors || CHART_COLORS)[index % (colors || CHART_COLORS).length] }} /></span>
          <b>{item.value}</b>
        </li>
      ))}
    </ul>
  );
}

export function TrendChart({ data, color = "#8655ef" }: { data: ChartDatum[]; color?: string }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const count = Math.max(data.length, 1);
  return (
    <div className="admin-trend">
      <div className="admin-trend-values">{data.map((item) => <span key={item.label}>{item.value}</span>)}</div>
      <svg className="admin-trend-svg" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Activity over the last 7 days">
        {data.map((item, index) => {
          const height = item.value ? Math.max((item.value / max) * 92, 8) : 2;
          const x = (index / count) * 100 + 1.5;
          const width = 100 / count - 3;
          return <rect key={item.label} x={x} y={100 - height} width={width} height={height} fill={color}>{item.title && <title>{item.title}</title>}</rect>;
        })}
      </svg>
      <div className="admin-trend-labels">{data.map((item) => <span key={item.label}>{item.label}</span>)}</div>
    </div>
  );
}