// ── Footer Component ────────────────────────────────────────────
import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

export default function Footer() {
  return (
    <AntFooter style={{ background: '#fafafa', padding: '40px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ flex: 1, minWidth: 200, marginBottom: 24 }}>
            <h4 style={{ marginBottom: 16, color: '#212121' }}>车价通</h4>
            <Text type="secondary">基于 Tauri 构建的多端汽车价格查询应用</Text>
          </div>
          <div style={{ flex: 1, minWidth: 200, marginBottom: 24 }}>
            <h4 style={{ marginBottom: 16, color: '#212121' }}>功能</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/search">价格查询</Link>
              <Link href="/recommend">智能推荐</Link>
              <Link href="/compare">车型对比</Link>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200, marginBottom: 24 }}>
            <h4 style={{ marginBottom: 16, color: '#212121' }}>关于</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="#">使用说明</Link>
              <Link href="#">隐私政策</Link>
              <Link href="#">联系我们</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: 16, textAlign: 'center' }}>
          <Text type="secondary">
            © 2026 车价通 CarPriceHub. 基于 Tauri 技术构建.
          </Text>
        </div>
      </div>
    </AntFooter>
  );
}
