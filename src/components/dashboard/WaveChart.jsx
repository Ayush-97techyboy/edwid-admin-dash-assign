import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';

const WaveChart = ({ data, color = "#4F46E5", labels = [] }) => {
  const { t } = useTranslation();
  const { t: appT } = useAppContext();
  const [tooltip, setTooltip] = useState(null);
  
  if (!data || data.length === 0) return null;
  
  let pointsData = [...data];
  if (pointsData.length < 2) {
    if (pointsData.length === 1) pointsData.push(pointsData[0]);
    else pointsData = [0, 0];
  }

  const height = 200;
  const width = 800;
  
  pointsData = pointsData.map(val => Number(val) || 0);
  
  const max = Math.max(...pointsData);
  const min = Math.min(...pointsData);
  const range = (max - min) || 1;
  
  const monthNames = [
    t('monthJan') || 'Jan',
    t('monthFeb') || 'Feb',
    t('monthMar') || 'Mar',
    t('monthApr') || 'Apr',
    t('monthMay') || 'May',
    t('monthJun') || 'Jun',
    t('monthJul') || 'Jul',
    t('monthAug') || 'Aug',
    t('monthSep') || 'Sep',
    t('monthOct') || 'Oct',
    t('monthNov') || 'Nov',
    t('monthDec') || 'Dec'
  ];
  
  const points = pointsData.map((val, i) => {
    const x = (i / (pointsData.length - 1)) * width;
    const y = height - ((val - min) / range) * (height * 0.75);
    const monthLabel = monthNames[i];
    return {x, y, value: val, label: monthLabel};
  });

  const line = (pointA, pointB) => {
    const lengthX = pointB.x - pointA.x;
    const lengthY = pointB.y - pointA.y;
    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX)
    };
  };

  const controlPoint = (current, previous, next, reverse) => {
    const p = previous || current;
    const n = next || current;
    const smoothing = 0.2;
    const o = line(p, n);
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;
    const x = current.x + Math.cos(angle) * length;
    const y = current.y + Math.sin(angle) * length;
    return { x, y };
  };

  const bezierCommand = (point, i, a) => {
    const cps = controlPoint(a[i - 1], a[i - 2], point);
    const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cps.x},${cps.y} ${cpe.x},${cpe.y} ${point.x},${point.y}`;
  };

  const d = points.reduce((acc, point, i, a) => i === 0 ? `M ${point.x},${point.y}` : `${acc} ${bezierCommand(point, i, a)}`, "");
  const fillD = `${d} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="relative w-full h-full flex flex-col">
      <svg viewBox={`0 0 ${width} ${height + 30}`} className="w-full flex-1 overflow-hidden">
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={fillD} fill="url(#gradient)" stroke="none" />
        <path d={d} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
        
        {/* Month labels at bottom */}
        {points.map((p, i) => (
          <text
            key={`label-${i}`}
            x={p.x}
            y={height + 18}
            textAnchor="middle"
            className="text-xs fill-gray-500"
            fontSize="11"
          >
            {p.label}
          </text>
        ))}
        
        {/* Data points */}
        {points.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setTooltip({
              x: p.x,
              y: p.y,
              value: p.value,
              label: p.label
            })}
            onMouseLeave={() => setTooltip(null)}
            className="cursor-pointer"
          >
            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2" />
            <circle cx={p.x} cy={p.y} r="8" fill={color} fillOpacity="0" className="hover:fill-opacity-10 transition-all" />
          </g>
        ))}
      </svg>
      
      {/* Tooltip */}
      {tooltip && (
        <div 
          className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap pointer-events-none"
          style={{
            left: `${(tooltip.x / width) * 100}%`,
            top: `${(tooltip.y / (height + 30)) * 100}%`,
            transform: 'translate(-50%, -120%)'
          }}
        >
          <div className="font-semibold">{tooltip.label}</div>
          <div className="text-xs text-gray-300">{tooltip.value.toLocaleString()} {t('views')}</div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};
export default WaveChart;
