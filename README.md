# MiBand Proto Forge

小米手环样机生成器。

## 技术栈

- Vue 3 + TypeScript
- shadcn/ui + Tailwind CSS
- html-to-image（导出 PNG）
- Vite

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 或 npm

### 安装与运行

```bash
# 安装依赖
pnpm install
# 或 npm install

# 启动开发
pnpm dev
# 或 npm run dev
```

### 构建

```bash
pnpm build
# 或 npm run build

pnpm preview
# 或 npm run preview
```

## 使用流程

1. 选择设备型号和模板。
2. 上传截图（JPG/PNG/WEBP）。
3. 如需校准，点击“编辑角点”。
4. 拖动预览中的 4 个控制点对齐屏幕。
5. 点击“复制角点配置”，把结果粘贴到模板 `screenCorners`。
6. 点击“导出样机图片”。

说明：
- 外框辅助线只会在“编辑角点”开启时显示，导出图不会带辅助线。

## 模板配置

当前模板结构（定义在 `src/App.vue` 的 `deviceModels` 中）：

```ts
interface Point {
  x: number;
  y: number;
}

interface ProtoTemplate {
  id: string;
  name: string;
  imagePath: string;
  watchFaceType: "圆形" | "方形" | "跑道形";
  borderRadius: string;
  highlightGradient: string;
  screenSource: {
    width: number;   // 源截图宽
    height: number;  // 源截图高
  };
  screenCorners: Point[]; // 目标四角点：TL, TR, BR, BL（样机原图坐标）
}
```

### 新增模板示例

```ts
"xiaomi-band-new": {
  deviceName: "小米手环新款",
  category: "手环",
  templates: [
    {
      id: "new-1",
      name: "模板一",
      imagePath: "/proto/new-1.png",
      watchFaceType: "跑道形",
      borderRadius: "200px",
      highlightGradient:
        "linear-gradient(300deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
      screenSource: {
        width: 212,
        height: 520,
      },
      screenCorners: [
        { x: 320, y: 160 }, // TL
        { x: 540, y: 250 }, // TR
        { x: 260, y: 900 }, // BR
        { x: 40, y: 810 },  // BL
      ],
    },
  ],
}
```

## 项目结构

```text
miband-proto-forge/
├─ public/
│  ├─ logo.svg
│  └─ proto/
│     ├─ 10-1.png
│     ├─ 9p-1.png
│     └─ 9p-2.png
├─ src/
│  ├─ App.vue
│  ├─ main.ts
│  ├─ style.css
│  ├─ lib/
│  │  ├─ perspective.ts
│  │  └─ utils.ts
│  └─ components/ui/
├─ perspective-warp-tool/   # 参考/实验透视工具
├─ package.json
└─ README.md
```

## 许可证

MIT，见 `LICENSE`。
