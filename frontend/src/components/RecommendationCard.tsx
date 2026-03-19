// ── Recommendation Card Component ───────────────────────────────
import React from 'react';
import { Card, Tag, Progress, Alert, Space } from 'antd';
import { TrophyOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Recommendation } from '../types';

interface Props {
  recommendation: Recommendation;
  rank: number;
}

export default function RecommendationCard({ recommendation, rank }: Props) {
  const navigate = useNavigate();
  const { car, score, reason, risk_warning, financial_health, family_fit, scenario_match } = recommendation;

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#1565C0';
  };

  return (
    <Card
      className="car-card"
      hoverable
      onClick={() => navigate(`/car/${car.id}`)}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: getRankColor(rank),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 20,
            }}
          >
            {rank}
          </div>
          <div>
            <div style={{ fontSize: 18 }}>{car.brand} {car.model_name}</div>
            <Space>
              <Tag>{car.year}款</Tag>
              <Tag color="green">¥{car.price_discount.toFixed(2)}万</Tag>
            </Space>
          </div>
        </div>
      }
    >
      {risk_warning && (
        <Alert
          message={risk_warning.message}
          description={risk_warning.suggestion}
          type={risk_warning.level === 'critical' ? 'error' : risk_warning.level === 'high' ? 'warning' : 'info'}
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ marginBottom: 16 }}>
        <strong>推荐理由：</strong>
        <span style={{ color: '#666', marginLeft: 8 }}>{reason}</span>
      </div>

      <div style={{ marginBottom: 8 }}>
        <span>综合评分：</span>
        <Progress
          percent={score}
          strokeColor="#1565C0"
          format={(percent) => `${percent?.toFixed(1)}分`}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#999' }}>财务健康度</div>
          <Progress
            percent={financial_health}
            size="small"
            strokeColor="#2E7D32"
            format={(p) => `${p?.toFixed(0)}`}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#999' }}>家庭适配度</div>
          <Progress
            percent={family_fit}
            size="small"
            strokeColor="#1565C0"
            format={(p) => `${p?.toFixed(0)}`}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#999' }}>场景匹配度</div>
          <Progress
            percent={scenario_match}
            size="small"
            strokeColor="#E65100"
            format={(p) => `${p?.toFixed(0)}`}
          />
        </div>
      </div>

      <div style={{ marginTop: 16, padding: 12, background: '#F5F5F5', borderRadius: 8 }}>
        <Row justify="space-between">
          <Col>
            <span style={{ textDecoration: 'line-through', color: '#999' }}>¥{car.price_official.toFixed(2)}万</span>
          </Col>
          <Col>
            <span style={{ color: '#E65100', fontWeight: 600, fontSize: 20 }}>
              ¥{car.price_discount.toFixed(2)}万
            </span>
          </Col>
        </Row>
        {car.direct_discount > 0 && (
          <div style={{ marginTop: 8, color: '#2E7D32', fontSize: 14 }}>
            直降 ¥{car.direct_discount.toFixed(2)}万
          </div>
        )}
        {car.loan_subsidy_amount && car.loan_subsidy_amount > 0 && (
          <Tag color="orange" style={{ marginTop: 8 }}>
            贴息 ¥{car.loan_subsidy_amount.toFixed(2)}万
          </Tag>
        )}
      </div>
    </Card>
  );
}

import { Row, Col } from 'antd';
