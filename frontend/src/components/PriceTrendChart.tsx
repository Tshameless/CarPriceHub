/**
 * 价格趋势图表组件
 * 使用 ECharts 展示车型价格历史趋势
 */
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Spin, Empty, Select, Space, Typography } from 'antd';
import type { EChartsOption } from 'echarts';
import dayjs from 'dayjs';
import type { PriceTrend, PricePoint } from '../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface PriceTrendChartProps {
  priceTrend: PriceTrend | null;
  loading?: boolean;
  height?: number;
  showControls?: boolean;
}

const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  priceTrend,
  loading = false,
  height = 400,
  showControls = true,
}) => {
  // 图表配置
  const chartOption: EChartsOption = useMemo(() => {
    if (!priceTrend) {
      return {};
    }

    // 提取日期和价格数据
    const dates = priceTrend.official_prices.map(p => p.date);
    const officialPrices = priceTrend.official_prices.map(p => p.price);
    const dealerPrices = priceTrend.dealer_prices.map(p => p.price);

    return {
      title: {
        text: `${priceTrend.car_name} 价格趋势`,
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
          });
          return html;
        },
      },
      legend: {
        data: ['官方指导价', '经销商价格'],
        bottom: 10,
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
        data: dates,
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
      series: [
        {
          name: '官方指导价',
          type: 'line',
          data: officialPrices,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
          },
          itemStyle: {
            color: '#1890ff',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
              ],
            },
          },
        },
        {
          name: '经销商价格',
          type: 'line',
          data: dealerPrices,
          smooth: true,
          symbol: 'diamond',
          symbolSize: 8,
          lineStyle: {
            width: 3,
          },
          itemStyle: {
            color: '#52c41a',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
                { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
              ],
            },
          },
        },
      ],
    };
  }, [priceTrend]);

  // 统计信息
  const statistics = useMemo(() => {
    if (!priceTrend) return null;

    const currentPrice = priceTrend.dealer_prices[priceTrend.dealer_prices.length - 1]?.price || 0;
    const priceChange = priceTrend.price_change;
    const changePercent = priceTrend.change_percent;
    const lowestPrice = priceTrend.lowest_price;
    const highestPrice = priceTrend.highest_price;

    return {
      currentPrice,
      priceChange,
      changePercent,
      lowestPrice,
      highestPrice,
      avgPrice: priceTrend.avg_price,
    };
  }, [priceTrend]);

  if (loading) {
    return (
      <Card>
        <Spin tip="加载中...">
          <div style={{ height: height }} />
        </Spin>
      </Card>
    );
  }

  if (!priceTrend) {
    return (
      <Card>
        <Empty description="暂无价格趋势数据" />
      </Card>
    );
  }

  return (
    <Card>
      {/* 统计信息 */}
      {statistics && (
        <div style={{ marginBottom: 16 }}>
          <Space size="large" wrap>
            <div>
              <Text type="secondary">当前价格：</Text>
              <Text strong style={{ fontSize: 16 }}>
                {statistics.currentPrice.toFixed(2)}万
              </Text>
            </div>
            <div>
              <Text type="secondary">价格变化：</Text>
              <Text
                strong
                style={{
                  fontSize: 16,
                  color: statistics.priceChange < 0 ? '#52c41a' : '#ff4d4f',
                }}
              >
                {statistics.priceChange > 0 ? '+' : ''}
                {statistics.priceChange.toFixed(2)}万 ({statistics.changePercent > 0 ? '+' : ''}
                {statistics.changePercent.toFixed(2)}%)
              </Text>
            </div>
            <div>
              <Text type="secondary">最低价：</Text>
              <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                {statistics.lowestPrice.toFixed(2)}万
              </Text>
            </div>
            <div>
              <Text type="secondary">最高价：</Text>
              <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>
                {statistics.highestPrice.toFixed(2)}万
              </Text>
            </div>
          </Space>
        </div>
      )}

      {/* 图表 */}
      <ReactECharts
        option={chartOption}
        style={{ height: height }}
        opts={{ renderer: 'svg' }}
      />
    </Card>
  );
};

export default PriceTrendChart;

// 需要导入 DatePicker
import { DatePicker } from 'antd';
