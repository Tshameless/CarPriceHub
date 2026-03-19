// ── Car Card Component ─────────────────────────────────────────
import React from 'react';
import { Card, Tag, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Car } from '../types';

const { Meta } = Card;

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const navigate = useNavigate();

  const getEnergyTag = (type: string) => {
    const map: Record<string, { color: string; text: string }> = {
      petrol: { color: 'default', text: '燃油' },
      diesel: { color: 'default', text: '柴油' },
      hybrid: { color: 'green', text: '混动' },
      phev: { color: 'cyan', text: '插混' },
      bev: { color: 'blue', text: '纯电' },
      hydrogen: { color: 'purple', text: '氢能' },
    };
    const { color, text } = map[type] || { color: 'default', text: type };
    return <Tag color={color}>{text}</Tag>;
  };

  const getBodyTag = (type: string) => {
    const map: Record<string, { color: string; text: string }> = {
      sedan: { color: 'blue', text: '轿车' },
      suv: { color: 'orange', text: 'SUV' },
      mpv: { color: 'purple', text: 'MPV' },
      hatchback: { color: 'geekblue', text: '两厢' },
      coupe: { color: 'magenta', text: '跑车' },
      pickup: { color: 'volcano', text: '皮卡' },
      wagon: { color: 'gold', text: '旅行车' },
    };
    const { color, text } = map[type] || { color: 'default', text: type };
    return <Tag color={color}>{text}</Tag>;
  };

  return (
    <Card
      className="car-card"
      hoverable
      onClick={() => navigate(`/car/${car.id}`)}
      cover={
        <div
          style={{
            height: 160,
            background: `linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            color: '#1565C0',
          }}
        >
          🚗
        </div>
      }
    >
      <Meta
        title={
          <div>
            <span style={{ fontSize: 18 }}>{car.brand}</span>
            <span style={{ marginLeft: 8, fontSize: 16, color: '#666' }}>{car.model_name}</span>
          </div>
        }
        description={
          <div>
            <Space wrap style={{ marginBottom: 12 }}>
              {getEnergyTag(car.energy_type)}
              {getBodyTag(car.body_type)}
              {car.seat_count && <Tag>{car.seat_count}座</Tag>}
            </Space>
            <div style={{ marginBottom: 8 }}>
              <span className="price-official">¥{car.price_official.toFixed(2)}万</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#2E7D32' }}>
              ¥{car.price_discount.toFixed(2)}万
              <span style={{ fontSize: 14, color: '#E65100', marginLeft: 8 }}>
                省¥{car.direct_discount.toFixed(2)}万
              </span>
            </div>
            {car.loan_subsidy_amount && car.loan_subsidy_amount > 0 && (
              <Tag color="orange" style={{ marginTop: 8 }}>
                贴息¥{car.loan_subsidy_amount.toFixed(2)}万
              </Tag>
            )}
          </div>
        }
      />
    </Card>
  );
}
