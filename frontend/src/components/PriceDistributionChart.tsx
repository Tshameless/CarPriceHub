/**
 * 价格分布图表组件
 * 展示品牌或车型的价格分布情况
 */
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Spin, Empty, Radio, Space, Typography } from 'antd';
import type { EChartsOption } from 'echarts';
import type { Car } from '../types';

const { Title } = Typography;

interface PriceDistributionChartProps {
  cars: Car[];
  loading?: boolean;
  height?: number;
  groupBy?: 'brand' | 'energy' | 'body';
  onGroupByChange?: (value: 'brand' | 'energy' | 'body') => void;
}

const PriceDistributionChart: React.FC<PriceDistributionChartProps> = ({
  cars,
  loading = false,
  height = 400,
  groupBy = 'brand',
  onGroupByChange,
}) => {
  // 分组统计价格分布
  const chartData = useMemo(() => {
    const groups = new Map<string, { min: number; max: number; avg: number; count: number; prices: number[] }>();

    cars.forEach(car => {
      let key: string;
      switch (groupBy) {
        case 'brand':
          key = car.brand;
          break;
        case 'energy':
          key = car.energy_type;
          break;
        case 'body':
          key = car.body_type;
          break;
        default:
          key = car.brand;
      }

      if (!groups.has(key)) {
        groups.set(key, { min: Infinity, max: -Infinity, avg: 0, count: 0, prices: [] });
      }

      const group = groups.get(key)!;
      const price = car.price_discount || car.price_official;
      group.prices.push(price);
      group.min = Math.min(group.min, price);
      group.max = Math.max(group.max, price);
      group.count++;
    });

    // 计算平均值并排序
    const data = Array.from(groups.entries())
      .map(([name, stats]) => ({
        name,
        min: stats.min,
        max: stats.max,
        avg: stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length,
        count: stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 只显示前10个

    return data;
  }, [cars, groupBy]);

  // 图表配置
  const chartOption: EChartsOption = useMemo(() => {
    if (chartData.length === 0) {
      return {};
    }

    return {
      title: {
        text: '价格分布',
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const data = params[0];
          const item = chartData[data.dataIndex];
          return `
            <div style="font-weight:bold;margin-bottom:8px">${data.name}</div>
            <div>最低价：<span style="color:#52c41a;font-weight:bold">${item.min.toFixed(2)}万</span></div>
            <div>平均价：<span style="color:#1890ff;font-weight:bold">${item.avg.toFixed(2)}万</span></div>
            <div>最高价：<span style="color:#ff4d4f;font-weight:bold">${item.max.toFixed(2)}万</span></div>
            <div>车型数量：${item.count}款</div>
          `;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: chartData.map(d => d.name),
        axisLabel: {
          interval: 0,
          rotate: 30,
        },
      },
      yAxis: {
        type: 'value',
        name: '价格（万元）',
        axisLabel: {
          formatter: '{value}万',
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: '价格范围',
          type: 'boxplot',
          data: chartData.map(d => [d.min, d.avg, d.avg, d.avg, d.max]),
          itemStyle: {
            color: '#1890ff',
            borderColor: '#1890ff',
          },
        },
        {
          name: '平均价',
          type: 'line',
          data: chartData.map(d => d.avg),
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 0,
          },
          itemStyle: {
            color: '#ff7875',
          },
        },
      ],
    };
  }, [chartData]);

  if (loading) {
    return (
      <Card>
        <Spin tip="加载中...">
          <div style={{ height: height }} />
        </Spin>
      </Card>
    );
  }

  if (cars.length === 0) {
    return (
      <Card>
        <Empty description="暂无数据" />
      </Card>
    );
  }

  return (
    <Card>
      {/* 控制栏 */}
      <div style={{ marginBottom: 16 }}>
        <Radio.Group value={groupBy} onChange={e => onGroupByChange?.(e.target.value)}>
          <Radio.Button value="brand">按品牌</Radio.Button>
          <Radio.Button value="energy">按能源类型</Radio.Button>
          <Radio.Button value="body">按车身类型</Radio.Button>
        </Radio.Group>
      </div>

      {/* 图表 */}
      <ReactECharts
        option={chartOption}
        style={{ height: height }}
        opts={{ renderer: 'svg' }}
      />
    </Card>
  );
};

export default PriceDistributionChart;
