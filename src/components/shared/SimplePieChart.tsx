import React from "react";

interface PieChartData {
    label: string;
    value: number;
    color: string;
}

interface SimplePieChartProps {
    title: string;
    data: PieChartData[];
    size?: number;
}

const SimplePieChart: React.FC<SimplePieChartProps> = ({ title, data, size = 200 }) => {
    const total = data.reduce((acc, cur) => acc + cur.value, 0);
    let currentAngle = 0;

    // If no data, show a gray circle
    if (total === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-xl border w-full flex flex-col items-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>
                <div className="rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium"
                    style={{ width: size, height: size }}>
                    No Data
                </div>
            </div>
        );
    }


    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border w-full flex flex-col items-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>

            <div className="relative" style={{ width: size, height: size }}>
                {/* SVG Path Approach (Robust for Tailwind classes) */}
                <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
                    {data.map((d, i) => {
                        const percentage = d.value / total;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + (percentage * 2 * Math.PI);

                        const x1 = Math.cos(startAngle);
                        const y1 = Math.sin(startAngle);
                        const x2 = Math.cos(endAngle);
                        const y2 = Math.sin(endAngle);

                        // Large arc flag
                        const largeArc = percentage > 0.5 ? 1 : 0;

                        // Path command
                        const pathData = `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`;

                        currentAngle = endAngle;

                        // Tailwind color mapping helper required or pass className
                        // If d.color is 'bg-green-500', we can use className="fill-green-500" if configured or just use standard CSS fill.
                        // Let's assume d.color passes 'text-green-500' or we map.
                        // Actually, 'bg-green-500' works if we use 'currentColor' and set className text color.

                        const colorClass = d.color.replace('bg-', 'text-');

                        return (
                            <path d={pathData} className={`${colorClass} fill-current transition-all duration-300 hover:opacity-80`} key={i} />
                        );
                    })}
                </svg>

                {/* Donut Hole */}
                <div className="absolute inset-0 m-auto bg-white rounded-full w-3/5 h-3/5 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold text-gray-800">{total}</span>
                    <span className="text-xs text-gray-500">Total</span>
                </div>

            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${d.color}`}></span>
                        <span className="text-sm text-gray-600 font-medium">{d.label} ({d.value})</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimplePieChart;
