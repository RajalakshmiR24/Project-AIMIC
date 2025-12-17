import React from "react";

interface BarChartData {
    label: string;
    value: number;
    color: string;
}

interface SimpleBarChartProps {
    title: string;
    data: BarChartData[];
    height?: number;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ title, data, height = 250 }) => {
    const maxValue = Math.max(...data.map((d) => d.value), 1); // Prevent division by zero

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>

            <div
                className="flex items-end justify-around w-full gap-4"
                style={{ height: `${height}px` }}
            >
                {data.map((d, index) => {
                    // Max height 85% to leave room for label
                    const percentage = Math.round((d.value / maxValue) * 85);
                    const displayHeight = d.value === 0 ? "2%" : `${percentage}%`;

                    return (
                        <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group relative">

                            {/* Tooltip */}
                            <div className="absolute -top-10 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 mb-2">
                                {d.label}: {d.value}
                            </div>

                            {/* Bar */}
                            <div
                                className={`w-full max-w-[60px] rounded-t-lg transition-all duration-700 ease-out hover:opacity-90 ${d.color}`}
                                style={{ height: displayHeight }}
                            ></div>

                            {/* Label */}
                            <div className="text-center mt-3">
                                <p className="text-xs font-bold text-gray-600 truncate max-w-[80px]">{d.label}</p>
                                <p className="text-sm font-bold text-gray-800">{d.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SimpleBarChart;
