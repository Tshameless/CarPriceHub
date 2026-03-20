<template>
  <el-card>
    <template v-if="loading">
      <el-skeleton :rows="10" animated />
    </template>

    <template v-else-if="!priceTrend">
      <el-empty description="暂无价格趋势数据" />
    </template>

    <template v-else>
      <!-- 统计信息 -->
      <div class="statistics">
        <el-space wrap :size="20">
          <div>
            <span class="label">当前价格：</span>
            <span class="value">{{ statistics.currentPrice.toFixed(2) }}万</span>
          </div>
          <div>
            <span class="label">价格变化：</span>
            <span
              class="value"
              :style="{ color: statistics.priceChange < 0 ? '#67c23a' : '#f56c6c' }"
            >
              {{ statistics.priceChange > 0 ? '+' : '' }}{{ statistics.priceChange.toFixed(2) }}万
              ({{ statistics.changePercent > 0 ? '+' : '' }}{{ statistics.changePercent.toFixed(2) }}%)
            </span>
          </div>
          <div>
            <span class="label">最低价：</span>
            <span class="value" style="color: #67c23a">
              {{ statistics.lowestPrice.toFixed(2) }}万
            </span>
          </div>
          <div>
            <span class="label">最高价：</span>
            <span class="value" style="color: #f56c6c">
              {{ statistics.highestPrice.toFixed(2) }}万
            </span>
          </div>
        </el-space>
      </div>

      <!-- 图表 -->
      <v-chart
        :option="chartOption"
        :style="{ height: `${height}px` }"
        autoresize
      />
    </template>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import dayjs from 'dayjs';
import type { PriceTrend } from '@/types';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

interface Props {
  priceTrend: PriceTrend | null;
  loading?: boolean;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: 400,
});

// 统计信息
const statistics = computed(() => {
  if (!props.priceTrend) return null;

  const currentPrice =
    props.priceTrend.dealer_prices[props.priceTrend.dealer_prices.length - 1]?.price || 0;
  const priceChange = props.priceTrend.price_change;
  const changePercent = props.priceTrend.change_percent;
  const lowestPrice = props.priceTrend.lowest_price;
  const highestPrice = props.priceTrend.highest_price;

  return {
    currentPrice,
    priceChange,
    changePercent,
    lowestPrice,
    highestPrice,
    avgPrice: props.priceTrend.avg_price,
  };
});

// 图表配置
const chartOption = computed(() => {
  if (!props.priceTrend) return {};

  const dates = props.priceTrend.official_prices.map((p) => p.date);
  const officialPrices = props.priceTrend.official_prices.map((p) => p.price);
  const dealerPrices = props.priceTrend.dealer_prices.map((p) => p.price);

  return {
    title: {
      text: `${props.priceTrend.car_name} 价格趋势`,
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
          color: '#409EFF',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
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
          color: '#67c23a',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.05)' },
            ],
          },
        },
      },
    ],
  };
});
</script>

<style scoped>
.statistics {
  margin-bottom: 16px;
}

.statistics .label {
  color: #909399;
  font-size: 14px;
}

.statistics .value {
  font-size: 16px;
  font-weight: 600;
}
</style>
