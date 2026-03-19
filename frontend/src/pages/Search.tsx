// ── Search Page ───────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Select, Slider, Button, Pagination, Empty, Spin } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { useCarStore } from '../store/carStore';
import CarCard from '../components/CarCard';
import { SearchQuery, EnergyType, BodyType } from '../types';

const { Option } = Select;

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchResults, total, loading, fetchCars } = useCarStore();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [energyType, setEnergyType] = useState<EnergyType | undefined>();
  const [bodyType, setBodyType] = useState<BodyType | undefined>();
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 100]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const query: SearchQuery = {
      keyword: keyword || undefined,
      energy_type: energyType,
      body_type: bodyType,
      budget_min: budgetRange[0],
      budget_max: budgetRange[1],
      page: currentPage,
      page_size: pageSize,
    };
    fetchCars(query);
  }, [energyType, bodyType, budgetRange, currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    const query: SearchQuery = {
      keyword: keyword || undefined,
      energy_type: energyType,
      body_type: bodyType,
      budget_min: budgetRange[0],
      budget_max: budgetRange[1],
      page: 1,
      page_size: pageSize,
    };
    fetchCars(query);
    if (keyword) {
      setSearchParams({ keyword });
    }
  };

  const handleReset = () => {
    setKeyword('');
    setEnergyType(undefined);
    setBodyType(undefined);
    setBudgetRange([0, 100]);
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div style={{ padding: '0 24px' }}>
      {/* Filter Bar */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              size="large"
              placeholder="搜索车型、品牌..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={4} lg={3}>
            <Select
              size="large"
              placeholder="能源类型"
              value={energyType}
              onChange={setEnergyType}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="petrol">燃油</Option>
              <Option value="hybrid">混动</Option>
              <Option value="phev">插混</Option>
              <Option value="bev">纯电</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4} lg={3}>
            <Select
              size="large"
              placeholder="车身类型"
              value={bodyType}
              onChange={setBodyType}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="sedan">轿车</Option>
              <Option value="suv">SUV</Option>
              <Option value="mpv">MPV</Option>
            </Select>
          </Col>
          <Col xs={24} sm={16} md={6} lg={8}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 8 }}>预算:</span>
              <Slider
                range
                min={0}
                max={100}
                value={budgetRange}
                onChange={(value) => setBudgetRange(value as [number, number])}
                style={{ flex: 1 }}
              />
              <span style={{ marginLeft: 8, minWidth: 80 }}>
                {budgetRange[0]}-{budgetRange[1]}万
              </span>
            </div>
          </Col>
          <Col xs={24} sm={8} md={4} lg={4}>
            <Button size="large" onClick={handleReset} style={{ marginRight: 8 }}>
              重置
            </Button>
            <Button type="primary" size="large" onClick={handleSearch}>
              搜索
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Results */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: '#666' }}>共找到 {total} 款车型</span>
      </div>

      <Spin spinning={loading}>
        {searchResults.length > 0 ? (
          <>
            <Row gutter={[24, 24]}>
              {searchResults.map(car => (
                <Col xs={24} sm={12} md={8} lg={6} key={car.id}>
                  <CarCard car={car} />
                </Col>
              ))}
            </Row>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                showTotal={(total) => `共 ${total} 条`}
              />
            </div>
          </>
        ) : (
          <Empty description="暂无符合条件的车型" style={{ padding: 80 }} />
        )}
      </Spin>
    </div>
  );
}
