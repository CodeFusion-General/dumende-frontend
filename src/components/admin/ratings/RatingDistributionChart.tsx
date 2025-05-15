
import React from 'react';
import {
  ChartContainer,
  ChartLegend,
  ChartTooltipContent
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface RatingDistributionChartProps {
  distribution: {
    name: string;
    count: number;
    color: string;
  }[];
  total: number;
}

const RatingDistributionChart: React.FC<RatingDistributionChartProps> = ({ distribution, total }) => {
  // Calculate percentages
  const data = distribution.map(item => ({
    ...item,
    percentage: Math.round((item.count / total) * 100) || 0
  }));

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4">Puan Dağılımı</h3>
      <div className="h-[350px] w-full bg-white rounded-md">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
            barCategoryGap={15}
            barSize={30}
          >
            <XAxis 
              type="number"
              tickFormatter={(value) => `${value}`}
              domain={[0, 'dataMax']}
              padding={{ left: 0, right: 10 }}
            />
            <YAxis 
              dataKey="name" 
              type="category"
              axisLine={false}
              tickLine={false}
              width={60}
              fontSize={14}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-md shadow-md p-2 text-sm">
                      <p className="font-medium">{`${payload[0].payload.count} kullanıcı bu puanı verdi`}</p>
                      <p>{`(${payload[0].payload.percentage}% oranında)`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RatingDistributionChart;
