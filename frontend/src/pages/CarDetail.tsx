// ── Car Detail Page ────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Tag, Button, Divider, Descriptions, Alert, Spin, Tabs, Select, InputNumber, message } from 'antd';
import { ArrowLeftOutlined, HeartOutlined, ShareAltOutlined, BellOutlined, LineChartOutlined } from '@ant-design/icons';
import { useCarStore } from '../store/carStore';
import { usePriceStore } from '../store/priceStore';
import { Car } from '../types';
import PriceTrendChart from '../components/PriceTrendChart';

const { TabPane } = Tabs;
const { Option } = Select;

export default function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentCar, loading, fetchCarById } = useCarStore();
  const { priceTrend, loading: priceLoading, fetchPriceTrend, createPriceAlert } = usePriceStore();
  const [car, setCar] = useState<Car | null>(null);
  const [trendDays, setTrendDays] = useState(30);
  const [alertPrice, setAlertPrice] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchCarById(id).then(c => c && setCar(c));
      fetchPriceTrend(id, trendDays);
    }
  }, [id, fetchCarById, fetchPriceTrend, trendDays]);

  // 创建价格提醒
  const handleCreateAlert = async () => {
    if (!id || !alertPrice) {
      message.warning('请输入目标价格');
      return;
    }

    try {
      await createPriceAlert(id, alertPrice, 'push');
      message.success('价格提醒已创建');
      setAlertPrice(null);
    } catch (error) {
      message.error('创建提醒失败');
    }
  };

  if (loading || !car) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  const getEnergyLabel = (type: string) => {
    const map: Record<string, string> = {
      petrol: '燃油',
      diesel: '柴油',
      hybrid: '混动',
      phev: '插混',
      bev: '纯电',
      hydrogen: '氢能',
    };
    return map[type] || type;
  };

  return (
    <div style={{ padding: '0 24px', maxWidth: 1200, margin: '0 auto' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
        返回
      </Button>

      <Row gutter={24}>
        <Col xs={24} md={10}>
          <Card cover={
            <div style={{
              height: 300,
              background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 100,
              color: '#1565C0',
            }}>
              🚗
            </div>
          }>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="primary" icon={<HeartOutlined />} block>收藏</Button>
              <Button icon={<ShareAltOutlined />}>分享</Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={14}>
          <Card>
            <h1 style={{ fontSize: 28, marginBottom: 16 }}>
              {car.brand} {car.model_name}
              <Tag color="blue" style={{ marginLeft: 12 }}>{car.year}款</Tag>
            </h1>

            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <div style={{ color: '#999', fontSize: 14 }}>官方指导价</div>
                <div style={{ fontSize: 20, textDecoration: 'line-through', color: '#999' }}>
                  ¥{car.price_official.toFixed(2)}万
                </div>
              </Col>
              <Col span={8}>
                <div style={{ color: '#999', fontSize: 14 }}>优惠成交价</div>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#2E7D32' }}>
                  ¥{car.price_discount.toFixed(2)}万
                </div>
              </Col>
              <Col span={8}>
                <div style={{ color: '#999', fontSize: 14 }}>直接优惠</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#E65100' }}>
                  -¥{car.direct_discount.toFixed(2)}万
                </div>
              </Col>
            </Row>

            {car.loan_subsidy_amount && car.loan_subsidy_amount > 0 && (
              <Alert
                message={`贷款贴息 ¥${car.loan_subsidy_amount.toFixed(2)}万`}
                description={`年化利率 ${(car.loan_subsidy_rate || 0) * 100}%`}
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            {car.replacement_subsidy && car.replacement_subsidy > 0 && (
              <Alert
                message={`置换补贴 ¥${car.replacement_subsidy.toFixed(2)}万`}
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            <Divider />

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="能源类型">{getEnergyLabel(car.energy_type)}</Descriptions.Item>
              <Descriptions.Item label="车身类型">{car.body_type.toUpperCase()}</Descriptions.Item>
              <Descriptions.Item label="座位数">{car.seat_count || '-'}座</Descriptions.Item>
              <Descriptions.Item label="适用地区">{car.region}</Descriptions.Item>
              <Descriptions.Item label="政策生效">{new Date(car.effective_date).toLocaleDateString()}</Descriptions.Item>
              <Descriptions.Item label="政策截止">
                {car.expire_date ? new Date(car.expire_date).toLocaleDateString() : '长期有效'}
              </Descriptions.Item>
            </Descriptions>

            {car.gift_package && car.gift_package.length > 0 && (
              <>
                <Divider>赠品清单</Divider>
                <ul>
                  {car.gift_package.map((gift, i) => (
                    <li key={i}>
                      {gift.name}（估值 ¥{gift.estimated_value.toFixed(2)}万）
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* 下方标签页 */}
      <Card style={{ marginTop: 24 }}>
        <Tabs defaultActiveKey="trend">
          {/* 价格趋势 */}
          <TabPane 
            tab={<span><LineChartOutlined />价格趋势</span>} 
            key="trend"
          >
            <div style={{ marginBottom: 16 }}>
              <span style={{ marginRight: 8 }}>时间范围：</span>
              <Select value={trendDays} onChange={setTrendDays} style={{ width: 120 }}>
                <Option value={7}>最近7天</Option>
                <Option value={30}>最近30天</Option>
                <Option value={90}>最近3个月</Option>
                <Option value={180}>最近半年</Option>
              </Select>
            </div>
            <PriceTrendChart 
              priceTrend={priceTrend} 
              loading={priceLoading}
              height={350}
            />
          </TabPane>

          {/* 价格提醒 */}
          <TabPane 
            tab={<span><BellOutlined />价格提醒</span>} 
            key="alert"
          >
            <Card>
              <h3>设置价格提醒</h3>
              <p style={{ color: '#999', marginBottom: 16 }}>
                当价格达到您的目标价时，系统会自动通知您
              </p>
              
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div>
                  <span style={{ marginRight: 8 }}>目标价格：</span>
                  <InputNumber
                    value={alertPrice}
                    onChange={setAlertPrice}
                    placeholder="输入目标价格"
                    min={0}
                    step={0.1}
                    precision={2}
                    style={{ width: 200 }}
                    addonAfter="万元"
                  />
                </div>
                <Button 
                  type="primary" 
                  icon={<BellOutlined />}
                  onClick={handleCreateAlert}
                  disabled={!alertPrice}
                >
                  创建提醒
                </Button>
              </div>

              <Divider />

              <div style={{ color: '#999' }}>
                <p>💡 建议：当前价格 <strong style={{ color: '#2E7D32' }}>{car.price_discount.toFixed(2)}万</strong></p>
                <p>您可以选择比当前价格更低的目标价，系统会在价格下降时通知您</p>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
