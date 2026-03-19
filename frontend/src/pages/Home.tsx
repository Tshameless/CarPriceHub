// ── Home Page ───────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Input, Button, Carousel } from 'antd';
import { SearchOutlined, BulbOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCarStore } from '../store/carStore';
import CarCard from '../components/CarCard';

export default function Home() {
  const navigate = useNavigate();
  const { featuredCars, fetchFeaturedCars, loading } = useCarStore();
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchFeaturedCars();
  }, [fetchFeaturedCars]);

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  return (
    <div style={{ padding: '0 24px 24px' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
        borderRadius: 12,
        padding: 48,
        textAlign: 'center',
        marginBottom: 32,
        color: '#fff',
      }}>
        <h1 style={{ fontSize: 48, marginBottom: 16 }}>车价通 CarPriceHub</h1>
        <p style={{ fontSize: 20, marginBottom: 32, opacity: 0.9 }}>
          让每位购车用户在 30 秒内找到最优购车方案
        </p>
        <Input
          size="large"
          placeholder="搜索车型、品牌..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onPressEnter={handleSearch}
          suffix={
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              style={{ borderRadius: '0 8px 8px 0' }}
            >
              搜索
            </Button>
          }
          style={{ maxWidth: 600, borderRadius: 8, height: 56 }}
        />
      </div>

      {/* Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="覆盖车型"
              value={500}
              suffix="+"
              valueStyle={{ color: '#1565C0' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="实时价格"
              value={24}
              suffix="h"
              valueStyle={{ color: '#2E7D32' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="数据准确率"
              value={98}
              suffix="%"
              valueStyle={{ color: '#F9A825' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="推荐满意度"
              value={92}
              suffix="%"
              valueStyle={{ color: '#E65100' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => navigate('/search')}
            style={{ textAlign: 'center', padding: 24 }}
          >
            <SearchOutlined style={{ fontSize: 48, color: '#1565C0', marginBottom: 16 }} />
            <h3>价格查询</h3>
            <p style={{ color: '#666' }}>实时优惠价、贷款政策</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => navigate('/recommend')}
            style={{ textAlign: 'center', padding: 24 }}
          >
            <BulbOutlined style={{ fontSize: 48, color: '#E65100', marginBottom: 16 }} />
            <h3>智能推荐</h3>
            <p style={{ color: '#666' }}>根据你的情况推荐最优车型</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => navigate('/compare')}
            style={{ textAlign: 'center', padding: 24 }}
          >
            <TrophyOutlined style={{ fontSize: 48, color: '#2E7D32', marginBottom: 16 }} />
            <h3>多车对比</h3>
            <p style={{ color: '#666' }}>价格、配置、优惠横向对比</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => navigate('/profile')}
            style={{ textAlign: 'center', padding: 24 }}
          >
            <FireOutlined style={{ fontSize: 48, color: '#C62828', marginBottom: 16 }} />
            <h3>热门榜单</h3>
            <p style={{ color: '#666' }}>最佳优惠、即将涨价</p>
          </Card>
        </Col>
      </Row>

      {/* Featured Cars */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 24 }}>🔥 本周热门车型</h2>
        <Row gutter={[24, 24]}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Col xs={24} sm={12} md={6} key={i}>
                <Card loading />
              </Col>
            ))
          ) : (
            featuredCars.map(car => (
              <Col xs={24} sm={12} md={6} key={car.id}>
                <CarCard car={car} />
              </Col>
            ))
          )}
        </Row>
      </div>
    </div>
  );
}
