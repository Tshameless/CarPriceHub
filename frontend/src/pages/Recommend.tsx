// ── Recommend Page (User Profile + AI Recommendation) ──────────
import React, { useState } from 'react';
import { Row, Col, Card, Form, InputNumber, Select, Radio, Button, Steps, Space, Alert, Spin } from 'antd';
import { UserOutlined, CarOutlined, BulbOutlined, CheckOutlined } from '@ant-design/icons';
import { useRecommendStore } from '../store/recommendStore';
import RecommendationCard from '../components/RecommendationCard';
import { UserProfile, MaritalStatus, CarOwnership, UsageScenario, ParkingCondition } from '../types';

const { Option } = Select;

export default function Recommend() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const { recommendations, loading, submitProfile } = useRecommendStore();

  const handleFinish = async (values: UserProfile) => {
    await submitProfile(values);
    setCurrentStep(2);
  };

  const handleNext = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch (error) {
      // Validation failed
    }
  };

  const steps = [
    { title: '财务状况', icon: <UserOutlined /> },
    { title: '家庭情况', icon: <CarOutlined /> },
    { title: '推荐结果', icon: <BulbOutlined /> },
  ];

  return (
    <div style={{ padding: '0 24px', maxWidth: 1200, margin: '0 auto' }}>
      <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

      {currentStep === 0 && (
        <Card title="💰 财务状况" style={{ marginBottom: 24 }}>
          <Form form={form} layout="vertical" initialValues={{
            has_mortgage: false,
            family_members: 1,
            car_count: 0,
            daily_mileage: 30,
          }}>
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item label="月收入（税后，元）" name="monthly_income" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={5000} max={500000} step={1000} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="家庭月总收入（元）" name="family_monthly_income">
                  <InputNumber style={{ width: '100%' }} min={0} step={1000} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="可用首付存款（元）" name="savings_for_down_payment" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} step={10000} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="月供承受上限（元）" name="max_monthly_payment" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} max={50000} step={500} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="是否有房贷/租金" name="has_mortgage">
                  <Radio.Group>
                    <Radio value={false}>无</Radio>
                    <Radio value={true}>有</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="房贷/租金月支出（元）" name="mortgage_monthly">
                  <InputNumber style={{ width: '100%' }} min={0} step={500} />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" onClick={handleNext}>
              下一步
            </Button>
          </Form>
        </Card>
      )}

      {currentStep === 1 && (
        <Card title="👨‍👩‍👧 家庭与用车情况" style={{ marginBottom: 24 }}>
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item label="婚姻状况" name="marital_status" rules={[{ required: true }]}>
                  <Select placeholder="请选择">
                    <Option value="single">未婚</Option>
                    <Option value="married">已婚</Option>
                    <Option value="divorced">离异</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="是否有小孩" name="has_children">
                  <Radio.Group>
                    <Radio value={false}>无</Radio>
                    <Radio value={true}>有</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="孩子数量" name="children_count">
                  <InputNumber style={{ width: '100%' }} min={0} max={5} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="家庭常住人口" name="family_members" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={1} max={10} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="是否已有车" name="car_ownership" rules={[{ required: true }]}>
                  <Select placeholder="请选择">
                    <Option value="none">无（首车）</Option>
                    <Option value="one">有 1 辆</Option>
                    <Option value="two_or_more">有 2 辆+</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="主要使用场景" name="primary_usage" rules={[{ required: true }]}>
                  <Select placeholder="请选择">
                    <Option value="commute">上下班通勤</Option>
                    <Option value="family">家庭出行</Option>
                    <Option value="business">商务接待</Option>
                    <Option value="travel">自驾游</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="日均行驶里程（km）" name="daily_mileage">
                  <InputNumber style={{ width: '100%' }} min={0} max={200} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="是否限牌城市" name="restricted_plate_city">
                  <Radio.Group>
                    <Radio value={false}>否</Radio>
                    <Radio value={true}>是</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
            <Space>
              <Button onClick={() => setCurrentStep(0)}>上一步</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                获取推荐
              </Button>
            </Space>
          </Form>
        </Card>
      )}

      {currentStep === 2 && (
        <div>
          {recommendations.length > 0 ? (
            <>
              <Alert
                message="智能推荐结果"
                description="以下是根据您的财务状况、家庭情况和用车需求综合计算的最优车型推荐"
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />
              <Row gutter={[24, 24]}>
                {recommendations.map((rec, index) => (
                  <Col xs={24} lg={12} key={rec.car.id}>
                    <RecommendationCard recommendation={rec} rank={index + 1} />
                  </Col>
                ))}
              </Row>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                style={{ marginTop: 24 }}
                onClick={() => {
                  setCurrentStep(0);
                  form.resetFields();
                }}
              >
                重新评估
              </Button>
            </>
          ) : (
            <Spin spinning={loading} />
          )}
        </div>
      )}
    </div>
  );
}
