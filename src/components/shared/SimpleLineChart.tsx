import React from "react";

interface LineChartData {
    label: string;
    value: number;
}

interface SimpleLineChartProps {
    title: string;
    data: LineChartData[];
    height?: number;
    color?: string; // Tailwind text color class, e.g., 'text-blue-500'
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
    title,
    data,
    height = 250,
    color = "text-blue-600"
}) => {
    if (data.length < 2) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-xl border w-full">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>
                <div className="flex items-center justify-center h-48 text-gray-400">
                    Not enough data for trend
                </div>
            </div>
        );
    }

    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1; // Avoid zero division

    // SVG Coordinate calculation
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.value - min) / range) * 80 - 10; // Reserve 10% padding top/bottom
        return `${x},${y}`;
    }).join(" ");

    const bgGradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

    // Area Path (Close the loop for fill)
    const areaPoints = `${points} 100,100 0,100`;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>

            <div className="relative w-full" style={{ height: `${height}px` }}>
                {/* Y-Axis Labels (Min/Max) */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 pointer-events-none">
                    <span>{max}</span>
                    <span>{Math.round((max + min) / 2)}</span>
                    <span>{min}</span>
                </div>

                {/* Chart Area */}
                <div className="ml-8 h-full relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">

                        {/* Gradient Definition */}
                        <defs>
                            <linearGradient id={bgGradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="currentColor" className={color} stopOpacity="0.2" />
                                <stop offset="100%" stopColor="currentColor" className={color} stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        <line x1="0" y1="10" x2="100" y2="10" stroke="#f3f4f6" strokeWidth="0.5" />
                        <line x1="0" y1="50" x2="100" y2="50" stroke="#f3f4f6" strokeWidth="0.5" />
                        <line x1="0" y1="90" x2="100" y2="90" stroke="#f3f4f6" strokeWidth="0.5" />

                        {/* Area Fill */}
                        <polygon points={areaPoints} fill={`url(#${bgGradientId})`} />

                        {/* Line */}
                        <polyline
                            points={points}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={color}
                            vectorEffect="non-scaling-stroke"
                        />

                        {/* Data Points */}
                        {data.map((d, i) => {
                            const x = (i / (data.length - 1)) * 100;
                            const y = 100 - ((d.value - min) / range) * 80 - 10;
                            return (
                                <circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r="1.5"
                                    className={`${color} fill-white stroke-current group hover:r-2 transition-all cursor-pointer`}
                                    strokeWidth="1"
                                >
                                    <title>{d.label}: {d.value}</title>
                                </circle>
                            );
                        })}
                    </svg>
                </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2 ml-8 text-xs text-gray-500">
                {data.map((d, i) => (
                    <span key={i} className="" style={{ textAlign: 'center' }}>{d.label}</span> // Simple labels
                ))}
            </div>
        </div>
    );
};

export default SimpleLineChart;
