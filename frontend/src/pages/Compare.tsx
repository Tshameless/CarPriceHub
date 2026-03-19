// ── Compare Page (Multi-car Comparison) ────────────────────────
import React, { useState } from 'react';
import { Card, Row, Col, Button, Empty, Table, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCompareStore } from '../store/compareStore';
import { useNavigate } from 'react-router-dom';

export default function Compare() {
  const navigate = useNavigate();
  const { cars, removeCar } = useCompareStore();
  const [compareTable, setCompareTable] = useState(false);

  if (cars.length === 0) {
    return (
      <div style={{ padding: '0 24px' }}>
        <Card>
          <Empty
            description="暂无对比车型，请先添加车型"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/search')}>
              去搜索车型
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  const columns = [
    {
      title: '对比项',
      dataIndex: 'field',
      key: 'field',
      width: 150,
    },
    ...cars.map((car, i) => ({
      title: (
        <div>
          <div>{car.brand} {car.model_name}</div>
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeCar(car.id)}
          />
        </div>
      ),
      dataIndex: `car${i}`,
      key: `car${i}`,
    })),
  ];

  const dataSource = [
    {
      key: 'price',
      field: '官方价',
      ...cars.reduce((acc, car, i) => ({ ...acc, [`car${i}`]: `¥${car.price_official.toFixed(2)}万` }), {}),
    },
    {
      key: 'discount',
      field: '优惠价',
      ...cars.reduce((acc, car, i) => ({
        ...acc,
        [`car${i}`]: <span style={{ color: '#2E7D32', fontWeight: 600 }}>¥{car.price_discount.toFixed(2)}万</span>,
      }), {}),
    },
    {
      key: 'save',
      field: '优惠金额',
      ...cars.reduce((acc, car, i) => ({
        ...acc,
        [`car${i}`]: <Tag color="orange">-¥{car.direct_discount.toFixed(2)}万</Tag>,
      }), {}),
    },
    {
      key: 'energy',
      field: '能源类型',
      ...cars.reduce((acc, car, i) => ({ ...acc, [`car${i}`]: car.energy_type.toUpperCase() }), {}),
    },
    {
      key: 'body',
      field: '车身类型',
      ...cars.reduce((acc, car, i) => ({ ...acc, [`car${i}`]: car.body_type.toUpperCase() }), {}),
    },
    {
      key: 'seats',
      field: '座位数',
      ...cars.reduce((acc, car, i) => ({ ...acc, [`car${i}`]: `${car.seat_count || '-'}座` }), {}),
    },
    {
      key: 'loan',
      field: '贷款贴息',
      ...cars.reduce((acc, car, i) => ({
        ...acc,
        [`car${i}`]: car.loan_subsidy_amount ? `¥${car.loan_subsidy_amount.toFixed(2)}万` : '-',
      }), {}),
    },
  ];

  return (
    <div style={{ padding: '0 24px' }}>
      <Card
        title="车型对比"
        extra={
          cars.length < 4 && (
            <Button icon={<PlusOutlined />} onClick={() => navigate('/search')}>
              添加车型
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          bordered
          style={{ marginTop: 16 }}
        />
        <div style={{ marginTop: 16, color: '#999', fontSize: 14 }}>
          💡 提示：最多可同时对比 4 款车型
        </div>
      </Card>
    </div>
  );
}
