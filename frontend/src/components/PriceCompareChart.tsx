/**
 * 多车型价格对比图表组件
 * 对比多个车型的价格走势
 */
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Spin, Empty, Select, Space, Button, Typography } from 'antd';
import type { EChartsOption } from 'echarts';
import dayjs from 'dayjs';
import type { PriceTrend } from '../types';

const { Text } = Typography;

interface PriceCompareChartProps {
  priceTrends: PriceTrend[];
  loading?: boolean;
  height?: number;
  onRemoveCar?: (carId: string) => void;
}

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1', '#13c2c2'];

const PriceCompareChart: React.FC<PriceCompareChartProps> = ({
  priceTrends,
  loading = false,
  height = 450,
  onRemoveCar,
}) => {
  // 合并所有日期
  const allDates = useMemo(() => {
    const dateSet = new Set<string>();
    priceTrends.forEach(trend => {
      trend.dealer_prices.forEach(p => dateSet.add(p.date));
    });
    return Array.from(dateSet).sort();
  }, [priceTrends]);

  // 图表配置
  const chartOption: EChartsOption = useMemo(() => {
    if (priceTrends.length === 0) {
      return {};
    }

    // 为每个车型创建系列
    const series = priceTrends.map((trend, index) => {
      // 创建价格映射
      const priceMap = new Map<string, number>();
      trend.dealer_prices.forEach(p => priceMap.set(p.date, p.price));

      // 填充所有日期的价格数据
      const prices = allDates.map(date => priceMap.get(date) || null);

      return {
        name: trend.car_name,
        type: 'line',
        data: prices,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2,
        },
        itemStyle: {
          color: COLORS[index % COLORS.length],
        },
        connectNulls: true, // 连接空值
      };
    });

    return {
      title: {
        text: '多车型价格对比',
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        formatter: (params: any) => {
          const date = params[0].axisValue;
          let html = `<div style="font-weight:bold;margin-bottom:8px">${date}</div>`;
          params.forEach((item: any) => {
            if (item.value !== null) {
              const color = item.color;
              const name = item.seriesName;
              const value = item.value;
              html += `
                <div style="display:flex;align-items:center;margin:4px 0">
                  <span style="display:inline-block;width:10px;height:10px;background:${color};border-radius:50%;margin-right:8px"></span>
                  <span style="flex:1">${name}:</span>
                  <span style="font-weight:bold;margin-left:8px">${value.toFixed(2)}万</span>
                </div>
              `;
            }
          });
          return html;
        },
      },
      legend: {
        data: priceTrends.map(t => t.car_name),
        bottom: 10,
        type: 'scroll',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: allDates,
        axisLabel: {
          formatter: (value: string) => dayjs(value).format('MM-DD'),
          rotate: 45,
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
      series,
    };
  }, [priceTrends, allDates]);

  if (loading) {
    return (
      <Card>
        <Spin tip="加载中...">
          <div style={{ height: height }} />
        </Spin>
      </Card>
    );
  }

  if (priceTrends.length === 0) {
    return (
      <Card>
        <Empty description="暂无对比数据" />
      </Card>
    );
  }

  return (
    <Card>
      {/* 车型列表 */}
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          {priceTrends.map((trend, index) => (
            <Space key={trend.car_id}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: COLORS[index % COLORS.length],
                }}
              />
              <Text>{trend.car_name}</Text>
              {onRemoveCar && (
                <Button
                  type="text"
                  size="small"
                  danger
                  onClick={() => onRemoveCar(trend.car_id)}
                >
                  移除
                </Button>
              )}
            </Space>
          ))}
        </Space>
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

export default PriceCompareChart;
