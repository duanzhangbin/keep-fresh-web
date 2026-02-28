# 项目名称：FreshKeep (保质期管家) - Web 版技术规范文档

## 1. 项目概况

*   **目标平台**：Web 应用 + PWA (Progressive Web App)
*   **核心功能**：通过拍照/手动录入物品日期，利用 Qwen-VL 识别包装信息，并实现过期提醒（提前1月/1周）。
*   **用户体验核心**：降低录入阻力，增强感知效率，融入真实生活场景。
*   **设计风格**：Modern Organic (现代有机) + Boutique Utility (精致实用主义)

---

## 1.1 UI 设计规范

### 1.1.1 核心视觉配方
应用主要参考了 "暖色有机 / 文化感 (Warm Organic / Cultural)" 风格，并结合了 "极简工具 (Minimal Utility)" 的布局逻辑。

### 1.1.2 色彩美学

| 用途 | 颜色 | Hex |
|------|------|-----|
| **背景** | 米白色/奶油色 | `#f5f5f0` |
| **品牌色** | 橄榄绿/苔藓绿 | `#5A5A40` |
| **品牌浅色** | 淡橄榄 | `#8A8A70` |
| **状态-正常** | 柔和绿 | `rgba(76, 175, 80, 0.15)` |
| **状态-即将过期** | 柔和橙 | `rgba(255, 152, 0, 0.15)` |
| **状态-已过期** | 柔和红 | `rgba(244, 67, 54, 0.15)` |
| **状态-已开封** | 柔和蓝 | `rgba(33, 150, 243, 0.15)` |
| **文字主色** | 深橄榄 | `#3A3A30` |
| **文字次色** | 灰色 | `#7A7A70` |
| **卡片背景** | 纯白/透白 | `#FFFFFF` / `rgba(255,255,255,0.8)` |

### 1.1.3 字体设计

| 用途 | 字体 | 样式 |
|------|------|------|
| **标题** | Cormorant Garamond | 衬线体，斜体显示 |
| **正文** | Inter | 无衬线体，确保阅读清晰度 |

```css
/* 字号规范 */
--text-xl: 28px;    /* 页面大标题 */
--text-lg: 20px;    /* 卡片标题 */
--text-md: 16px;    /* 正文 */
--text-sm: 14px;    /* 辅助文字 */
--text-xs: 12px;    /* 标签/角标 */
```

### 1.1.4 形状与质感

```css
/* 圆角 - 超大弧度 */
--radius-md: 16px;   /* rounded-2xl */
--radius-lg: 24px;   /* rounded-3xl */
--radius-xl: 40px;   /* rounded-[2.5rem] */

/* 阴影 - 轻量悬浮感 */
--shadow-card: 0 4px 20px rgba(90, 90, 64, 0.08);
--shadow-float: 0 8px 32px rgba(90, 90, 64, 0.12);
--shadow-button: 0 2px 8px rgba(90, 90, 64, 0.15);

/* 毛玻璃 */
--glass-bg: rgba(255, 255, 255, 0.7);
--glass-blur: blur(12px);
```

### 1.1.5 移动端单手操作设计

#### 单手操作黄金区域
```
┌─────────────────────────┐
│         状态栏           │ ← 不可操作区
├─────────────────────────┤
│                         │
│       内容区域           │ ← 浏览区
│                         │
├─────────────────────────┤
│    👆 拇指易触达区       │ ← 核心操作区（屏幕底部 1/3）
│  [悬浮按钮] [底部导航]   │
└─────────────────────────┘
```

#### 设计原则
- **操作下移**: 核心按钮放在屏幕下半部分
- **大触摸区域**: 最小 44x44px，重要按钮 56x56px
- **简化层级**: 减少嵌套，点击直达
- **手势优先**: 下拉刷新、上滑加载、滑动操作

### 1.1.6 页面设计预览

#### 首页 Dashboard
```
┌─────────────────────────────────────┐
│  FreshKeep                    👤   │ 背景: #f5f5f0
├─────────────────────────────────────┤
│  🥛 鲜牛奶                    3天 ⚠️│  卡片: 圆角24px
│  冰箱 │ 已开封                    │  橄榄绿标签
├─────────────────────────────────────┤
│  🍪 奥利奥                    13天  │
│  储物柜 │ 正常                    │
├─────────────────────────────────────┤
│           ┌──────────┐              │
│           │    📷    │              │  拍照按钮: 64px
│           └──────────┘              │  橄榄绿背景
└─────────────────────────────────────┘
   [首页]      [识别]      [设置]
```

#### 登录页
```
┌─────────────────────────────────────┐
│                                     │
│         🌿 FreshKeep                │  Cormorant Garamond 斜体
│                                     │
│     精致生活，从了解开始              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📱 手机号                    │   │  圆角 16px
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 🔒 密码                      │   │
│  └─────────────────────────────┘   │
│                                     │
│       [ 登录 ]                      │  橄榄绿按钮
│                                     │
│   还没有账号？ [注册]                │
└─────────────────────────────────────┘
```

### 1.1.7 交互与动效

```css
/* 过渡时间 */
--transition-fast: 150ms;   /* 点击反馈 */
--transition-normal: 250ms; /* 页面切换 */
--transition-slow: 400ms;   /* 大动画 */

/* 缓动函数 */
--ease-out: cubic-bezier(0.25, 0.8, 0.25, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 2. 环境变量配置

```env
# 数据库 (PostgreSQL)
DATABASE_URL="postgresql://dzb:dzb%40123@115.190.248.195:5432/keep_fresh"

# JWT 认证
JWT_SECRET=8e9f7d6c5b4a32109876543210abcdef8e9f7d6c5b4a32109876543210abcdef

# Qwen AI (阿里云百炼)
QWEN_API_KEY=sk-c8e7fcd1a2a946b8b760dcc3c05ed4e3
QWEN_MODEL=qwen3.5-plus

# 邮件服务 (可选)
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

---

## 3. 技术栈

### 2.1 前端
| 组件 | 技术 | 版本 |
|--------|------|------|
| 框架 | React | 18+ |
| 语言 | TypeScript | 5+ |
| UI 组件库 | Ant Design / Material-UI | 5+ |
| 状态管理 | Zustand / Redux Toolkit | - |
| 路由 | React Router | 6+ |
| HTTP 客户端 | Axios | 1+ |
| PWA | Workbox / Vite PWA Plugin | - |
| 相机 | react-camera-pro / Web Camera API | - |

### 2.2 后端
| 组件 | 技术 | 版本 |
|--------|------|------|
| 运行时 | Node.js | 18+ |
| 框架 | Fastify / Express | - |
| 语言 | TypeScript | 5+ |
| ORM | Prisma | 5+ |
| 数据库 | PostgreSQL | 15+ |
| 认证 | JWT / NextAuth.js | - |
| 文件存储 | 本地存储 / OSS (可选) | - |
| 定时任务 | node-cron | - |
| 通知服务 | Web Push / Email / 短信 | - |

### 2.3 AI 服务
| 组件 | 技术 |
|--------|------|
| 模型 | 阿里云百炼 - Qwen-VL-Plus/Max |
| API | DashScope API |

---

## 3. 数据模型设计 (Prisma Schema)

> **注意**: 以下 Schema 与 keep_fresh 数据库现有表结构完全匹配

### 3.1 数据库表结构

```prisma
// prisma/schema.prisma

model User {
  id        String    @id @default(cuid())
  email     String?   @unique
  phone     String?   @unique
  password  String
  name      String?
  createdAt DateTime  @default(now()) @map("createdat")
  
  items      Item[]
  categories Category[]
  locations  Location[]
  settings   Settings?

  @@map("users")
}

model Item {
  id                 String    @id @default(cuid())
  userId             String    @map("userid")
  name               String
  prodDate           String?   @map("proddate")
  expDate            String?   @map("expdate")
  category           String    @default("其它")
  location           String    @default("储物柜")
  status             Int       @default(0) // 0:正常, 1:已开封, 2:已消耗, 3:已丢弃
  imagePath          String?   @map("imagepath")
  openDate           String?   @map("opendate")
  shelfLifeAfterOpen Int?      @map("shelflifeafteropen")
  createdAt          DateTime  @default(now()) @map("createdat")
  
  user               User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("items")
}

model Category {
  id        String   @id @default(cuid())
  userId    String?  @map("userid")
  name      String
  icon      String?
  color     String?
  
  user      User?    @relation(fields: [userId], references: [id])
  
  @@unique([userId, name])
  @@map("categories")
}

model Location {
  id        String   @id @default(cuid())
  userId    String?  @map("userid")
  name      String
  icon      String?
  color     String?
  
  user      User?    @relation(fields: [userId], references: [id])
  
  @@unique([userId, name])
  @@map("locations")
}

model Settings {
  userId             String @id @map("userid")
  reminderThreshold  Int    @default(7) @map("reminderthreshold")
  
  user               User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("settings")
}
```

### 3.2 字段说明

| 字段名 | 类型 | 描述 | 对应表字段 |
| :--- | :--- | :--- | :--- |
| id | String | 主键，CUID | id |
| userId | String | 用户外键 | userid |
| name | String | 物品名称 | name |
| prodDate | String | 生产日期 (YYYY-MM-DD) | proddate |
| expDate | String | 过期日期 (YYYY-MM-DD) | expdate |
| category | String | 物品分类 (食品/药品/美妆/其它) | category |
| location | String | 存放位置 (冰箱/冷冻/储物柜/医药箱) | location |
| status | Int | 0:正常, 1:已开封, 2:已消耗, 3:已丢弃 | status |
| imagePath | String | 图片路径 | imagepath |
| openDate | String | 开封日期 | opendate |
| shelfLifeAfterOpen | Int | 开封后保质期(天) | shelflifeafteropen |
| createdAt | DateTime | 创建时间 | createdat |

### 3.3 用户认证字段说明

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| id | String | 主键，CUID |
| email | String? | 邮箱 (唯一) |
| phone | String? | 手机号 (唯一) |
| password | String | 密码 (加密存储) |
| name | String? | 用户昵称 |
| createdAt | DateTime | 创建时间 |

### 3.4 设置表字段说明

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| userId | String | 用户外键 (主键) |
| reminderThreshold | Int | 提醒阈值 (默认7天) |

---

## 4. 核心功能模块设计

### 4.1 拍照与图像预处理 (Camera Module)

#### 4.1.1 Web 端
使用 `react-camera-pro` 或 Web Camera API：

```typescript
// 核心逻辑
1. 调用 navigator.mediaDevices.getUserMedia() 开启相机
2. 设置对焦模式（如果设备支持）
3. **辅助对齐线**：在预览流覆盖半透明边框，引导用户将日期对准中央
4. **批量连拍**：支持连续拍摄多张，放入后台队列上传
5. 拍摄后使用 Canvas 压缩（建议压缩至 1024x1024 以下）
6. 转化为 **Base64** 或 **Blob** 准备发送
```

#### 4.1.2 移动端优化
- 使用 `<input type="file" accept="image/*" capture="environment">` 调用原生相机
- 支持 PWA 安装后使用原生相机 API

### 4.2 Qwen-VL 接口集成 (AI Integration)

#### 4.2.1 后端封装
```typescript
// src/services/ai/qwen.service.ts

interface QwenRequest {
  model: string;
  input: {
    messages: Array<{
      role: string;
      content: Array<{
        image: string;
        text: string;
      }>;
    }>;
  };
}

interface QwenResponse {
  output: {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  };
}

export async function recognizeImage(imageBase64: string): Promise<ItemRecognition> {
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen-vl-max',
      input: {
        messages: [{
          role: 'user',
          content: [
            {
              image: imageBase64,
            },
            {
              text: `你是一个生产日期识别助手。请识别图中包装上的生产日期和保质时长。
              1. 如果有过期日期，请直接提取。
              2. 如果只有生产日期和保质期（如18个月），请计算出过期日期。
              3. 尝试识别物品分类（食品/药品/美妆/其他）和开封后保质期（如包装上有'12M'图标）。
              4. 请只输出 JSON 格式：
              {
                "name": "物品名称",
                "prod_date": "YYYY-MM-DD",
                "exp_date": "YYYY-MM-DD",
                "category": "分类建议",
                "shelf_life_after_open": "数字(天)"
              }`
            }
          ]
        }]
      }
    }),
  });
  
  const data = await response.json();
  return JSON.parse(data.output.choices[0].message.content);
}
```

### 4.3 过期提醒系统 (Reminder System)

#### 4.3.1 定时任务
使用 `node-cron` 实现定时检查：

```typescript
// src/jobs/reminder.job.ts
import cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { sendWebPush, sendEmail, sendSMS } from '@/services/notification';

export function startReminderJob() {
  // 每天早上 9:00 执行
  cron.schedule('0 9 * * *', async () => {
    const today = new Date();
    const oneMonthLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    // 查询即将过期的物品
    const expiringItems = await prisma.item.findMany({
      where: {
        deleted: false,
        status: { in: [0, 1] }, // 正常或已开封
        expDate: {
          lte: oneMonthLater,
        },
      },
      include: {
        user: true,
      },
    });
    
    // 发送提醒
    for (const item of expiringItems) {
      const finalExpDate = calculateFinalExpDate(item);
      const daysUntilExp = Math.ceil((finalExpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExp <= 30) {
        await sendNotification(item.user, item, daysUntilExp);
      }
    }
  });
}

function calculateFinalExpDate(item: any): Date {
  let finalExpDate = new Date(item.expDate);
  
  // 开封模式：优先使用开封后计算的日期
  if (item.status === 1 && item.openDate && item.shelfLifeAfterOpen) {
    const openExp = new Date(item.openDate);
    openExp.setDate(openExp.getDate() + item.shelfLifeAfterOpen);
    
    if (openExp < finalExpDate) {
      finalExpDate = openExp;
    }
  }
  
  return finalExpDate;
}
```

#### 4.3.2 通知服务

**Web Push Notifications** (PWA):
```typescript
// src/services/notification/web-push.service.ts
import webpush from 'web-push';

export async function sendWebPush(user: User, item: Item, daysUntilExp: number) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: user.id },
  });
  
  const message = {
    title: '物品即将过期',
    body: `${item.name} 还有 ${daysUntilExp} 天过期`,
    icon: '/icons/icon-192.png',
    data: {
      url: `/items/${item.id}`,
    },
  };
  
  for (const sub of subscriptions) {
    await webpush.sendNotification(subscription, JSON.stringify(message));
  }
}
```

**Email / 短信** (可选):
```typescript
// src/services/notification/email.service.ts
import nodemailer from 'nodemailer';

export async function sendEmail(user: User, item: Item, daysUntilExp: number) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: '物品即将过期提醒',
    html: `
      <h2>${item.name} 即将过期</h2>
      <p>还有 <strong>${daysUntilExp}</strong> 天过期</p>
      <p>存放位置：${item.location}</p>
      <p>分类：${item.category}</p>
    `,
  });
}
```

---

## 5. 前端页面设计 (React)

### 5.1 Dashboard (主页)

```typescript
// src/pages/Dashboard.tsx
import { useItems } from '@/hooks/useItems';
import { ItemList } from '@/components/ItemList';
import { FilterBar } from '@/components/FilterBar';
import { FloatingButton } from '@/components/FloatingButton';

export function Dashboard() {
  const { items, loading, filter, setFilter } = useItems();
  
  return (
    <div className="dashboard">
      {/* 顶部：过期倒计时进度条 */}
      <ExpirationProgress items={items} />
      
      {/* 筛选栏 */}
      <FilterBar 
        categories={['食品', '药品', '美妆', '其它']}
        locations={['冰箱', '冷冻', '储物柜', '医药箱']}
        value={filter}
        onChange={setFilter}
      />
      
      {/* 物品列表 */}
      <ItemList 
        items={items}
        onStatusChange={handleStatusChange}
        onOpen={handleOpen}
      />
      
      {/* 底部：悬浮拍照按钮 */}
      <FloatingButton onClick={handleCamera} />
    </div>
  );
}
```

### 5.2 Recognition Page (识别确认页)

```typescript
// src/pages/Recognition.tsx
import { useState } from 'react';
import { Camera } from '@/components/Camera';
import { ItemForm } from '@/components/ItemForm';

export function Recognition() {
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [recognizedItems, setRecognizedItems] = useState<ItemRecognition[]>([]);
  
  const handleCapture = async (imageBase64: string) => {
    // 调用 AI 识别
    const result = await recognizeImage(imageBase64);
    setRecognizedItems([...recognizedItems, result]);
    setCapturedImages([...capturedImages, imageBase64]);
  };
  
  return (
    <div className="recognition">
      {/* 批量模式：水平滚动列表 */}
      {capturedImages.length > 0 && (
        <div className="captured-list">
          {capturedImages.map((img, idx) => (
            <ItemForm
              key={idx}
              image={img}
              data={recognizedItems[idx]}
              onSave={handleSave}
            />
          ))}
        </div>
      )}
      
      {/* 相机组件 */}
      <Camera onCapture={handleCapture} />
    </div>
  );
}
```

### 5.3 Settings (设置)

```typescript
// src/pages/Settings.tsx
import { useAuth } from '@/hooks/useAuth';

export function Settings() {
  const { user } = useAuth();
  
  return (
    <div className="settings">
      <section>
        <h3>提醒配置</h3>
        <TimePicker label="默认提醒时间" defaultValue="09:00" />
        <Checkbox label="启用 Web Push 通知" />
        <Checkbox label="启用邮件通知" />
      </section>
      
      <section>
        <h3>API 配置</h3>
        <Input 
          label="Qwen API Key" 
          type="password" 
          value={user?.qwenApiKey}
          onChange={handleApiKeyChange}
        />
      </section>
      
      <section>
        <h3>标签管理</h3>
        <CategoryManager />
        <LocationManager />
      </section>
    </div>
  );
}
```

---

## 6. API 路由设计

### 6.1 RESTful API

```typescript
// src/routes/items.ts
import { FastifyInstance } from 'fastify';

export async function itemRoutes(fastify: FastifyInstance) {
  // 获取物品列表
  fastify.get('/items', async (request, reply) => {
    const { userId } = request.user;
    const { category, location, status } = request.query as any;
    
    const items = await prisma.item.findMany({
      where: {
        userId,
        ...(category && { category }),
        ...(location && { location }),
        ...(status && { status: parseInt(status) }),
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return items;
  });
  
  // 创建物品
  fastify.post('/items', async (request, reply) => {
    const { userId } = request.user;
    const data = request.body;
    
    const item = await prisma.item.create({
      data: {
        ...data,
        userId,
      },
    });
    
    return item;
  });
  
  // 更新物品
  fastify.put('/items/:id', async (request, reply) => {
    const { id } = request.params;
    const data = request.body;
    
    const item = await prisma.item.update({
      where: { id },
      data,
    });
    
    return item;
  });
  
  // 删除物品
  fastify.delete('/items/:id', async (request, reply) => {
    const { id } = request.params;
    
    await prisma.item.delete({
      where: { id },
    });
    
    return { success: true };
  });
  
  // 标记已开封
  fastify.post('/items/:id/open', async (request, reply) => {
    const { id } = request.params;
    const { openDate, shelfLifeAfterOpen } = request.body;
    
    const item = await prisma.item.update({
      where: { id },
      data: {
        status: 1,
        openDate,
        shelfLifeAfterOpen,
      },
    });
    
    return item;
  });
  
  // 标记状态 (已消耗/已丢弃)
  fastify.post('/items/:id/status', async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;
    
    const item = await prisma.item.update({
      where: { id },
      data: { status },
    });
    
    return item;
  });
}
```

### 6.2 认证路由

```typescript
// src/routes/auth.ts
import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function authRoutes(fastify: FastifyInstance) {
  // 注册 (手机号 + 密码)
  fastify.post('/auth/register', async (request, reply) => {
    const { phone, password, name, email } = request.body;
    
    // 检查手机号是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          ...(email ? [{ email }] : []),
        ],
      },
    });
    
    if (existingUser) {
      return reply.status(400).send({ error: '手机号或邮箱已被注册' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        phone, 
        password: hashedPassword, 
        name,
        email,
      },
    });
    
    // 创建设置
    await prisma.settings.create({
      data: { userId: user.id },
    });
    
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return { token, user: { id: user.id, phone: user.phone, name: user.name, email: user.email } };
  });
  
  // 登录 (手机号/邮箱 + 密码)
  fastify.post('/auth/login', async (request, reply) => {
    const { phone, email, password } = request.body;
    
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          ...(email ? [{ email }] : []),
        ],
      },
    });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.status(401).send({ error: '手机号/邮箱或密码错误' });
    }
    
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return { token, user: { id: user.id, phone: user.phone, name: user.name, email: user.email } };
  });
  
  // 获取当前用户信息
  fastify.get('/auth/me', async (request, reply) => {
    const { userId } = request.user;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
      },
    });
    
    if (!user) {
      return reply.status(404).send({ error: '用户不存在' });
    }
    
    return { 
      id: user.id, 
      phone: user.phone, 
      name: user.name, 
      email: user.email,
      settings: user.settings,
    };
  });
  
  // 更新用户信息
  fastify.put('/auth/me', async (request, reply) => {
    const { userId } = request.user;
    const { name, email } = request.body;
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });
    
    return { id: user.id, phone: user.phone, name: user.name, email: user.email };
  });
  
  // 修改密码
  fastify.put('/auth/password', async (request, reply) => {
    const { userId } = request.user;
    const { oldPassword, newPassword } = request.body;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!(await bcrypt.compare(oldPassword, user!.password))) {
      return reply.status(400).send({ error: '原密码错误' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    
    return { success: true };
  });
}
```

### 6.3 设置路由

```typescript
// src/routes/settings.ts
import { FastifyInstance } from 'fastify';

export async function settingsRoutes(fastify: FastifyInstance) {
  // 获取用户设置
  fastify.get('/settings', async (request, reply) => {
    const { userId } = request.user;
    
    let settings = await prisma.settings.findUnique({
      where: { userId },
    });
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: { userId },
      });
    }
    
    return settings;
  });
  
  // 更新用户设置
  fastify.put('/settings', async (request, reply) => {
    const { userId } = request.user;
    const data = request.body;
    
    const settings = await prisma.settings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
    
    return settings;
  });
}
```

### 6.4 分类/位置路由

```typescript
// src/routes/categories.ts & locations.ts
export async function categoryRoutes(fastify: FastifyInstance) {
  // 获取分类列表
  fastify.get('/categories', async (request, reply) => {
    const { userId } = request.user;
    
    return prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  });
  
  // 创建分类
  fastify.post('/categories', async (request, reply) => {
    const { userId } = request.user;
    const { name, icon, color } = request.body;
    
    return prisma.category.create({
      data: { userId, name, icon, color },
    });
  });
  
  // 删除分类
  fastify.delete('/categories/:id', async (request, reply) => {
    const { id } = request.params;
    
    await prisma.category.delete({ where: { id } });
    
    return { success: true };
  });
}
```

### 6.5 AI 识别路由

```typescript
// src/routes/recognize.ts
import { FastifyInstance } from 'fastify';
import { recognizeImage } from '@/services/ai/qwen.service';

export async function recognizeRoutes(fastify: FastifyInstance) {
  // 识别图片
  fastify.post('/recognize', async (request, reply) => {
    const { image } = request.body as { image: string };
    
    try {
      const result = await recognizeImage(image);
      return result;
    } catch (error) {
      return reply.status(500).send({ error: '识别失败，请重试' });
    }
  });
}
```

---

## 7. PWA 配置

### 7.1 Manifest

```json
// public/manifest.json
{
  "name": "FreshKeep - 保质期管家",
  "short_name": "FreshKeep",
  "description": "智能管理物品保质期，减少浪费",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4CAF50",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["productivity", "lifestyle"],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ]
}
```

### 7.2 Service Worker

```typescript
// public/sw.ts
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute, NetworkFirst } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// 预缓存核心资源
precacheAndRoute([
  { url: '/', revision: '1' },
  { url: '/dashboard', revision: '1' },
  { url: '/settings', revision: '1' },
]);

// API 路由：网络优先
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 }),
    ],
  })
);

// 图片缓存
registerRoute(
  ({ request }) => request.destination === 'image',
  new NetworkFirst({
    cacheName: 'image-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// Web Push 通知处理
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon,
    data: { url: data.url },
    actions: [
      { action: 'open', title: '查看详情' },
      { action: 'mark-consumed', title: '标记已消耗' },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 通知点击处理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'mark-consumed') {
    // 调用 API 标记已消耗
    fetch(`/api/items/${event.notification.data.itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 2 }),
    });
  }
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
```

---

## 8. 部署方案

### 8.1 开发环境

```bash
# 后端
cd backend
npm install
npm run dev

# 前端
cd frontend
npm install
npm run dev
```

### 8.2 环境变量 (.env)

```env
# 数据库 (PostgreSQL) - keep_fresh
DATABASE_URL="postgresql://dzb:dzb%40123@115.190.248.195:5432/keep_fresh"

# JWT 认证密钥
JWT_SECRET=8e9f7d6c5b4a32109876543210abcdef8e9f7d6c5b4a32109876543210abcdef

# Qwen AI (阿里云百炼)
QWEN_API_KEY=sk-c8e7fcd1a2a946b8b760dcc3c05ed4e3
QWEN_MODEL=qwen3.5-plus

# 服务端口
PORT=3001
```

### 8.3 生产环境

**Docker Compose**:
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: keep_fresh
      POSTGRES_USER: dzb
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://dzb:${DB_PASSWORD}@postgres:5432/keep_fresh
      QWEN_API_KEY: ${QWEN_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
    ports:
      - "3001:3001"

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**云服务部署**:
- **Vercel / Netlify**: 前端静态部署
- **Railway / Render**: 后端 + PostgreSQL
- **阿里云**: 服务器 + RDS PostgreSQL

---

## 9. 进阶功能规划 (Roadmap)

### 9.1 智能食谱闭环
- 功能：根据即将过期食材生成消耗型食谱
- 技术：Qwen-VL 多模态 + 食谱数据库

### 9.2 极速录入：小票与订单导入
- 功能：支持拍摄超市小票 / 电商订单截图
- 技术：OCR + 商品匹配

### 9.3 情感化账单
- 功能：统计省钱金额和碳足迹
- 技术：数据分析 + 可视化图表

### 9.4 语音交互
- 功能：Web Speech API 语音查询
- 技术：浏览器原生语音识别

### 9.5 极致便捷
- 功能：极速模式（跳过确认页）、桌面快捷方式
- 技术：PWA 安装提示、快捷方式 API

### 9.6 家庭云共享
- 功能：多设备实时同步
- 技术：WebSocket + 实时数据库

---

## 10. 项目结构

```
freshkeep-web/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── items.ts        # 物品 CRUD
│   │   │   ├── auth.ts         # 认证 (手机号/邮箱登录)
│   │   │   ├── settings.ts     # 用户设置
│   │   │   ├── categories.ts   # 分类管理
│   │   │   ├── locations.ts    # 位置管理
│   │   │   └── recognize.ts    # AI 识别
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   └── qwen.service.ts    # Qwen-VL 识别服务
│   │   │   └── notification/
│   │   │       ├── web-push.service.ts
│   │   │       └── email.service.ts
│   │   ├── middleware/
│   │   │   └── auth.ts         # JWT 认证中间件
│   │   ├── lib/
│   │   │   └── prisma.ts       # Prisma 客户端
│   │   └── index.ts            # 应用入口
│   ├── prisma/
│   │   └── schema.prisma       # 数据库模型
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx       # 登录/注册页
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx   # 首页
│   │   │   ├── Recognition.tsx # 拍照识别页
│   │   │   ├── ItemDetail.tsx  # 物品详情
│   │   │   └── Settings.tsx    # 设置页
│   │   ├── components/
│   │   │   ├── ItemList.tsx    # 物品列表
│   │   │   ├── ItemCard.tsx    # 物品卡片
│   │   │   ├── Camera.tsx      # 相机组件
│   │   │   ├── ItemForm.tsx    # 物品表单
│   │   │   ├── FilterBar.tsx   # 筛选栏
│   │   │   ├── FloatingButton.tsx # 悬浮按钮
│   │   │   └── BottomNav.tsx   # 底部导航
│   │   ├── hooks/
│   │   │   ├── useItems.ts     # 物品数据管理
│   │   │   ├── useAuth.ts      # 认证状态管理
│   │   │   └── useSettings.ts  # 设置管理
│   │   ├── stores/
│   │   │   └── authStore.ts    # Zustand 状态存储
│   │   ├── styles/
│   │   │   └── theme.ts        # 设计系统主题
│   │   ├── utils/
│   │   │   ├── api.ts          # API 请求封装
│   │   │   └── date.ts         # 日期处理工具
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   ├── manifest.json       # PWA 配置
│   │   └── sw.ts               # Service Worker
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   └── goods_spec_web.md       # 本文档
├── .env                        # 环境变量
└── README.md
```

---

## 11. 交付检查清单 (Checklist)

- [x] 数据库 Schema 设计完成 (与现有表匹配)
- [ ] 后端 API 基础框架搭建
- [ ] Qwen-VL 接口集成
- [ ] 前端 React 项目初始化
- [ ] 相机组件开发
- [ ] 物品列表与筛选功能
- [ ] 过期提醒定时任务
- [ ] Web Push 通知集成
- [ ] PWA 配置完成
- [ ] Docker 部署配置
- [ ] 单元测试覆盖
- [ ] E2E 测试
