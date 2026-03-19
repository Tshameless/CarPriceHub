const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageBreak, LevelFormat, PageOrientation
} = require('docx');
const fs = require('fs');

// ── Palette ──────────────────────────────────────────────────
const BLUE    = '1565C0';
const DBLUE   = '0D47A1';
const LBLUE   = 'BBDEFB';
const XBLUE   = 'E3F2FD';
const ORANGE  = 'E65100';
const LORANGE = 'FFF3E0';
const GREEN   = '2E7D32';
const LGREEN  = 'E8F5E9';
const WHITE   = 'FFFFFF';
const DARK    = '212121';
const MGRAY   = '455A64';
const LGRAY   = 'ECEFF1';
const GOLD    = 'F9A825';

// ── Helpers ──────────────────────────────────────────────────
// A4 Landscape: 16838 wide, 11906 tall (in DXA)
// Margins: top/bottom 720, left/right 800
// Content width = 16838 - 1600 = 15238 DXA
const CW = 15238;

const border1 = (c) => ({ style: BorderStyle.SINGLE, size: 6, color: c });
const allB    = (c = 'CCCCCC') => ({ top: border1(c), bottom: border1(c), left: border1(c), right: border1(c) });
const noB     = () => ({ top: { style: BorderStyle.NONE, size: 0, color: WHITE }, bottom: { style: BorderStyle.NONE, size: 0, color: WHITE }, left: { style: BorderStyle.NONE, size: 0, color: WHITE }, right: { style: BorderStyle.NONE, size: 0, color: WHITE } });

const sp = (n = 1) => Array.from({ length: n }, () => new Paragraph({ children: [] }));
const pb = () => new Paragraph({ children: [new PageBreak()] });

// Big section title with colored bar on left (simulate with shading)
const secTitle = (emoji, title, sub) => new Paragraph({
  shading: { fill: DBLUE, type: ShadingType.CLEAR },
  indent: { left: 200, right: 200 },
  spacing: { before: 0, after: 0 },
  children: [
    new TextRun({ text: `${emoji}  ${title}`, size: 56, bold: true, font: 'Arial', color: WHITE }),
    ...(sub ? [new TextRun({ text: `   ${sub}`, size: 28, bold: false, font: 'Arial', color: LBLUE })] : []),
  ]
});

const subTitle = (text) => new Paragraph({
  spacing: { before: 160, after: 80 },
  children: [new TextRun({ text, size: 36, bold: true, font: 'Arial', color: BLUE })]
});

const bodyTxt = (text, size = 22) => new Paragraph({
  spacing: { before: 60, after: 40 },
  children: [new TextRun({ text, size, font: 'Arial', color: MGRAY })]
});

const divider = (color = BLUE) => new Paragraph({
  spacing: { before: 60, after: 60 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color, space: 1 } },
  children: []
});

// Highlight box
const hBox = (text, fill = XBLUE, textColor = BLUE, size = 22) => new Paragraph({
  shading: { fill, type: ShadingType.CLEAR },
  indent: { left: 180, right: 180 },
  spacing: { before: 80, after: 80 },
  children: [new TextRun({ text, size, font: 'Arial', color: textColor, bold: true })]
});

const bullet = (text, ref = 'bul') => new Paragraph({
  numbering: { reference: ref, level: 0 },
  spacing: { before: 40, after: 40 },
  children: [new TextRun({ text, size: 22, font: 'Arial', color: MGRAY })]
});

// Table cells
const hCell = (text, w, fill = DBLUE) => new TableCell({
  borders: allB(BLUE),
  width: { size: w, type: WidthType.DXA },
  shading: { fill, type: ShadingType.CLEAR },
  margins: { top: 120, bottom: 120, left: 160, right: 160 },
  verticalAlign: VerticalAlign.CENTER,
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, size: 22, bold: true, font: 'Arial', color: WHITE })]
  })]
});

const dCell = (text, w, fill = WHITE, align = AlignmentType.LEFT, bold = false, color = DARK, size = 21) =>
  new TableCell({
    borders: allB(),
    width: { size: w, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 160, right: 160 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, size, font: 'Arial', bold, color })]
    })]
  });

// ── Badge-style label ─────────────────────────────────────────
const badge = (label, fill, labelColor = WHITE) => new Paragraph({
  spacing: { before: 0, after: 0 },
  children: [new TextRun({ text: ` ${label} `, size: 18, font: 'Arial', color: labelColor, bold: true,
    shading: { fill, type: ShadingType.CLEAR } })]
});

// ── Stats Cards (3-col table) ─────────────────────────────────
const statsRow = (items) => {
  // items: [{num, unit, label}]
  const colW = Math.floor(CW / items.length);
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: items.map(() => colW),
    rows: [new TableRow({
      children: items.map(({ num, unit, label, fill = XBLUE }) =>
        new TableCell({
          borders: noB(),
          width: { size: colW, type: WidthType.DXA },
          shading: { fill, type: ShadingType.CLEAR },
          margins: { top: 160, bottom: 160, left: 200, right: 200 },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: num, size: 72, bold: true, font: 'Arial', color: BLUE }),
                new TextRun({ text: unit, size: 28, bold: true, font: 'Arial', color: ORANGE }),
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 60 },
              children: [new TextRun({ text: label, size: 20, font: 'Arial', color: MGRAY })]
            })
          ]
        })
      )
    })]
  });
};

// ── Generic table builder ─────────────────────────────────────
const buildTable = (cols, rows) => {
  const totalW = cols.reduce((a, c) => a + c.w, 0);
  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: cols.map(c => c.w),
    rows: [
      new TableRow({ children: cols.map(c => hCell(c.label, c.w)) }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => dCell(
          cell,
          cols[ci].w,
          ri % 2 === 0 ? LGRAY : WHITE,
          ci === 0 ? AlignmentType.LEFT : AlignmentType.LEFT,
          ci === 0,
          ci === 0 ? DARK : MGRAY
        ))
      }))
    ]
  });
};

// ──────────────────────────────────────────────────────────────
//  PAGE SECTIONS
// ──────────────────────────────────────────────────────────────

const pageProps = {
  size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE },
  margin: { top: 720, right: 800, bottom: 720, left: 800 }
};

// ---- COVER ----
const coverSection = {
  properties: { page: pageProps },
  children: [
    ...sp(3),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { fill: DBLUE, type: ShadingType.CLEAR },
      spacing: { before: 200, after: 200 },
      children: [new TextRun({ text: '  🚗  车价通  CarPriceHub  ', size: 96, bold: true, font: 'Arial', color: WHITE })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 100 },
      children: [new TextRun({ text: '基于 Tauri 的多端汽车价格查询 App', size: 44, font: 'Arial', color: BLUE })]
    }),
    divider(BLUE),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80 },
      children: [new TextRun({ text: '产品需求 · 技术架构 · 数据设计 · 开发计划', size: 28, font: 'Arial', color: MGRAY })]
    }),
    ...sp(2),
    statsRow([
      { num: '500+', unit: '款', label: '在售车型全覆盖', fill: XBLUE },
      { num: '5',   unit: '端', label: 'Win/Mac/Linux/iOS/Android', fill: LORANGE },
      { num: '24h', unit: '',   label: '价格数据实时更新', fill: LGREEN },
      { num: '30s', unit: '',   label: '找到最优购车方案', fill: LGRAY },
    ]),
    ...sp(3),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'V1.0  ·  2026-03-19  ·  直播专用版', size: 20, font: 'Arial', color: '999999' })]
    }),
  ]
};

// ---- PAGE: 痛点 & 产品定位 ----
const page1 = {
  properties: { page: pageProps },
  children: [
    secTitle('🎯', '我们在解决什么问题？'),
    ...sp(1),
    new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [Math.floor(CW / 2) - 100, Math.floor(CW / 2) + 100],
      rows: [new TableRow({
        children: [
          new TableCell({
            borders: allB(ORANGE),
            width: { size: Math.floor(CW / 2) - 100, type: WidthType.DXA },
            shading: { fill: LORANGE, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 240, right: 240 },
            children: [
              new Paragraph({ children: [new TextRun({ text: '😤  当前痛点', size: 32, bold: true, font: 'Arial', color: ORANGE })] }),
              divider(ORANGE),
              ...['车型超 1000 款，价格信息极度分散', '经销商报价水分大，消费者难辨真假', '贷款贴息、置换补贴政策看不懂', '优惠窗口期短，错过就是多花几万', '没有工具帮你对比哪款更划算'].map(t => bullet('❌  ' + t, 'bul')),
            ]
          }),
          new TableCell({
            borders: allB(GREEN),
            width: { size: Math.floor(CW / 2) + 100, type: WidthType.DXA },
            shading: { fill: LGREEN, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 240, right: 240 },
            children: [
              new Paragraph({ children: [new TextRun({ text: '✅  车价通 解决方案', size: 32, bold: true, font: 'Arial', color: GREEN })] }),
              divider(GREEN),
              ...['聚合官方价 + 优惠价 + 贷款政策，一站查清', '实时更新，价格变动 24h 内刷新', '智能推荐：输入预算，自动匹配最优车型', '多车横向对比，差异一目了然', '价格提醒：目标价到达，系统主动通知你'].map(t => bullet('✅  ' + t, 'bul')),
            ]
          })
        ]
      })]
    }),
    ...sp(1),
    hBox('💡  核心价值：让每位用户在 30 秒内找到最优购车方案，省钱省时省心', XBLUE, BLUE, 26),
  ]
};

// ---- PAGE: 功能全景 ----
const page2 = {
  properties: { page: pageProps },
  children: [
    secTitle('📦', '核心功能模块', '— 6 大模块，覆盖购车全流程'),
    ...sp(1),
    new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [Math.floor(CW/3), Math.floor(CW/3), CW - Math.floor(CW/3)*2],
      rows: [
        new TableRow({ children: [
          new TableCell({ borders: allB(BLUE), width: { size: Math.floor(CW/3), type: WidthType.DXA }, shading: { fill: DBLUE, type: ShadingType.CLEAR }, margins: { top: 160, bottom: 160, left: 200, right: 200 }, children: [
            new Paragraph({ children: [new TextRun({ text: '🔍  价格查询', size: 36, bold: true, font: 'Arial', color: WHITE })] }),
            ...sp(1),
            ...['官方指导价（MSRP）', '实时优惠成交价', '直接优惠金额（红色高亮）', '政策有效期倒计时', '按品牌/车型/价格段/能源类型筛选'].map(t => new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: '  •  ' + t, size: 20, font: 'Arial', color: LBLUE })] })),
          ]}),
          new TableCell({ borders: allB(BLUE), width: { size: Math.floor(CW/3), type: WidthType.DXA }, shading: { fill: BLUE, type: ShadingType.CLEAR }, margins: { top: 160, bottom: 160, left: 200, right: 200 }, children: [
            new Paragraph({ children: [new TextRun({ text: '💳  金融政策', size: 36, bold: true, font: 'Arial', color: WHITE })] }),
            ...sp(1),
            ...['贷款贴息方案（12~60期）', '置换补贴查询', '月供实时计算器', '贴息节省金额估算', '综合优惠到手价汇总'].map(t => new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: '  •  ' + t, size: 20, font: 'Arial', color: LBLUE })] })),
          ]}),
          new TableCell({ borders: allB(BLUE), width: { size: CW - Math.floor(CW/3)*2, type: WidthType.DXA }, shading: { fill: '1976D2', type: ShadingType.CLEAR }, margins: { top: 160, bottom: 160, left: 200, right: 200 }, children: [
            new Paragraph({ children: [new TextRun({ text: '🤖  智能推荐', size: 36, bold: true, font: 'Arial', color: WHITE })] }),
            ...sp(1),
            ...['输入预算 → 自动匹配车型', '按用途推荐（家用/商务/越野）', '规则 + 协同过滤混合算法', 'AI 个性化推荐理由', '相似车型横向对比推荐'].map(t => new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: '  •  ' + t, size: 20, font: 'Arial', color: LBLUE })] })),
          ]}),
        ]}),
        new TableRow({ children: [
          new TableCell({ borders: allB(BLUE), width: { size: Math.floor(CW/3), type: WidthType.DXA }, shading: { fill: LGRAY, type: ShadingType.CLEAR }, margins: { top: 160, bottom: 160, left: 200, right: 200 }, children: [
            new Paragraph({ children: [new TextRun({ text: '📊  多车对比', size: 36, bold: true, font: 'Arial', color: BLUE })] }),
            ...sp(1),
            ...['最多 4 款车同框对比', '价格 / 配置 / 优惠多维度', '差异项自动黄色高亮', '综合性价比评分', '一键跳转购买咨询'].map(t => new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: '  •  ' + t, size: 20, font: 'Arial', color: MGRAY })] })),
          ]}),
          new TableCell({ borders: allB(BLUE), width: { size: Math.floor(CW/3), type: WidthType.DXA }, shading: { fill: LORANGE, type: ShadingType.CLEAR }, margins: { top: 160, bottom: 160, left: 200, right: 200 }, children: [
            new Paragraph({ children: [new TextRun({ text: '📈  价格趋势', size: 36, bold: true, font: 'Arial', color: ORANGE })] }),
            ...sp(1),
            ...['近 12 个月价格走势图', '历史最低价标注', '价格提醒（系统通知）', '目标价到达自动推送', '节假日促销规律分析'].map(t => new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: '  •  ' + t, size: 20, font: 'Arial', color: MGRAY })] })),
          ]}),
          new TableCell({ borders: allB(BLUE), width: { size: CW - Math.floor(CW/3)*2, type: WidthType.DXA }, shading: { fill: LGREEN, type: ShadingType.CLEAR }, margins: { top: 160, bottom: 160, left: 200, right: 200 }, children: [
            new Paragraph({ children: [new TextRun({ text: '👤  我的收藏', size: 36, bold: true, font: 'Arial', color: GREEN })] }),
            ...sp(1),
            ...['收藏车型管理', '查询历史记录', '价格提醒列表', '本地离线缓存', '跨端数据同步（可选）'].map(t => new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: '  •  ' + t, size: 20, font: 'Arial', color: MGRAY })] })),
          ]}),
        ]}),
      ]
    }),
  ]
};

// ---- PAGE: 用户画像采集维度 ----
const pageProfile = {
  properties: { page: pageProps },
  children: [
    secTitle('👤', '用户画像 — 买车前先了解你自己', '— 填写越详细，推荐越精准'),
    ...sp(1),
    new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [Math.floor(CW / 3), Math.floor(CW / 3), CW - Math.floor(CW / 3) * 2],
      rows: [new TableRow({ children: [
        // 财务状况
        new TableCell({
          borders: allB(BLUE),
          width: { size: Math.floor(CW / 3), type: WidthType.DXA },
          shading: { fill: XBLUE, type: ShadingType.CLEAR },
          margins: { top: 160, bottom: 160, left: 220, right: 220 },
          children: [
            new Paragraph({ children: [new TextRun({ text: '💰  财务状况', size: 32, bold: true, font: 'Arial', color: BLUE })] }),
            divider(BLUE),
            buildTable(
              [{ label: '采集字段', w: 2000 }, { label: '选项 / 范围', w: 2700 }],
              [
                ['月收入（税后）', '< 5k / 5-1万 / 1-2万 / 2-3万 / 3万+'],
                ['家庭月总收入', '< 1万 / 1-2万 / 2-4万 / 4万+'],
                ['可用首付存款', '< 3万 / 3-8万 / 8-15万 / 15万+'],
                ['月供承受上限', '< 1k / 1-2k / 2-3k / 3-5k / 不贷款'],
                ['是否有房贷/租金', '无 / 有（填写月支出）'],
                ['信用评级', '优秀 / 良好 / 一般（影响贷款利率）'],
              ]
            ),
          ]
        }),
        // 家庭情况
        new TableCell({
          borders: allB(GREEN),
          width: { size: Math.floor(CW / 3), type: WidthType.DXA },
          shading: { fill: LGREEN, type: ShadingType.CLEAR },
          margins: { top: 160, bottom: 160, left: 220, right: 220 },
          children: [
            new Paragraph({ children: [new TextRun({ text: '👨‍👩‍👧  家庭情况', size: 32, bold: true, font: 'Arial', color: GREEN })] }),
            divider(GREEN),
            buildTable(
              [{ label: '采集字段', w: 2000 }, { label: '选项', w: 2700 }],
              [
                ['婚姻状况', '未婚 / 已婚 / 离异'],
                ['是否有小孩', '无 / 1个 / 2个及以上'],
                ['小孩年龄段', '0-3岁 / 4-12岁 / 13岁+'],
                ['是否与父母同住', '是 / 否（影响座位需求）'],
                ['家庭常住人口', '1人 / 2人 / 3-4人 / 5人+'],
                ['是否计划近期生育', '是 / 否（影响车型空间推荐）'],
              ]
            ),
          ]
        }),
        // 用车情况
        new TableCell({
          borders: allB(ORANGE),
          width: { size: CW - Math.floor(CW / 3) * 2, type: WidthType.DXA },
          shading: { fill: LORANGE, type: ShadingType.CLEAR },
          margins: { top: 160, bottom: 160, left: 220, right: 220 },
          children: [
            new Paragraph({ children: [new TextRun({ text: '🚗  用车情况', size: 32, bold: true, font: 'Arial', color: ORANGE })] }),
            divider(ORANGE),
            buildTable(
              [{ label: '采集字段', w: 2000 }, { label: '选项', w: 2700 }],
              [
                ['是否已有车', '无（首车） / 有1辆 / 有2辆+'],
                ['旧车是否置换', '是（填写旧车估值） / 否'],
                ['主要使用场景', '上下班通勤 / 家庭出行 / 商务接待 / 自驾游'],
                ['日均行驶里程', '< 30km / 30-80km / 80km+'],
                ['停车条件', '固定车位/充电桩 / 地下停车场 / 路边停车'],
                ['限行/限牌城市', '是（牌照摇号/竞拍） / 否'],
              ]
            ),
          ]
        }),
      ]})]
    }),
    ...sp(1),
    hBox('🔑  核心原则：首付 ≤ 存款 × 50%，月供 ≤ 月收入 × 30%，总车价 ≤ 家庭年收入 × 50% — 超出则主动警示', XBLUE, BLUE, 22),
  ]
};

// ---- PAGE: 综合评分模型 ----
const pageScore = {
  properties: { page: pageProps },
  children: [
    secTitle('🧮', '综合评分模型 — 怎么算出"最适合你"', '— 多维度加权打分，输出个性化推荐理由'),
    ...sp(1),
    new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [Math.floor(CW * 0.48), Math.floor(CW * 0.52)],
      rows: [new TableRow({ children: [
        // 左：评分维度
        new TableCell({
          borders: allB(BLUE),
          width: { size: Math.floor(CW * 0.48), type: WidthType.DXA },
          shading: { fill: XBLUE, type: ShadingType.CLEAR },
          margins: { top: 160, bottom: 160, left: 240, right: 240 },
          children: [
            new Paragraph({ children: [new TextRun({ text: '📊  综合评分维度 & 权重', size: 28, bold: true, font: 'Arial', color: BLUE })] }),
            divider(BLUE),
            buildTable(
              [{ label: '评分维度', w: 2200 }, { label: '权重', w: 1200 }, { label: '影响因素', w: 3700 }],
              [
                ['财务健康度', '30%', '月供/收入比、首付压力、贷款期数'],
                ['家庭适配度', '25%', '座位数、后备箱、ISOFIX、儿童安全'],
                ['用车场景匹配', '20%', '续航/油耗 × 日均里程、停车适配'],
                ['首车保障系数', '10%', '操控难度、保险费率、维修便利性'],
                ['性价比指数', '10%', '优惠力度、同级口碑、保值率'],
                ['政策红利系数', '5%', '限牌城市新能源优先、国补地补可叠加'],
              ]
            ),
            ...sp(1),
            hBox('最终推荐分 = Σ(维度得分 × 权重)，Top3 车型附带文字推荐理由', LGRAY, MGRAY, 20),
          ]
        }),
        // 右：典型场景示例
        new TableCell({
          borders: allB(BLUE),
          width: { size: Math.floor(CW * 0.52), type: WidthType.DXA },
          shading: { fill: LGRAY, type: ShadingType.CLEAR },
          margins: { top: 160, bottom: 160, left: 240, right: 240 },
          children: [
            new Paragraph({ children: [new TextRun({ text: '💡  典型场景 — 同样预算，不同推荐', size: 28, bold: true, font: 'Arial', color: BLUE })] }),
            divider(BLUE),
            buildTable(
              [{ label: '用户情况', w: 3600 }, { label: '推荐结论', w: 4100 }],
              [
                ['月入1.5万，未婚，首车，存款8万，通勤30km', '→ 比亚迪秦PLUS DM-i（低月供+低油耗，首车好开）'],
                ['月入1.5万，已婚有娃，存款8万，家庭出行为主', '→ 吉利星越L / 大众途岳（7座空间，ISOFIX，家用优先）'],
                ['月入2万，单身，有一辆代步车，存款15万', '→ 小鹏G6 / 比亚迪海豹（科技感+性能，第二辆玩乐向）'],
                ['月入2万，已婚，上海限牌，存款15万', '→ 新能源优先：特斯拉Model Y / 问界M5（绿牌免摇号）'],
                ['月入3万，有娃，旧车置换，商务+家用兼顾', '→ 别克GL8 / 大众迈腾（置换补贴叠加+商务形象）'],
                ['月入1万，刚结婚，无存款，急需购车', '→ 风险提示⚠️  建议先攒首付再购车 / 可考虑二手车'],
              ]
            ),
            ...sp(1),
            hBox('⚠️  财务红线保护：若月供 > 月收入40% 或 首付 > 存款60%，系统强制显示风险警告并推荐降级方案', LORANGE, ORANGE, 20),
          ]
        })
      ]})]
    }),
  ]
};

// ---- PAGE: 用户推荐策略（升级版）----
const page3 = {
  properties: { page: pageProps },
  children: [
    secTitle('🎪', '智能推荐矩阵 — 个人情况 × 预算 → 最优解', '— 8 大人群 × 财务/家庭/用车三维度交叉推荐'),
    ...sp(1),
    buildTable(
      [
        { label: '用户群体', w: 1800 },
        { label: '关键个人情况', w: 3200 },
        { label: '推荐策略重点', w: 2000 },
        { label: '推荐车型（示例）', w: 4200 },
        { label: '优惠政策亮点', w: 4038 },
      ],
      [
        ['🚀 首次购车\n单身/无娃', '月入 5k-1万，存款 3-8万\n未婚，无旧车，通勤为主', '低首付低月供\n操控简单易上手\n维修便宜保险低', '比亚迪海鸥、五菱缤果\n吉利帝豪、长安逸动', '厂商直降+贴息\n首年商业险优惠套餐'],
        ['🏠 刚需家庭\n已婚有娃', '月入 1-2万，存款 8-15万\n1-2个孩子，家庭出行多', '5座以上空间优先\nISOFIX安全座椅\n后备箱 ≥ 450L', '大众途岳、本田CR-V\n比亚迪宋PLUS、吉利星越L', '置换补贴+赠保养\n儿童安全座椅赠品'],
        ['⬆️ 改善升级\n二孩家庭', '月入 2-3万，存款 15-25万\n两孩，与父母同住', '6/7座MPV或大SUV\n第三排乘坐舒适度\n低噪音', '别克GL8、大众途昂\n理想L7/L9、岚图梦想家', '低息金融+置换+赠礼'],
        ['⚡ 新能源首选\n限牌城市', '月入 1.5-3万\n上海/北京/广州等限牌城市', '绿牌免摇号优先\n充电条件满足（有固定车位）\n续航 ≥ 500km', '特斯拉Model Y、问界M5\n比亚迪汉EV、小鹏G6', '国补+地补叠加\n免购置税+绿牌'],
        ['💼 商务务实\n有车置换', '月入 3万+，存款 20万+\n有旧车，商务接待多', '品牌溢价+后排体验\n旧车置换最大化', '宝马3系、奔驰C级\n奥迪A4L、雷克萨斯ES', '置换补贴+金融贴息\n延保+道路救援'],
        ['👨‍👩‍👦 三代同行\n大家庭', '月入 2万+，家庭人口5+\n老人小孩需兼顾', '7座强制要求\n上下车便利（老人)\n胎压/安全配置丰富', '丰田塞纳、别克GL8\n大众威然、菲克大指挥官', '团购优惠+赠装潢'],
        ['🏔️ 自驾游\n第二辆车', '月入 2万+，已有代步车\n热爱户外越野', '四驱通过性\n长途续航/油耗\n拖挂能力', '坦克300/400、Jeep牧马人\n大众途锐、福特F-150猛禽', '限时直降+改装礼包'],
        ['⚠️ 财务压力型\n量力而行', '月入 < 8k，存款 < 5万\n急需用车但资金紧张', '系统主动降档推荐\n建议先攒首付\n或推荐靠谱二手车', '建议：准新二手车市场\n宝骏/五菱 入门新车\n或分期 2 年内还清', '强制风险提示\n月供不超收入30%'],
      ]
    ),
    ...sp(1),
    hBox('📌  推荐公式：财务健康度(30%) + 家庭适配度(25%) + 场景匹配(20%) + 首车系数(10%) + 性价比(10%) + 政策红利(5%)', XBLUE, BLUE, 22),
  ]
};

// ---- PAGE: 技术架构 ----
const page4 = {
  properties: { page: pageProps },
  children: [
    secTitle('⚙️', '技术架构 — 为什么选 Tauri？'),
    ...sp(1),
    new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [Math.floor(CW * 0.42), Math.floor(CW * 0.58)],
      rows: [new TableRow({ children: [
        new TableCell({
          borders: allB(BLUE),
          width: { size: Math.floor(CW * 0.42), type: WidthType.DXA },
          shading: { fill: XBLUE, type: ShadingType.CLEAR },
          margins: { top: 160, bottom: 160, left: 240, right: 240 },
          children: [
            new Paragraph({ children: [new TextRun({ text: 'Tauri vs Electron 核心对比', size: 28, bold: true, font: 'Arial', color: BLUE })] }),
            divider(BLUE),
            buildTable(
              [{ label: '指标', w: 1800 }, { label: 'Tauri ✅', w: 1600 }, { label: 'Electron ❌', w: 1600 }],
              [
                ['安装包大小', '~5-10 MB', '>80 MB'],
                ['内存占用', '<100 MB', '>200 MB'],
                ['启动时间', '<1.5s', '>3s'],
                ['后端语言', 'Rust（安全）', 'Node.js'],
                ['移动端支持', '✅ 原生', '❌ 不支持'],
                ['安全沙箱', '✅ 白名单', '⚠️ 较弱'],
              ]
            ),
          ]
        }),
        new TableCell({
          borders: allB(BLUE),
          width: { size: Math.floor(CW * 0.58), type: WidthType.DXA },
          shading: { fill: LGRAY, type: ShadingType.CLEAR },
          margins: { top: 160, bottom: 160, left: 240, right: 240 },
          children: [
            new Paragraph({ children: [new TextRun({ text: '整体技术栈', size: 28, bold: true, font: 'Arial', color: BLUE })] }),
            divider(BLUE),
            buildTable(
              [{ label: '层次', w: 1800 }, { label: '技术选型', w: 2400 }, { label: '职责', w: 4438 }],
              [
                ['展示层', 'React + TypeScript', 'UI 渲染 / 交互 / 图表可视化'],
                ['状态管理', 'Zustand', '全局状态，轻量无 Redux 模板代码'],
                ['UI 组件', 'Ant Design / shadcn', '企业级组件，主题定制'],
                ['跨端引擎', 'Tauri 2.x', '桥接前端 WebView 与 Rust 后端'],
                ['本地数据', 'SQLite + FTS5', '离线价格缓存，毫秒级搜索'],
                ['后端服务', 'Rust Axum', '高性能 API，数据抓取聚合'],
                ['数据库', 'PostgreSQL', '全量历史价格存储'],
                ['实时推送', 'WebSocket', '价格变动主动通知'],
                ['图表', 'ECharts', '价格趋势可视化'],
                ['构建发布', 'GitHub Actions', '多平台自动打包发布'],
              ]
            ),
          ]
        })
      ]})]
    }),
  ]
};

// ---- PAGE: 数据架构 ----
const page5 = {
  properties: { page: pageProps },
  children: [
    secTitle('🗄️', '数据设计 — 核心价格字段', '— 每条记录完整描述一款车的价格政策'),
    ...sp(1),
    new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [Math.floor(CW * 0.52), Math.floor(CW * 0.48)],
      rows: [new TableRow({ children: [
        new TableCell({
          borders: noB(),
          width: { size: Math.floor(CW * 0.52), type: WidthType.DXA },
          margins: { top: 0, bottom: 0, left: 0, right: 200 },
          children: [
            buildTable(
              [{ label: '字段名', w: 2600 }, { label: '含义', w: 2400 }, { label: '更新频率', w: 2900 }],
              [
                ['official_price', '官方指导价（万元）', '每日'],
                ['discount_price', '当前优惠价（万元）', '实时'],
                ['direct_discount', '直接优惠 = 官方价 - 优惠价', '实时'],
                ['loan_subsidy_rate', '贷款贴息年化利率', '每周'],
                ['loan_subsidy_amount', '贴息折算金额（万元）', '每周'],
                ['replacement_subsidy', '置换补贴金额（万元）', '每周'],
                ['gift_package', '赠品清单（JSON）', '每周'],
                ['effective_date', '政策生效日期', '实时'],
                ['expire_date', '政策截止日期', '实时'],
                ['region', '适用地区（全国/省市）', '实时'],
                ['updated_at', '最近更新时间戳', '实时'],
              ]
            ),
          ]
        }),
        new TableCell({
          borders: noB(),
          width: { size: Math.floor(CW * 0.48), type: WidthType.DXA },
          margins: { top: 0, bottom: 0, left: 200, right: 0 },
          children: [
            subTitle('核心 API 接口'),
            hBox('GET  /api/v1/cars/search', DBLUE, WHITE, 20),
            bodyTxt('关键词 / 预算区间 / 能源类型 / 车身类型 多维度筛选，返回价格摘要列表'),
            ...sp(1),
            hBox('GET  /api/v1/cars/{id}/price-detail', DBLUE, WHITE, 20),
            bodyTxt('返回完整价格政策，含所有优惠项目，支持按地区查询'),
            ...sp(1),
            hBox('POST  /api/v1/recommend', DBLUE, WHITE, 20),
            bodyTxt('输入预算 / 座位 / 能源 / 用途，返回 Top10 推荐车型 + 推荐理由'),
            ...sp(1),
            hBox('WSS  /ws/price-watch', DBLUE, WHITE, 20),
            bodyTxt('订阅指定车型，价格变动时服务端主动推送变价消息'),
            ...sp(1),
            hBox('💾  离线策略：SQLite 本地缓存 + 24h 过期强制刷新 + 断网走缓存', LGREEN, GREEN, 20),
          ]
        })
      ]})]
    }),
  ]
};

// ---- PAGE: 性能 & 多端 ----
const page6 = {
  properties: { page: pageProps },
  children: [
    secTitle('🚀', '性能指标 & 多端支持'),
    ...sp(1),
    new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [Math.floor(CW * 0.5), Math.floor(CW * 0.5)],
      rows: [new TableRow({ children: [
        new TableCell({
          borders: allB(BLUE),
          width: { size: Math.floor(CW * 0.5), type: WidthType.DXA },
          shading: { fill: XBLUE, type: ShadingType.CLEAR },
          margins: { top: 160, bottom: 160, left: 240, right: 240 },
          children: [
            new Paragraph({ children: [new TextRun({ text: '⚡  性能指标（目标值）', size: 30, bold: true, font: 'Arial', color: BLUE })] }),
            divider(BLUE),
            ...sp(1),
            statsRow([
              { num: '≤1.5s', unit: '', label: '冷启动时间（桌面）', fill: WHITE },
              { num: '≤200ms', unit: '', label: '搜索响应时间', fill: WHITE },
            ]),
            ...sp(1),
            statsRow([
              { num: '≤100MB', unit: '', label: '内存占用', fill: WHITE },
              { num: '≤10MB', unit: '', label: '安装包体积', fill: WHITE },
            ]),
            ...sp(1),
            hBox('数据准确率 ≥ 98%    崩溃率 ≤ 0.1%    价格延迟 ≤ 24h', LGRAY, MGRAY, 20),
          ]
        }),
        new TableCell({
          borders: allB(BLUE),
          width: { size: Math.floor(CW * 0.5), type: WidthType.DXA },
          shading: { fill: LGRAY, type: ShadingType.CLEAR },
          margins: { top: 160, bottom: 160, left: 240, right: 240 },
          children: [
            new Paragraph({ children: [new TextRun({ text: '📱  多端支持矩阵', size: 30, bold: true, font: 'Arial', color: BLUE })] }),
            divider(BLUE),
            buildTable(
              [{ label: '平台', w: 2000 }, { label: '最低版本', w: 2000 }, { label: '特有能力', w: 3619 }],
              [
                ['Windows', 'Windows 10+', '系统托盘 / 开机自启'],
                ['macOS', 'macOS 12+', 'Touch Bar / 通知中心'],
                ['Linux', 'Ubuntu 20+', 'AppImage / Deb 包'],
                ['iOS', 'iOS 14+', 'Widget / Siri 快捷'],
                ['Android', 'Android 8+', '桌面快捷 / 通知栏'],
              ]
            ),
            ...sp(1),
            hBox('🔒  安全：HTTPS/TLS 1.3 + SQLCipher 本地加密 + Tauri IPC 白名单沙箱', LORANGE, ORANGE, 20),
          ]
        })
      ]})]
    }),
  ]
};

// ---- PAGE: 开发计划 ----
const page7 = {
  properties: { page: pageProps },
  children: [
    secTitle('📅', '开发计划 — 16 周上线路线图'),
    ...sp(1),
    buildTable(
      [
        { label: '阶段', w: 1400 },
        { label: '周期', w: 1600 },
        { label: '核心交付', w: 5000 },
        { label: '验收标准', w: 4238 },
        { label: '里程碑', w: 3000 },
      ],
      [
        ['🟢 MVP', '第 1-4 周', '基础价格查询 + 贷款政策展示 + 简单推荐', '核心查询可用，数据准确率 ≥ 95%', '内部演示 Demo'],
        ['🔵 Beta', '第 5-8 周', '多车对比 + 价格趋势图 + 离线缓存 + 价格提醒', '全平台可安装，UI 通过视觉评审', '邀请内测 100 人'],
        ['🟡 RC', '第 9-12 周', 'AI 智能推荐 + WebSocket 实时推送 + 性能优化', '性能指标全部达标，P0 Bug 清零', '公开测试发布'],
        ['🚀 正式版', '第 13-16 周', '上架各平台应用市场 + 运维监控 + 数据看板', '完成压力测试，上线监控体系', '正式对外发布'],
      ]
    ),
    ...sp(1),
    new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [Math.floor(CW / 2) - 100, Math.floor(CW / 2) + 100],
      rows: [new TableRow({ children: [
        new TableCell({
          borders: allB(BLUE),
          width: { size: Math.floor(CW / 2) - 100, type: WidthType.DXA },
          shading: { fill: XBLUE, type: ShadingType.CLEAR },
          margins: { top: 140, bottom: 140, left: 220, right: 220 },
          children: [
            new Paragraph({ children: [new TextRun({ text: '👥  推荐团队配置', size: 26, bold: true, font: 'Arial', color: BLUE })] }),
            divider(BLUE),
            ...['产品经理  ×1 — 需求/原型/验收', '前端工程师  ×2 — React + Tauri UI', 'Rust 工程师  ×1 — 后端逻辑/数据库', '数据工程师  ×1 — API/爬虫/推荐算法', 'UI 设计师  ×1 — 视觉/交互', '测试工程师  ×1 — 多平台兼容测试'].map(t => new Paragraph({ spacing: { before: 50 }, children: [new TextRun({ text: '  ' + t, size: 20, font: 'Arial', color: MGRAY })] })),
          ]
        }),
        new TableCell({
          borders: allB(ORANGE),
          width: { size: Math.floor(CW / 2) + 100, type: WidthType.DXA },
          shading: { fill: LORANGE, type: ShadingType.CLEAR },
          margins: { top: 140, bottom: 140, left: 220, right: 220 },
          children: [
            new Paragraph({ children: [new TextRun({ text: '⚠️  主要风险与应对', size: 26, bold: true, font: 'Arial', color: ORANGE })] }),
            divider(ORANGE),
            ...['数据合规 → 优先接入官方厂商 API / 授权数据源', 'Tauri Mobile 成熟度 → Beta 阶段加强回归测试', '数据时效 → 多数据源冗余 + 自动切换备用源', '冷启动 → 初期推出「最佳优惠榜」「即将涨价」等热榜内容驱动活跃'].map(t => new Paragraph({ spacing: { before: 50 }, children: [new TextRun({ text: '  ⚡  ' + t, size: 20, font: 'Arial', color: MGRAY })] })),
          ]
        })
      ]})]
    }),
  ]
};

// ── Build ──────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: 'bul',
      levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 480, hanging: 240 } } } }]
    }]
  },
  styles: {
    default: { document: { run: { font: 'Arial', size: 22, color: DARK } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 52, bold: true, font: 'Arial', color: BLUE },
        paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: BLUE },
        paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: ORANGE },
        paragraph: { spacing: { before: 160, after: 60 }, outlineLevel: 2 } },
    ]
  },
  sections: [
    coverSection,
    page1, page2, pageProfile, pageScore, page3, page4, page5, page6, page7,
    // ---- FINAL PAGE ----
    {
      properties: { page: pageProps },
      children: [
        ...sp(4),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          shading: { fill: DBLUE, type: ShadingType.CLEAR },
          spacing: { before: 200, after: 200 },
          children: [new TextRun({ text: '  🚗  感谢观看 · 车价通 CarPriceHub  ', size: 80, bold: true, font: 'Arial', color: WHITE })]
        }),
        ...sp(1),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: '用 Tauri 构建 · 让购车更透明 · 让决策更简单', size: 36, font: 'Arial', color: BLUE })]
        }),
        divider(BLUE),
        ...sp(2),
        statsRow([
          { num: '500+', unit: '款', label: '车型覆盖', fill: XBLUE },
          { num: '5',   unit: '端', label: '全平台支持', fill: LORANGE },
          { num: '24h', unit: '',   label: '实时价格', fill: LGREEN },
          { num: '98%', unit: '',   label: '数据准确率', fill: LGRAY },
        ]),
        ...sp(3),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Q & A  欢迎提问 💬', size: 48, bold: true, font: 'Arial', color: ORANGE })]
        }),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(
    'c:/Users/Administrator/WorkBuddy/20260319091322/车价通_直播展示版_V1.0.docx',
    buf
  );
  console.log('DONE');
});
