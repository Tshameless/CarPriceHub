// ── Profile Page (User Profile & Favorites) ─────────────────────
import React, { useState } from 'react';
import { Card, Tabs, List, Button, Empty, Tag } from 'antd';
import { HeartOutlined, BellOutlined, HistoryOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCarStore } from '../store/carStore';

export default function Profile() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  return (
    <div style={{ padding: '0 24px', maxWidth: 1200, margin: '0 auto' }}>
      <Card>
        <Tabs
          defaultActiveKey="favorites"
          items={[
            {
              key: 'favorites',
              label: (
                <span>
                  <HeartOutlined />
                  收藏车型
                </span>
              ),
              children: (
                <List
                  dataSource={favorites}
                  locale={{ emptyText: <Empty description="暂无收藏" /> }}
                  renderItem={(item: any) => (
                    <List.Item
                      actions={[
                        <Button type="link" onClick={() => navigate(`/car/${item.id}`)}>
                          查看详情
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={`${item.brand} ${item.model_name}`}
                        description={`¥${item.price_discount}万`}
                      />
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: 'alerts',
              label: (
                <span>
                  <BellOutlined />
                  价格提醒
                </span>
              ),
              children: (
                <List
                  dataSource={alerts}
                  locale={{ emptyText: <Empty description="暂无价格提醒" /> }}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={`${item.carName} - 目标价 ¥${item.targetPrice}万`}
                        description={item.status === 'active' ? '监控中' : '已触发'}
                      />
                      <Tag color={item.status === 'active' ? 'blue' : 'green'}>
                        {item.status === 'active' ? '监控中' : '已触发'}
                      </Tag>
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: 'history',
              label: (
                <span>
                  <HistoryOutlined />
                  查询历史
                </span>
              ),
              children: (
                <List
                  dataSource={history}
                  locale={{ emptyText: <Empty description="暂无查询历史" /> }}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.keyword || '全部车型'}
                        description={item.timestamp}
                      />
                    </List.Item>
                  )}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
