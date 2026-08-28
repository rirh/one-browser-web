import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import type { EChartsCoreOption } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import * as React from 'react';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  SVGRenderer,
]);

export function EChartsChart({
  option,
  className,
  onItemClick,
}: {
  option: EChartsCoreOption;
  className?: string;
  onItemClick?: (name: string) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = echarts.init(container, undefined, { renderer: 'svg' });
    chart.setOption(option, { notMerge: true });
    const click = (params: { name?: string }) => {
      if (params.name) onItemClick?.(params.name);
    };
    chart.on('click', click);
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.off('click', click);
      chart.dispose();
    };
  }, [onItemClick, option]);

  return <div ref={containerRef} className={className} />;
}
