# ⌚ MiBand Proto Forge

**小米手环样机生成器**

### 🎯 项目简介

MiBand Proto Forge 是一个专为小米手环和智能手表设计的专业样机生成工具。它提供了直观的界面，让用户能够轻松地将手环截图嵌入到精美的3D样机模板中，生成高质量的产品展示图片。

### 🛠️ 技术栈

- **前端框架** - Vue 3 + TypeScript
- **UI组件库** - shadcn/ui + Tailwind CSS
- **图片处理** - html-to-image
- **构建工具** - Vite
- **包管理器** - pnpm

### 🚀 快速开始

#### 环境要求
- Node.js 18+
- pnpm (推荐) 或 npm/yarn

#### 安装依赖
```bash
# 克隆项目
git clone https://github.com/your-username/miband-proto-forge.git
cd miband-proto-forge

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

#### 构建项目
```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### 📖 使用指南

#### 1. 选择设备型号
在左侧配置面板中，从下拉菜单选择要制作样机的设备型号。

#### 2. 选择模板（如适用）
如果所选设备有多个模板，可以从模板选择器中选择合适的样机模板。

#### 3. 上传截图
点击"手环截图"区域，选择或拖拽您的手环截图图片。支持JPG、PNG、WEBP格式。

#### 4. 预览效果
右侧预览区域会实时显示样机效果，您可以：
- 查看3D旋转效果
- 确认截图位置和大小
- 检查整体视觉效果

#### 5. 导出图片
点击"导出样机图片"按钮，系统会生成高清PNG图片并自动下载。

### 🎯 项目结构

```
miband-proto-forge/
├── src/
│   ├── App.vue                 # 主应用组件
│   ├── assets/
│   │   └── vue.svg
│   ├── components/
│   │   └── ui/               # UI组件（shadcn/ui）
│   ├── lib/
│   │   └── utils.ts          # 工具函数
│   ├── main.ts               # 应用入口
│   ├── style.css             # 全局样式
│   └── vite-env.d.ts         # 类型声明
├── public/
│   │   ├── proto/             # 样机模板图片目录
│   │   │   ├── 10.png         # 小米手环10
│   └── vite.svg              # 网站图标
├── package.json              # 项目配置
├── tsconfig.json            # TypeScript配置
├── vite.config.ts           # Vite配置
└── README.md                # 项目说明（本文件）
```

### 🎨 模板配置说明

#### 模板数据结构
```typescript
interface ProtoTemplate {
  id: string;           // 模板唯一ID
  name: string;         // 模板名称
  imagePath: string;    // 模板图片路径
  width: number;        // 模板宽度
  height: number;       // 模板高度
  watchFaceType: "圆形" | "方形" | "跑道形";  // 表盘类型
  top: string;          // 截图顶部偏移
  left: string;         // 截图左侧偏移
  rotation: {           // 3D变换参数
    rotateX: number;    // X轴旋转角度
    rotateY: number;    // Y轴旋转角度
    rotateZ: number;    // Z轴旋转角度
    scale: number;      // 缩放比例
  };
}
```

#### 添加新模板示例
```typescript
// 在deviceModels中添加新设备或模板
"xiaomi-band-new": {
  deviceName: "小米手环新款",
  templates: [
    {
      id: "new-standard",
      name: "标准版",
      imagePath: "/src/assets/proto/new.png",
      width: 200,
      height: 500,
      watchFaceType: "跑道形",
      top: "-50px",
      left: "0px",
      rotation: { rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 }
    }
  ]
}
```

### 🔧 开发指南

#### 代码注释
所有核心代码已添加详细中文注释，包括：
- 接口定义说明
- 函数功能描述
- 变量用途解释
- 关键逻辑说明

#### 样式定制
项目使用Tailwind CSS，可通过修改`tailwind.config.js`来自定义样式。

#### 组件扩展
基于shadcn/ui组件库，可轻松添加新的UI组件。

### 🤝 贡献指南

欢迎贡献新的设备模板！添加新模板的步骤：

1. **准备素材**
   - 准备高质量的设备样机图片（建议PNG格式，透明背景）
   - 测量截图在模板中的精确位置和大小

2. **添加配置**
   - 在`deviceModels`中添加新的设备型号
   - 在对应设备的`templates`数组中添加新模板配置

3. **测试验证**
   - 测试模板显示效果
   - 验证导出图片质量

4. **提交PR**
   - 确保代码通过TypeScript检查
   - 添加必要的注释和文档

### 📄 许可证

MIT License

### 🙏 致谢

- 米坛开发者中心