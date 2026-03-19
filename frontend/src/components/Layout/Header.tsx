// ── Header Component ────────────────────────────────────────────
import React from 'react';
import { Layout, Menu, Input, Button, Dropdown } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  SearchOutlined,
  BulbOutlined,
  DiffOutlined,
  UserOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import logo from '/logo.svg';

const { Header: AntHeader } = Layout;
const { Search } = Input;

export default function Header() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: 'search', icon: <SearchOutlined />, label: <Link to="/search">搜索</Link> },
    { key: 'recommend', icon: <BulbOutlined />, label: <Link to="/recommend">推荐</Link> },
    { key: 'compare', icon: <DiffOutlined />, label: <Link to="/compare">对比</Link> },
    { key: 'profile', icon: <UserOutlined />, label: <Link to="/profile">我的</Link> },
  ];

  const onSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(value.trim())}`);
    }
  };

  const desktopHeader = (
    <AntHeader>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src={logo} alt="车价通" style={{ height: 40, marginRight: 12 }} />
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>车价通</span>
        </Link>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[]}
          items={menuItems}
          style={{ flex: 1, marginLeft: 40, minWidth: 0, border: 'none' }}
        />
        <div style={{ marginLeft: 40, minWidth: 300 }}>
          <Search
            placeholder="搜索车型、品牌..."
            allowClear
            enterButton
            onSearch={onSearch}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </AntHeader>
  );

  const mobileHeader = (
    <AntHeader>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src={logo} alt="车价通" style={{ height: 36 }} />
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 600, marginLeft: 8 }}>车价通</span>
        </Link>
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button type="text" icon={<MenuOutlined />} style={{ color: '#fff', fontSize: 20 }} />
        </Dropdown>
      </div>
    </AntHeader>
  );

  return isMobile ? mobileHeader : desktopHeader;
}
