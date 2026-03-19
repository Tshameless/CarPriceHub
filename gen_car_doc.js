const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  TableOfContents, ExternalHyperlink
} = require('docx');
const fs = require('fs');

// ─── Color Palette ───────────────────────────────────────────
const C_BLUE    = '1565C0';
const C_LBLUE   = 'E3F0FF';
const C_ORANGE  = 'E65100';
const C_GRAY    = '555555';
const C_LGRAY   = 'F5F5F5';
const C_WHITE   = 'FFFFFF';
const C_HEADER  = '1565C0';

// ─── Border helpers ──────────────────────────────────────────
const thinBorder = (color = 'CCCCCC') => ({ style: BorderStyle.SINGLE, size: 4, color });
const allBorders = (color = 'CCCCCC') => ({
  top: thinBorder(color), bottom: thinBorder(color),
  left: thinBorder(color), right: thinBorder(color)
});
const noBorder = () => ({
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
});

// ─── Cell factories ──────────────────────────────────────────
const hdrCell = (text, w) => new TableCell({
  borders: allBorders(C_BLUE),
  width: { size: w, type: WidthType.DXA },
  shading: { fill: C_HEADER, type: ShadingType.CLEAR },
  margins: { top: 100, bottom: 100, left: 140, right: 140 },
  verticalAlign: VerticalAlign.CENTER,
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, color: C_WHITE, bold: true, size: 20, font: 'Arial' })]
  })]
});

const dataCell = (text, w, shade = C_WHITE, align = AlignmentType.LEFT, bold = false) =>
  new TableCell({
    borders: allBorders(),
    width: { size: w, type: WidthType.DXA },
    shading: { fill: shade, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, size: 18, font: 'Arial', bold, color: C_GRAY })]
    })]
  });

// ─── Paragraph helpers ───────────────────────────────────────
const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, font: 'Arial' })]
});
const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, font: 'Arial' })]
});
const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text, font: 'Arial' })]
});
const body = (text, indent = 0) => new Paragraph({
  indent: indent ? { left: indent } : undefined,
  children: [new TextRun({ text, size: 20, font: 'Arial', color: C_GRAY })]
});
const sp = (n = 1) => Array.from({ length: n }, () => new Paragraph({ children: [] }));
const bullet = (text, ref) => new Paragraph({
  numbering: { reference: ref, level: 0 },
  children: [new TextRun({ text, size: 20, font: 'Arial', color: C_GRAY })]
});
const colorBox = (text, fill = C_LBLUE) => new Paragraph({
  shading: { fill, type: ShadingType.CLEAR },
  indent: { left: 200, right: 200 },
  spacing: { before: 80, after: 80 },
  children: [new TextRun({ text, size: 20, font: 'Arial', color: C_BLUE, bold: false })]
});
const divider = () => new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C_BLUE, space: 1 } },
  children: []
});
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

// ─── Table factories ─────────────────────────────────────────
const twoColTable = (rows, col1W = 3200, col2W = 6160) => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [col1W, col2W],
  rows: rows.map(([a, b], i) => new TableRow({
    children: [
      dataCell(a, col1W, i % 2 === 0 ? C_LGRAY : C_WHITE, AlignmentType.LEFT, true),
      dataCell(b, col2W, i % 2 === 0 ? C_WHITE : C_LGRAY),
    ]
  }))
});

// ─── Content Tables ──────────────────────────────────────────

// 1. Tech Stack Table
const techTable = () => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [1800, 2000, 5560],
  rows: [
    new TableRow({ children: [hdrCell('分类', 1800), hdrCell('技术选型', 2000), hdrCell('说明', 5560)] }),
    ...([
      ['前端框架', 'React + TypeScript', '组件化 UI 开发，类型安全，生态丰富'],
      ['跨端引擎', 'Tauri 2.x', '基于 Rust 后端 + WebView 前端，极小包体，低内存占用'],
      ['状态管理', 'Zustand', '轻量级全局状态管理'],
      ['UI 组件库', 'Ant Design / shadcn/ui', '企业级组件，支持主题定制'],
      ['路由管理', 'React Router v6', '单页应用路由'],
      ['网络请求', 'Tauri HTTP Plugin', '基于 Rust reqwest，安全沙箱内发送请求'],
      ['数据缓存', 'SQLite (tauri-plugin-sql)', '本地持久化价格数据，离线可用'],
      ['图表可视化', 'ECharts', '价格趋势、对比图表'],
      ['数据同步', 'REST API / WebSocket', '后端实时推送最新价格政策'],
      ['后端服务', 'Rust Axum + PostgreSQL', '高性能 API 服务，数据抓取与聚合'],
      ['桌面端打包', 'Tauri (Windows/macOS/Linux)', '原生安装包，系统托盘支持'],
      ['移动端', 'Tauri Mobile (iOS/Android)', 'Tauri 2.x 官方移动端支持'],
      ['代码仓库', 'Monorepo (pnpm workspace)', '前后端统一管理'],
      ['CI/CD', 'GitHub Actions', '自动构建、测试、发布多平台包'],
    ].map(([a, b, c], i) => new TableRow({
      children: [
        dataCell(a, 1800, i % 2 === 0 ? C_LGRAY : C_WHITE, AlignmentType.LEFT, true),
        dataCell(b, 2000, i % 2 === 0 ? C_LGRAY : C_WHITE),
        dataCell(c, 5560, i % 2 === 0 ? C_WHITE : C_LGRAY),
      ]
    })))
  ]
});

// 2. Feature Modules Table
const featureTable = () => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [1600, 2200, 2400, 3160],
  rows: [
    new TableRow({ children: [hdrCell('模块', 1600), hdrCell('功能点', 2200), hdrCell('优先级', 2400), hdrCell('备注', 3160)] }),
    ...([
      ['价格查询', '官方指导价查询', 'P0 核心', '支持品牌/车型/年款筛选'],
      ['价格查询', '当前优惠价查询', 'P0 核心', '实时抓取官网及授权经销商'],
      ['价格查询', '直接优惠金额显示', 'P0 核心', '厂商直降 + 经销商让利'],
      ['金融政策', '贷款贴息方案查询', 'P0 核心', '支持不同期数利率对比'],
      ['金融政策', '置换补贴查询', 'P1 重要', '以旧换新补贴政策'],
      ['金融政策', '保险优惠套餐', 'P2 一般', '首年险种优惠'],
      ['智能推荐', '按预算人群推荐', 'P0 核心', '输入预算自动匹配车型'],
      ['智能推荐', '按用途需求推荐', 'P1 重要', '家用/商务/越野等标签'],
      ['智能推荐', 'AI 个性化推荐', 'P1 重要', '基于用户行为协同过滤'],
      ['价格对比', '多车型横向对比', 'P0 核心', '最多 4 款同框对比'],
      ['价格对比', '价格走势图', 'P1 重要', '近 12 个月价格变动趋势'],
      ['数据更新', '价格实时推送', 'P0 核心', 'WebSocket 推送变价通知'],
      ['数据更新', '离线缓存', 'P1 重要', 'SQLite 本地存储，断网可用'],
      ['用户中心', '收藏车型', 'P1 重要', '本地收藏夹'],
      ['用户中心', '查询历史', 'P2 一般', '本地查询记录'],
      ['用户中心', '价格提醒', 'P1 重要', '目标价到达时系统通知'],
    ].map(([a, b, c, d], i) => new TableRow({
      children: [
        dataCell(a, 1600, i % 2 === 0 ? C_LGRAY : C_WHITE, AlignmentType.LEFT, true),
        dataCell(b, 2200, i % 2 === 0 ? C_LGRAY : C_WHITE),
        dataCell(c, 2400, i % 2 === 0 ? C_WHITE : C_LGRAY),
        dataCell(d, 3160, i % 2 === 0 ? C_WHITE : C_LGRAY),
      ]
    })))
  ]
});

// 3. User Persona Table
const personaTable = () => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [1800, 2000, 1560, 4000],
  rows: [
    new TableRow({ children: [hdrCell('用户群体', 1800), hdrCell('预算区间', 2000), hdrCell('推荐策略', 1560), hdrCell('典型推荐车型（示例）', 4000)] }),
    ...([
      ['首次购车用户', '8 万以下', '性价比优先', '比亚迪海鸥、五菱宏光 MINIEV、吉利帝豪'],
      ['刚需家庭用户', '8 – 15 万', '空间 + 油耗综合', '大众朗逸、丰田卡罗拉、比亚迪秦 PLUS'],
      ['中产家庭升级', '15 – 25 万', '品质 + 品牌', '大众迈腾、本田雅阁、比亚迪汉'],
      ['新能源尝鲜族', '10 – 20 万', '续航 + 智能配置', '特斯拉 Model 3、比亚迪海豹、小鹏 P7'],
      ['商务人士', '25 – 40 万', '豪华感 + 舒适性', '宝马 3 系、奔驰 C 级、雷克萨斯 ES'],
      ['高端豪华需求', '40 万以上', '品牌溢价 + 极致体验', '宝马 5 系、奔驰 E 级、保时捷 Macan'],
      ['越野爱好者', '15 – 35 万', '通过性 + 承载力', '坦克 300、吉普牧马人、大众途锐'],
      ['年轻个性用户', '10 – 20 万', '外观 + 科技感', '比亚迪海豚、小鹏 G6、领克 03'],
    ].map(([a, b, c, d], i) => new TableRow({
      children: [
        dataCell(a, 1800, i % 2 === 0 ? C_LGRAY : C_WHITE, AlignmentType.LEFT, true),
        dataCell(b, 2000, i % 2 === 0 ? C_LGRAY : C_WHITE, AlignmentType.CENTER),
        dataCell(c, 1560, i % 2 === 0 ? C_WHITE : C_LGRAY, AlignmentType.CENTER),
        dataCell(d, 4000, i % 2 === 0 ? C_WHITE : C_LGRAY),
      ]
    })))
  ]
});

// 4. Data Fields Table
const dataFieldTable = () => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [2200, 2000, 1800, 3360],
  rows: [
    new TableRow({ children: [hdrCell('字段名称', 2200), hdrCell('数据类型', 2000), hdrCell('更新频率', 1800), hdrCell('说明', 3360)] }),
    ...([
      ['brand', 'String', '静态', '品牌名称（如 比亚迪、大众）'],
      ['model_name', 'String', '静态', '车型名称（如 汉 EV 2024款）'],
      ['official_price', 'Decimal(10,2)', '每日', '厂商官方建议零售价（万元）'],
      ['discount_price', 'Decimal(10,2)', '实时', '当前市场优惠成交价（万元）'],
      ['direct_discount', 'Decimal(10,2)', '实时', '直接优惠金额 = 官方价 - 优惠价'],
      ['loan_subsidy_rate', 'Decimal(5,4)', '每周', '贷款贴息年化利率'],
      ['loan_subsidy_amount', 'Decimal(10,2)', '每周', '贷款贴息折算金额（万元）'],
      ['replacement_subsidy', 'Decimal(10,2)', '每周', '置换补贴金额（万元）'],
      ['insurance_discount', 'Decimal(5,2)', '每月', '首年保险优惠折扣（%）'],
      ['gift_package', 'JSON Array', '每周', '赠品清单（如装潢、加油卡等）'],
      ['effective_date', 'Date', '实时', '政策生效日期'],
      ['expire_date', 'Date', '实时', '政策截止日期'],
      ['data_source', 'String', '实时', '数据来源（官网/经销商/第三方）'],
      ['region', 'String', '实时', '适用地区（全国/省市）'],
      ['updated_at', 'DateTime', '实时', '最近更新时间戳'],
    ].map(([a, b, c, d], i) => new TableRow({
      children: [
        dataCell(a, 2200, i % 2 === 0 ? C_LGRAY : C_WHITE, AlignmentType.LEFT, true),
        dataCell(b, 2000, i % 2 === 0 ? C_LGRAY : C_WHITE, AlignmentType.CENTER),
        dataCell(c, 1800, i % 2 === 0 ? C_WHITE : C_LGRAY, AlignmentType.CENTER),
        dataCell(d, 3360, i % 2 === 0 ? C_WHITE : C_LGRAY),
      ]
    })))
  ]
});

// 5. Non-functional Requirements
const nfrTable = () => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [2200, 3000, 4160],
  rows: [
    new TableRow({ children: [hdrCell('质量属性', 2200), hdrCell('指标要求', 3000), hdrCell('实现方案', 4160)] }),
    ...([
      ['性能', '冷启动 ≤ 1.5s（桌面端）', 'Tauri 零 Node 运行时 + 懒加载'],
      ['性能', '搜索响应 ≤ 200ms', 'SQLite FTS5 全文索引 + 内存缓存'],
      ['性能', '内存占用 ≤ 100MB', 'Rust 后端无 GC，WebView 轻量渲染'],
      ['稳定性', '崩溃率 ≤ 0.1%', 'Rust 内存安全 + Sentry 错误监控'],
      ['安全性', '数据加密传输', 'HTTPS / TLS 1.3 全链路加密'],
      ['安全性', '本地数据加密', 'SQLCipher 加密本地数据库'],
      ['可用性', '离线核心功能可用', '本地 SQLite 缓存价格快照'],
      ['兼容性', '桌面三平台', 'Windows 10+ / macOS 12+ / Ubuntu 20+'],
      ['兼容性', '移动双平台', 'iOS 14+ / Android 8+'],
      ['包体积', '安装包 ≤ 10MB（桌面）', 'Tauri 不捆绑 Chromium，使用系统 WebView'],
      ['数据时效', '价格数据 ≤ 24h 延迟', '定时爬虫 + WebSocket 变价推送'],
    ].map(([a, b, c], i) => new TableRow({
      children: [
        dataCell(a, 2200, i % 2 === 0 ? C_LGRAY : C_WHITE, AlignmentType.LEFT, true),
        dataCell(b, 3000, i % 2 === 0 ? C_LGRAY : C_WHITE),
        dataCell(c, 4160, i % 2 === 0 ? C_WHITE : C_LGRAY),
      ]
    })))
  ]
});

// 6. Milestone Table
const milestoneTable = () => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [1200, 1800, 3200, 3160],
  rows: [
    new TableRow({ children: [hdrCell('阶段', 1200), hdrCell('周期', 1800), hdrCell('交付物', 3200), hdrCell('验收标准', 3160)] }),
    ...([
      ['MVP', '第 1-4 周', '基础价格查询 + 贷款政策 + 简单推荐', '核心查询功能可用，数据准确率 ≥ 95%'],
      ['Beta', '第 5-8 周', '多车对比 + 趋势图 + 价格提醒 + 离线缓存', '全平台可安装，UI 通过视觉验收'],
      ['RC', '第 9-12 周', 'AI 智能推荐 + 数据实时推送 + 性能优化', '性能指标全部达标，P0 Bug 清零'],
      ['正式版', '第 13-16 周', '应用商店发布 + 文档 + 运维监控', '上架各平台应用市场，完成压力测试'],
    ].map(([a, b, c, d], i) => new TableRow({
      children: [
        dataCell(a, 1200, i % 2 === 0 ? C_LGRAY : C_WHITE, AlignmentType.CENTER, true),
        dataCell(b, 1800, i % 2 === 0 ? C_LGRAY : C_WHITE, AlignmentType.CENTER),
        dataCell(c, 3200, i % 2 === 0 ? C_WHITE : C_LGRAY),
        dataCell(d, 3160, i % 2 === 0 ? C_WHITE : C_LGRAY),
      ]
    })))
  ]
});

// ─── Build Document ───────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '\u2022',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 260 } } }
        }]
      },
      {
        reference: 'numbers',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 260 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: 'Arial', size: 20, color: C_GRAY } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: C_BLUE },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 }
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: C_BLUE },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 }
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 22, bold: true, font: 'Arial', color: C_ORANGE },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 }
      }
    ]
  },
  sections: [
    // ─── Cover Page ───────────────────────────────────────────
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        ...sp(6),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: '车价通', size: 80, bold: true, font: 'Arial', color: C_BLUE })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'CarPriceHub', size: 40, font: 'Arial', color: C_ORANGE })]
        }),
        ...sp(1),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C_BLUE, space: 4 } },
          children: []
        }),
        ...sp(1),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: '基于 Tauri 技术的多端汽车价格查询 App', size: 32, font: 'Arial', color: C_GRAY })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: '产品需求与技术设计文档', size: 26, font: 'Arial', color: C_GRAY })]
        }),
        ...sp(2),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: '版本：V1.0     日期：2026-03-19', size: 20, font: 'Arial', color: '999999' })]
        }),
        ...sp(8),
        pageBreak(),
      ]
    },
    // ─── Main Content ─────────────────────────────────────────
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C_BLUE, space: 2 } },
            children: [
              new TextRun({ text: '车价通 CarPriceHub — 产品需求与技术设计文档', size: 18, font: 'Arial', color: C_BLUE }),
              new TextRun({ text: '\t', size: 18 }),
            ],
            tabStops: [{ type: 'right', position: 9026 }]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 6, color: C_BLUE, space: 2 } },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: '第 ', size: 16, font: 'Arial', color: C_GRAY }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, font: 'Arial', color: C_GRAY }),
              new TextRun({ text: ' 页', size: 16, font: 'Arial', color: C_GRAY }),
            ]
          })]
        })
      },
      children: [
        // TOC
        new TableOfContents('目录', { hyperlink: true, headingStyleRange: '1-3' }),
        pageBreak(),

        // ── 1. 项目概述 ─────────────────────────────────────────
        h1('1. 项目概述'),
        divider(),
        h2('1.1 项目背景'),
        body('中国汽车市场车型数量超过 1,000 款，各品牌频繁推出限时优惠、贷款贴息、置换补贴等促销政策，信息高度分散。消费者在购车决策时面临"信息不对称"问题：难以快速获取真实落地价，容易被经销商误导，错失优惠窗口期。'),
        ...sp(1),
        body('"车价通 CarPriceHub" 应运而生，旨在聚合全网汽车官方价格与优惠政策，提供一站式查询、对比与智能推荐服务，帮助用户在正确时机、以最优价格购入心仪车型。'),
        ...sp(1),

        h2('1.2 产品定位'),
        ...([
          '面向 C 端消费者的汽车购车参考工具',
          '覆盖 Windows / macOS / Linux / iOS / Android 全平台',
          '聚焦价格透明化：官方价、优惠价、贷款政策、置换补贴一目了然',
          '基于用户预算与需求提供智能个性化推荐',
          '数据实时同步，确保价格信息的准确性与时效性',
        ].map(t => bullet(t, 'bullets'))),
        ...sp(1),

        h2('1.3 产品目标'),
        colorBox('核心目标：让每一位购车用户都能在 30 秒内找到自己的最优购车方案。'),
        ...sp(1),
        twoColTable([
          ['用户规模目标', '上线 3 个月内 DAU 达到 10,000+'],
          ['数据覆盖目标', '覆盖国内主流品牌 50+，在售车型 500+ 款'],
          ['数据准确率', '核心价格字段准确率 ≥ 98%'],
          ['价格时效性', '价格变动后 24 小时内完成数据更新'],
          ['用户满意度', 'App Store / 应用宝评分 ≥ 4.5 星'],
        ]),
        ...sp(1),

        pageBreak(),

        // ── 2. 用户分析 ─────────────────────────────────────────
        h1('2. 用户分析与推荐策略'),
        divider(),
        h2('2.1 目标用户群体'),
        body('基于市场调研与用户访谈，核心目标用户覆盖以下八大群体，系统将依据用户输入的预算区间和使用场景自动匹配推荐车型：'),
        ...sp(1),
        personaTable(),
        ...sp(1),

        h2('2.2 推荐算法策略'),
        h3('2.2.1 基于规则的推荐（Rule-Based）'),
        body('作为基础推荐层，根据用户输入的预算范围、座位需求、能源类型偏好，从数据库中筛选满足条件的车型，按综合评分（优惠力度×口碑评分×性价比）降序排列。'),
        ...sp(1),
        h3('2.2.2 协同过滤推荐（Collaborative Filtering）'),
        body('收集匿名用户行为数据（查询记录、收藏行为），构建用户-车型交互矩阵，为相似偏好用户推荐"别人都在看"的热门车型。'),
        ...sp(1),
        h3('2.2.3 内容相似推荐（Content-Based）'),
        body('基于车型属性向量（排量、轴距、功率、配置分位）计算余弦相似度，在用户查看某款车型时推荐"相似车型"供横向对比。'),
        ...sp(1),

        pageBreak(),

        // ── 3. 功能需求 ─────────────────────────────────────────
        h1('3. 功能需求'),
        divider(),
        h2('3.1 功能模块总览'),
        featureTable(),
        ...sp(1),

        h2('3.2 价格查询模块（核心）'),
        h3('3.2.1 查询入口'),
        body('支持以下多种查询维度：'),
        ...(['按品牌浏览（字母索引 / 国别分类）', '按车型搜索（中文 / 拼音模糊搜索）', '按价格区间筛选', '按能源类型筛选（燃油 / 纯电 / 插混 / 增程 / 氢燃料）', '按车身类型筛选（轿车 / SUV / MPV / 跑车 / 皮卡）'].map(t => bullet(t, 'bullets'))),
        ...sp(1),
        h3('3.2.2 价格详情页'),
        body('每款车型的价格详情页需展示以下信息：'),
        twoColTable([
          ['官方指导价（MSRP）', '厂商建议零售价，精确到千元'],
          ['当前优惠价', '全国均价 + 当地经销商最低报价'],
          ['直接优惠', '官方价与优惠价的差值，以红色高亮显示'],
          ['贷款贴息政策', '支持多档期数（12/24/36/48/60期）利率及月供计算'],
          ['置换补贴', '以旧换新额外补贴金额及适用条件'],
          ['赠品清单', '购车赠品（装潢、保养、加油卡等）折算金额'],
          ['综合优惠总计', '所有优惠叠加后的到手价估算'],
          ['政策有效期', '当前优惠政策的截止日期，过期红色警示'],
        ]),
        ...sp(1),

        h2('3.3 金融贷款计算器'),
        body('内置贷款计算工具，用户可自定义：首付比例、贷款期数（12/24/36/48/60 个月）、是否叠加厂商贴息政策，系统实时计算月供金额、总利息、贴息节省金额，并以等额还款表格展示。'),
        ...sp(1),

        h2('3.4 多车型对比'),
        body('支持同时对比 2-4 款车型，对比维度包括：价格（官方/优惠/综合落地价）、核心配置（动力参数、续航、空间）、优惠政策对比、综合性价比评分。差异项自动高亮标识，帮助用户快速决策。'),
        ...sp(1),

        h2('3.5 价格趋势与提醒'),
        body('展示近 1/3/6/12 个月的价格走势折线图，用户可设置"目标价提醒"，当车型优惠价到达用户设定阈值时，通过系统通知（桌面端）或推送通知（移动端）及时告知。'),
        ...sp(1),

        pageBreak(),

        // ── 4. 技术架构 ─────────────────────────────────────────
        h1('4. 技术架构'),
        divider(),
        h2('4.1 技术选型总览'),
        techTable(),
        ...sp(1),

        h2('4.2 Tauri 多端架构'),
        h3('4.2.1 为什么选择 Tauri？'),
        twoColTable([
          ['包体积', 'Tauri 安装包 ~5-10MB，Electron 通常 >80MB'],
          ['内存占用', 'Tauri 使用系统 WebView，典型内存 <100MB'],
          ['安全性', 'Rust 内存安全，IPC 白名单机制，最小权限原则'],
          ['性能', 'Rust 后端零 GC，高并发数据处理无停顿'],
          ['跨平台', 'Tauri 2.x 原生支持 Windows/macOS/Linux/iOS/Android'],
          ['原生能力', '系统托盘、原生通知、文件系统、HTTP、WebSocket'],
        ]),
        ...sp(1),
        h3('4.2.2 整体架构分层'),
        colorBox('前端层（React + TypeScript）→ Tauri IPC Bridge → Rust 后端层 → 本地 SQLite 缓存 + 远程 REST/WebSocket API'),
        ...sp(1),
        body('各层职责：'),
        ...[
          '前端层：UI 渲染、用户交互、状态管理、图表可视化，通过 Tauri invoke() 调用 Rust 命令',
          'Rust 后端层：业务逻辑处理、本地数据库读写、HTTP 请求、WebSocket 连接管理、系统通知',
          '本地缓存层：SQLite 存储价格快照，支持离线查询，FTS5 全文索引加速搜索',
          '远端服务层：Rust Axum API 服务提供价格数据接口，PostgreSQL 存储全量历史数据',
        ].map(t => bullet(t, 'bullets')),
        ...sp(1),

        h2('4.3 核心数据流'),
        h3('4.3.1 价格查询数据流'),
        ...[
          '用户输入关键词 → 前端触发 invoke("search_cars") → Rust 查询本地 SQLite',
          '若本地缓存过期（>24h）→ Rust 发起 HTTP 请求到后端 API 拉取最新数据',
          '后端 API 返回 JSON → Rust 解析并更新本地 SQLite → 返回结果给前端渲染',
          'WebSocket 连接维持后台实时监听，价格变动时主动推送给前端刷新',
        ].map((t, i) => bullet(`步骤${i+1}：${t}`, 'numbers')),
        ...sp(1),
        h3('4.3.2 价格提醒数据流'),
        ...[
          '用户设置目标价 → Rust 持久化到 SQLite user_alerts 表',
          'Tauri 后台任务每小时轮询价格 → 与 user_alerts 对比',
          '触发条件满足 → 调用 tauri-plugin-notification 发送系统通知',
        ].map((t, i) => bullet(`步骤${i+1}：${t}`, 'numbers')),
        ...sp(1),

        pageBreak(),

        // ── 5. 数据字段 ─────────────────────────────────────────
        h1('5. 数据字段与接口设计'),
        divider(),
        h2('5.1 核心价格数据字段'),
        body('以下为汽车价格信息的核心数据结构，用于前后端交互和本地数据库存储：'),
        ...sp(1),
        dataFieldTable(),
        ...sp(1),

        h2('5.2 核心 API 接口'),
        h3('5.2.1 价格查询接口'),
        colorBox('GET /api/v1/cars/search?keyword={kw}&budget_min={min}&budget_max={max}&energy_type={type}&page={p}'),
        body('返回字段：car_id、brand、model_name、official_price、discount_price、direct_discount、loan_subsidy_amount、综合推荐评分'),
        ...sp(1),
        h3('5.2.2 价格详情接口'),
        colorBox('GET /api/v1/cars/{car_id}/price-detail'),
        body('返回该车型完整价格政策，包含所有优惠项目列表（JSON Array），支持按地区查询（?region=广东）'),
        ...sp(1),
        h3('5.2.3 实时推送 WebSocket'),
        colorBox('WSS /ws/price-watch?car_ids=car_001,car_002,...'),
        body('客户端订阅指定车型价格变化，服务端价格更新时推送 {car_id, field, old_value, new_value, updated_at} 事件'),
        ...sp(1),
        h3('5.2.4 智能推荐接口'),
        colorBox('POST /api/v1/recommend  Body: {budget_min, budget_max, seat_count, energy_type, use_case, user_id?}'),
        body('基于规则 + 协同过滤混合推荐，返回最多 10 款推荐车型及推荐理由说明'),
        ...sp(1),

        pageBreak(),

        // ── 6. 非功能需求 ──────────────────────────────────────
        h1('6. 非功能性需求'),
        divider(),
        nfrTable(),
        ...sp(1),

        // ── 7. UI/UX ───────────────────────────────────────────
        h1('7. UI/UX 设计规范'),
        divider(),
        h2('7.1 设计原则'),
        ...[
          '极简高效：主要操作不超过 3 步完成，信息密度适中',
          '数据可信：价格数字放大显示，优惠金额用红色/绿色对比强调',
          '跨端一致：桌面端与移动端保持品牌视觉统一，适配不同屏幕尺寸',
          '无障碍支持：文字对比度 ≥ 4.5:1，支持屏幕阅读器',
        ].map(t => bullet(t, 'bullets')),
        ...sp(1),
        h2('7.2 视觉规范'),
        twoColTable([
          ['主色调', '#1565C0（深蓝）—— 传递专业、可信赖感'],
          ['强调色', '#E65100（深橙）—— 优惠价格、促销信息高亮'],
          ['成功色', '#2E7D32（深绿）—— 价格下降、利好信息'],
          ['警告色', '#F57F17（琥珀）—— 政策即将到期提示'],
          ['错误色', '#C62828（深红）—— 数据异常、政策过期警示'],
          ['主字体', 'HarmonyOS Sans CN / PingFang SC / Arial（备用）'],
          ['图标风格', 'Lucide Icons —— 线性风格，与整体简洁风格一致'],
          ['圆角规范', '小组件 4px，卡片 12px，对话框 16px'],
          ['阴影', 'box-shadow: 0 2px 8px rgba(0,0,0,0.08)'],
        ]),
        ...sp(1),
        h2('7.3 核心页面布局'),
        ...[
          '首页：顶部搜索栏 + 快捷筛选标签 + 热门车型卡片流（瀑布流布局）',
          '搜索结果页：左侧筛选面板（桌面）/ 底部抽屉（移动）+ 右侧结果列表',
          '价格详情页：车型大图 + 价格卡片（官方/优惠/落地价三栏对比）+ 政策详情折叠面板 + 相似推荐',
          '对比页：固定顶栏（最多4辆）+ 滚动属性对比表格，差异项黄色高亮',
          '智能推荐页：引导式问卷（预算/座位/能源/用途）+ 结果卡片 + 详细理由',
          '我的页：收藏夹 / 价格提醒列表 / 查询历史 / 设置',
        ].map(t => bullet(t, 'bullets')),
        ...sp(1),

        pageBreak(),

        // ── 8. 开发计划 ────────────────────────────────────────
        h1('8. 开发计划与里程碑'),
        divider(),
        h2('8.1 项目里程碑'),
        milestoneTable(),
        ...sp(1),
        h2('8.2 团队配置建议'),
        twoColTable([
          ['产品经理', '1 人 —— 需求管理、原型设计、数据验收'],
          ['前端工程师', '2 人 —— React + Tauri 前端、UI 实现'],
          ['Rust 后端工程师', '1 人 —— Tauri 命令层、本地 SQLite、推送'],
          ['后端/数据工程师', '1 人 —— API 服务、数据爬虫、推荐算法'],
          ['UI/UX 设计师', '1 人 —— 视觉设计、交互原型'],
          ['测试工程师', '1 人 —— 功能测试、多平台兼容性测试'],
        ]),
        ...sp(1),

        h2('8.3 风险与应对'),
        twoColTable([
          ['数据合规风险', '与汽车之家、懂车帝等平台协商数据授权，或接入官方厂商 API，规避爬虫封禁风险'],
          ['Tauri 移动端成熟度', 'Tauri 2.x Mobile 仍处于快速迭代阶段，建议移动端 Beta 阶段加强回归测试'],
          ['数据时效性', '建立多数据源冗余机制，主源失效时自动切换备用源，保障更新频率'],
          ['用户冷启动', '初期提供"最佳优惠榜"、"即将涨价"等运营内容驱动用户活跃，降低冷启动门槛'],
        ]),
        ...sp(1),

        pageBreak(),

        // ── 9. 附录 ────────────────────────────────────────────
        h1('9. 附录'),
        divider(),
        h2('9.1 关键术语'),
        twoColTable([
          ['MSRP', 'Manufacturer\'s Suggested Retail Price，厂商建议零售价，即官方指导价'],
          ['贷款贴息', '厂商或经销商为促进销售，承担部分贷款利息，使客户享受低于市场利率的贷款成本'],
          ['置换补贴', '用户以旧车换新车时，厂商或国家政策给予的额外价格优惠'],
          ['落地价', '车辆实际交付时买家需支付的全部费用，包括裸车价、购置税、保险、上牌费等'],
          ['综合优惠', '直接降价 + 贷款贴息 + 置换补贴 + 赠品折算 的总和'],
          ['Tauri IPC', '进程间通信，前端 WebView 与 Rust 后端通过 invoke/emit 交换数据的机制'],
          ['SQLite FTS5', 'SQLite 内置全文搜索引擎，支持中文分词（需配合 jieba 分词插件）'],
          ['WebSocket', '全双工通信协议，用于服务端主动向客户端推送实时价格变动消息'],
        ]),
        ...sp(1),
        h2('9.2 参考资料'),
        ...[
          'Tauri 2.x 官方文档：https://tauri.app/v2/guide/',
          'Tauri Mobile 支持：https://tauri.app/v2/distribute/mobile/',
          'React 官方文档：https://react.dev',
          'Ant Design 组件库：https://ant.design',
          'ECharts 可视化：https://echarts.apache.org',
          'tauri-plugin-sql（SQLite）：https://github.com/tauri-apps/plugins-workspace',
          'tauri-plugin-notification：https://github.com/tauri-apps/plugins-workspace',
        ].map(t => bullet(t, 'bullets')),
        ...sp(2),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: C_BLUE, space: 4 } },
          children: [new TextRun({ text: '— 文档结束 —', size: 18, font: 'Arial', color: '999999' })]
        }),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('c:/Users/Administrator/WorkBuddy/20260319091322/车价通_CarPriceHub产品需求与技术设计文档_V1.0.docx', buf);
  console.log('DONE');
});
