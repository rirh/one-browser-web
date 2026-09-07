import * as echarts from 'echarts';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';

import { ResourceDistributionChart } from './charts';

const captured = vi.hoisted(() => ({
  option: {} as echarts.EChartsCoreOption,
}));
vi.mock('@/components/echarts-chart', () => ({
  EChartsChart: ({ option }: { option: echarts.EChartsCoreOption }) => {
    captured.option = option;
    return null;
  },
}));
vi.mock('@/components/theme/runtime', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}));
afterEach(() => vi.unstubAllGlobals());

it('keeps OKLCH-colored bars visible through hover and mouseout', () => {
  const primary = 'oklch(0.5645 0.163 253.27)';
  vi.stubGlobal('window', {});
  vi.stubGlobal('document', { documentElement: {} });
  vi.stubGlobal('getComputedStyle', () => ({
    getPropertyValue: () => primary,
  }));
  renderToStaticMarkup(
    <ResourceDistributionChart
      data={[{ key: 'versions', label: '版本', value: 4 }]}
      metrics={[]}
      onNavigate={() => {}}
    />,
  );
  vi.unstubAllGlobals();

  const chart = echarts.init(null, undefined, {
    renderer: 'svg',
    ssr: true,
    width: 500,
    height: 240,
  });
  try {
    chart.setOption({ ...captured.option, animation: false });
    chart.renderToSVGString();
    const bar = chart
      .getZr()
      .storage.getDisplayList()
      .find(
        (element) =>
          element instanceof echarts.graphic.Rect &&
          element.style.fill === primary,
      );
    expect(bar).toBeDefined();
    if (!bar) throw new Error('Resource bar was not rendered');
    // Apply the same emphasis state used by pointer hover, including ECharts' state proxy.
    bar.useState('emphasis');
    expect(chart.renderToSVGString()).toContain(`fill="${primary}"`);
    bar.clearStates();
    expect(chart.renderToSVGString()).toContain(`fill="${primary}"`);
  } finally {
    chart.dispose();
  }
});
