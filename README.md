# ⌚ MiBand Proto Forge

**小米手环样机生成器**

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
选择您的手环截图图片。支持JPG、PNG、WEBP格式。

#### 4. 预览效果
右侧预览区域会实时显示样机效果。

#### 5. 导出图片
点击"导出样机图片"按钮，系统会生成高清PNG图片并自动下载。

### 🎯 支持设备

| 设备型号 | 类型 |
|----------|------|
| 小米手环10 | 手环 |
| 小米手环9Pro | 手环 |
| 小米手环9 | 手环 |
| Xiaomi Watch S3 | 手表 |
| Xiaomi Watch S4 | 手表 |
| 红米手表5 | 手表 |

### 🎨 模板配置系统

#### 增强的模板数据结构
```typescript
interface ProtoTemplate {
  id: string;           // 模板唯一ID
  name: string;         // 模板名称
  imagePath: string;    // 模板图片路径
  width: number;        // 模板宽度（像素）
  height: number;       // 模板高度（像素）
  watchFaceType: "圆形" | "方形" | "跑道形";  // 表盘类型
  top: string;          // 截图顶部偏移（CSS单位）
  left: string;         // 截图左侧偏移（CSS单位）
  borderRadius: string; // 圆角配置（CSS单位）
  highlightGradient: string; // 高光渐变（CSS渐变）
  rotation: {          // 3D变换参数
    rotateX: number;    // X轴旋转角度
    rotateY: number;    // Y轴旋转角度
    rotateZ: number;    // Z轴旋转角度
    scale: number;      // 缩放比例
  };
}
```

### 🚀 项目结构

```
miband-proto-forge/
├── src/
│   ├── App.vue                 # 主应用组件（含完整模板配置）
│   ├── assets/
│   │   └── vue.svg
│   ├── components/
│   │   └── ui/               # shadcn/ui组件库
│   ├── lib/
│   │   └── utils.ts          # 工具函数
│   ├── main.ts               # 应用入口
│   ├── style.css             # 全局样式
│   └── vite-env.d.ts         # 类型声明
├── public/
│   ├── proto/                # 样机模板图片目录
│   │   ├── 10.png           # 小米手环10模板
│   │   └── 9p.png           # 通用模板图片
│   └── vite.svg             # 网站图标
├── package.json              # 项目配置
├── tsconfig.json            # TypeScript配置
├── vite.config.ts           # Vite配置
└── README.md                # 项目说明（本文件）
```

### 🔧 开发指南

#### 添加新设备模板
```typescript
// 在App.vue的deviceModels中添加新设备
"xiaomi-band-new": {
  deviceName: "小米手环新款",
  category: "手环",
  templates: [
    {
      id: "new-standard",
      name: "标准版",
      imagePath: "/proto/new.png",
      width: 200,
      height: 500,
      watchFaceType: "跑道形",
      top: "-50px",
      left: "0px",
      borderRadius: "200px",
      highlightGradient: "linear-gradient(325deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
      rotation: { rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 }
    }
  ]
}
```

### 🤝 贡献指南

#### 快速贡献流程
1. **Fork项目** - 在GitHub上Fork本项目
2. **创建分支** - `git checkout -b feature/new-device`
3. **添加模板** - 按照配置规范添加新设备
4. **测试验证** - 本地测试模板显示和导出效果
5. **提交PR** - 详细描述新增功能和测试结果

#### 贡献内容建议
- **新设备支持** - 添加新的手环/手表型号
- **模板优化** - 改进现有模板的视觉效果
- **功能增强** - 添加新的导出格式或效果
- **文档完善** - 补充使用指南和开发文档

### 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

### 🙏 致谢

- **米坛开发者中心**