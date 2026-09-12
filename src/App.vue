<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { toPng } from "html-to-image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getPerspectiveTransform, type Point } from "@/lib/perspective";
import { Github } from "lucide-vue-next";

const selectedModel = ref("xiaomi-band-10");
const selectedTemplate = ref("10-1");
const screenshotFile = ref<File | null>(null);
const screenshotUrl = ref<string>("");
const showScreenReflection = ref(true);

type CornerRadii = [number, number, number, number];

interface ProtoTemplate {
  id: string;
  name: string;
  imagePath: string;
  watchFaceType: "圆形" | "方形" | "跑道形";
  borderRadius: number | CornerRadii;
  highlightGradient: string;
  screenSource: {
    width: number;
    height: number;
  };
  // 顺序固定：TL, TR, BR, BL（基于样机原图像素坐标）
  screenCorners: Point[];
}

interface DeviceModel {
  deviceName: string;
  category: string;
  templates: ProtoTemplate[];
}

const deviceModels: Record<string, DeviceModel> = {
  "xiaomi-band-9": {
    deviceName: "小米手环9",
    category: "手环",
    templates: [
      {
        id: "9-1",
        name: "模板一",
        imagePath: "/proto/9-1.png",
        watchFaceType: "跑道形",
        borderRadius: 96,
        highlightGradient:
          "linear-gradient(300deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        screenSource: {
          width: 192,
          height: 490,
        },
        screenCorners: [
          {
            x: 411,
            y: 47,
          },
          {
            x: 650,
            y: 113,
          },
          {
            x: 295,
            y: 637,
          },
          {
            x: 62,
            y: 565,
          },
        ],
      },
      {
        id: "9-2",
        name: "模板二",
        imagePath: "/proto/9-2.png",
        watchFaceType: "跑道形",
        borderRadius: 96,
        highlightGradient:
          "linear-gradient(300deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        screenSource: {
          width: 192,
          height: 490,
        },
        screenCorners: [
          {
            x: 386,
            y: 68,
          },
          {
            x: 661,
            y: 107,
          },
          {
            x: 339,
            y: 735,
          },
          {
            x: 48,
            y: 723,
          },
        ],
      },
    ],
  },
  "xiaomi-band-10": {
    deviceName: "小米手环10",
    category: "手环",
    templates: [
      {
        id: "10-1",
        name: "模板一",
        imagePath: "/proto/10-1.png",
        watchFaceType: "跑道形",
        borderRadius: 106,
        highlightGradient:
          "linear-gradient(300deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        screenSource: {
          width: 212,
          height: 520,
        },
        screenCorners: [
          {
            x: 312,
            y: 128,
          },
          {
            x: 545,
            y: 198,
          },
          {
            x: 255,
            y: 932,
          },
          {
            x: 31,
            y: 841,
          },
        ],
      },
      {
        id: "10-2",
        name: "模板二",
        imagePath: "/proto/10-2.png",
        watchFaceType: "跑道形",
        borderRadius: 106,
        highlightGradient:
          "linear-gradient(300deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        screenSource: {
          width: 212,
          height: 520,
        },
        screenCorners: [
          {
            x: 605,
            y: 228,
          },
          {
            x: 856,
            y: 228,
          },
          {
            x: 581,
            y: 888,
          },
          {
            x: 322,
            y: 858,
          },
        ],
      },
      {
        id: "10-3",
        name: "模板三",
        imagePath: "/proto/10-3.png",
        watchFaceType: "跑道形",
        borderRadius: 106,
        highlightGradient:
          "linear-gradient(300deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        screenSource: {
          width: 212,
          height: 520,
        },
        screenCorners: [
          {
            x: 331,
            y: 125,
          },
          {
            x: 584,
            y: 79,
          },
          {
            x: 367,
            y: 697,
          },
          {
            x: 112,
            y: 715,
          },
        ],
      },
    ],
  },
  "xiaomi-band-11": {
    deviceName: "小米手环11",
    category: "手环",
    templates: [
      {
        id: "11-1",
        name: "模板一",
        imagePath: "/proto/11-1.png",
        watchFaceType: "跑道形",
        borderRadius: 106,
        highlightGradient:
          "linear-gradient(300deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        screenSource: {
          width: 212,
          height: 520,
        },
        screenCorners: [
          {
            x: 166,
            y: 204,
          },
          {
            x: 415,
            y: 182,
          },
          {
            x: 273,
            y: 951,
          },
          {
            x: 27,
            y: 942,
          },
        ],
      },
    ],
  },
  "xiaomi-band-9p": {
    deviceName: "小米手环9Pro",
    category: "手环",
    templates: [
      {
        id: "9p-1",
        name: "模板一",
        imagePath: "/proto/9p-1.png",
        watchFaceType: "方形",
        borderRadius: [48, 38, 48, 38],
        highlightGradient:
          "linear-gradient(325deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        screenSource: {
          width: 336,
          height: 480,
        },
        screenCorners: [
          {
            x: 319,
            y: 78,
          },
          {
            x: 608,
            y: 212,
          },
          {
            x: 324,
            y: 696,
          },
          {
            x: 48,
            y: 550,
          },
        ],
      },
      {
        id: "9p-2",
        name: "模板二",
        imagePath: "/proto/9p-2.png",
        watchFaceType: "方形",
        borderRadius: [48, 38, 44, 48],
        highlightGradient:
          "linear-gradient(325deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        screenSource: {
          width: 336,
          height: 480,
        },
        screenCorners: [
          {
            x: 84,
            y: 366,
          },
          {
            x: 410,
            y: 285,
          },
          {
            x: 407,
            y: 914,
          },
          {
            x: 68,
            y: 964,
          },
        ],
      },
    ],
  },
  "redmi-watch-5": {
    deviceName: "红米手表5",
    category: "手表",
    templates: [
      {
        id: "r5-1",
        name: "模板一",
        imagePath: "/proto/r5-1.png",
        watchFaceType: "方形",
        borderRadius: [95, 103, 103, 103],
        highlightGradient:
          "linear-gradient(280deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.2) 100%)",
        screenSource: {
          width: 432,
          height: 514,
        },
        screenCorners: [
          {
            x: 333,
            y: 269,
          },
          {
            x: 758,
            y: 342,
          },
          {
            x: 809,
            y: 810,
          },
          {
            x: 355,
            y: 764,
          },
        ],
      },
      {
        id: "r5-2",
        name: "模板二",
        imagePath: "/proto/r5-2.png",
        watchFaceType: "方形",
        borderRadius: [93, 103, 103, 103],
        highlightGradient:
          "linear-gradient(280deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.2) 100%)",
        screenSource: {
          width: 432,
          height: 514,
        },
        screenCorners: [
          {
            x: 687,
            y: 302,
          },
          {
            x: 1106,
            y: 323,
          },
          {
            x: 1096,
            y: 1007,
          },
          {
            x: 681,
            y: 1020,
          },
        ],
      },
    ],
  },
  "xiaomi-watch-s3": {
    deviceName: "小米手表S3",
    category: "手表",
    templates: [
      {
        id: "s3-1",
        name: "模板一",
        imagePath: "/proto/s3-1.png",
        watchFaceType: "圆形",
        borderRadius: 240,
        highlightGradient:
          "linear-gradient(280deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        screenSource: {
          width: 480,
          height: 480,
        },
        screenCorners: [
          {
            x: 136,
            y: 427,
          },
          {
            x: 553,
            y: 435,
          },
          {
            x: 523,
            y: 991,
          },
          {
            x: 126,
            y: 956,
          },
        ],
      },
      {
        id: "s3-2",
        name: "模板二",
        imagePath: "/proto/s3-2.png",
        watchFaceType: "圆形",
        borderRadius: 240,
        highlightGradient:
          "linear-gradient(35deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        screenSource: {
          width: 480,
          height: 480,
        },
        screenCorners: [
          {
            x: 295,
            y: 146,
          },
          {
            x: 848,
            y: 281,
          },
          {
            x: 583,
            y: 871,
          },
          {
            x: 49,
            y: 684,
          },
        ],
      },
    ],
  },
  "xiaomi-watch-s4": {
    deviceName: "小米手表S4",
    category: "手表",
    templates: [
      {
        id: "s4-1",
        name: "模板一",
        imagePath: "/proto/s4-1.png",
        watchFaceType: "圆形",
        borderRadius: 240,
        highlightGradient:
          "linear-gradient(280deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        screenSource: {
          width: 480,
          height: 480,
        },
        screenCorners: [
          {
            x: 175,
            y: 392,
          },
          {
            x: 637,
            y: 387,
          },
          {
            x: 624,
            y: 1018,
          },
          {
            x: 159,
            y: 970,
          },
        ],
      },
      {
        id: "s4-2",
        name: "模板二",
        imagePath: "/proto/s4-2.png",
        watchFaceType: "圆形",
        borderRadius: 240,
        highlightGradient:
          "linear-gradient(280deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        screenSource: {
          width: 480,
          height: 480,
        },
        screenCorners: [
          {
            x: 130,
            y: 350,
          },
          {
            x: 620,
            y: 360,
          },
          {
            x: 583,
            y: 994,
          },
          {
            x: 130,
            y: 946,
          },
        ],
      },
    ],
  },
};

watch(selectedModel, (newModel) => {
  const device = deviceModels[newModel];
  if (device?.templates.length) {
    selectedTemplate.value = device.templates[0].id;
  }
});

const deviceList = computed(() => {
  return Object.entries(deviceModels)
    .map(([key, model]) => ({
      value: key,
      deviceName: model.deviceName,
      category: model.category,
    }))
    .sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.deviceName.localeCompare(b.deviceName);
    });
});

const currentModel = computed(() => {
  const device = deviceModels[selectedModel.value];
  const template =
    device?.templates.find((t) => t.id === selectedTemplate.value) ||
    device?.templates[0];

  if (!device || !template) return null;
  return {
    ...template,
    deviceName: device.deviceName,
  };
});

const currentProtoImage = computed(() => currentModel.value?.imagePath || "");

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  screenshotFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    screenshotUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const resetScreenshot = () => {
  screenshotFile.value = null;
  screenshotUrl.value = "";
  const fileInput = document.getElementById(
    "screenshot-upload",
  ) as HTMLInputElement | null;
  if (fileInput) fileInput.value = "";
};

const previewRef = ref<HTMLDivElement | null>(null);
const protoImageRef = ref<HTMLImageElement | null>(null);

const protoSize = ref({
  naturalWidth: 1,
  naturalHeight: 1,
  renderWidth: 1,
  renderHeight: 1,
});

const updateProtoSize = () => {
  const el = protoImageRef.value;
  if (!el) return;
  protoSize.value = {
    naturalWidth: el.naturalWidth || 1,
    naturalHeight: el.naturalHeight || 1,
    renderWidth: el.clientWidth || 1,
    renderHeight: el.clientHeight || 1,
  };
};

const cornerEditMode = ref(false);
const editableCorners = ref<Point[]>([]);
const draggingCornerIndex = ref<number | null>(null);
const editableCornerRadii = ref<CornerRadii>([0, 0, 0, 0]);

const normalizeCornerRadii = (
  input: number | CornerRadii | undefined,
): CornerRadii => {
  if (Array.isArray(input) && input.length === 4) {
    return [
      Number.isFinite(input[0]) ? Math.max(0, input[0]) : 0,
      Number.isFinite(input[1]) ? Math.max(0, input[1]) : 0,
      Number.isFinite(input[2]) ? Math.max(0, input[2]) : 0,
      Number.isFinite(input[3]) ? Math.max(0, input[3]) : 0,
    ];
  }

  const value = Number(input);
  if (!Number.isFinite(value)) return [0, 0, 0, 0];
  const safe = Math.max(0, value);
  return [safe, safe, safe, safe];
};

const syncEditableCornerRadii = () => {
  editableCornerRadii.value = normalizeCornerRadii(
    currentModel.value?.borderRadius,
  );
};

const setCornerRadius = (index: number, rawValue: string) => {
  const parsed = Number(rawValue);
  const next = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  editableCornerRadii.value = editableCornerRadii.value.map((item, i) =>
    i === index ? next : item,
  ) as CornerRadii;
};

const displayCornersFromConfig = computed<Point[]>(() => {
  const model = currentModel.value;
  if (!model) return [];

  const scaleX = protoSize.value.renderWidth / protoSize.value.naturalWidth;
  const scaleY = protoSize.value.renderHeight / protoSize.value.naturalHeight;

  return model.screenCorners.map((p) => ({
    x: p.x * scaleX,
    y: p.y * scaleY,
  }));
});

const syncEditableCorners = () => {
  editableCorners.value = displayCornersFromConfig.value.map((p) => ({ ...p }));
};

watch(
  [
    currentModel,
    () => protoSize.value.renderWidth,
    () => protoSize.value.renderHeight,
  ],
  () => {
    if (!cornerEditMode.value) {
      syncEditableCorners();
    }
  },
  { immediate: true },
);

watch(
  currentModel,
  () => {
    syncEditableCornerRadii();
  },
  { immediate: true },
);

const effectiveCorners = computed<Point[]>(() => {
  if (cornerEditMode.value && editableCorners.value.length === 4) {
    return editableCorners.value;
  }
  return displayCornersFromConfig.value;
});

const scaledScreenSource = computed(() => {
  const model = currentModel.value;
  if (!model) return { width: 1, height: 1 };

  const scaleX = protoSize.value.renderWidth / protoSize.value.naturalWidth;
  const scaleY = protoSize.value.renderHeight / protoSize.value.naturalHeight;

  return {
    width: model.screenSource.width * scaleX,
    height: model.screenSource.height * scaleY,
  };
});

const scaledBorderRadius = computed(() => {
  const scaleX = protoSize.value.renderWidth / protoSize.value.naturalWidth;
  const scaleY = protoSize.value.renderHeight / protoSize.value.naturalHeight;
  const scale = (scaleX + scaleY) / 2;
  const [tl, tr, br, bl] = editableCornerRadii.value.map(
    (radius) => radius * scale,
  ) as CornerRadii;

  return `${tl}px ${tr}px ${br}px ${bl}px`;
});

const warpMatrix = computed(() => {
  if (!currentModel.value || effectiveCorners.value.length !== 4) return "none";

  return getPerspectiveTransform(
    scaledScreenSource.value.width,
    scaledScreenSource.value.height,
    effectiveCorners.value,
  );
});

const guidePolygonPoints = computed(() => {
  return effectiveCorners.value.map((p) => `${p.x},${p.y}`).join(" ");
});

const editableCornersAsConfig = computed(() => {
  if (effectiveCorners.value.length !== 4) return "[]";

  const scaleX = protoSize.value.naturalWidth / protoSize.value.renderWidth;
  const scaleY = protoSize.value.naturalHeight / protoSize.value.renderHeight;

  const corners = effectiveCorners.value.map((p) => ({
    x: Math.round(p.x * scaleX),
    y: Math.round(p.y * scaleY),
  }));

  return JSON.stringify(corners, null, 2);
});

const toggleCornerEdit = () => {
  cornerEditMode.value = !cornerEditMode.value;
  syncEditableCorners();
};

const resetEditableCorners = () => {
  syncEditableCorners();
};

const copyCornerConfig = async () => {
  try {
    await navigator.clipboard.writeText(editableCornersAsConfig.value);
  } catch (err) {
    console.error("复制角点配置失败", err);
  }
};

const handleCornerPointerDown = (index: number, event: PointerEvent) => {
  if (!cornerEditMode.value) return;
  draggingCornerIndex.value = index;
  (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
};

const handlePointerMove = (event: PointerEvent) => {
  if (!cornerEditMode.value || draggingCornerIndex.value === null) return;
  const el = protoImageRef.value;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const nextX = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
  const nextY = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);

  editableCorners.value = editableCorners.value.map((p, index) =>
    index === draggingCornerIndex.value ? { x: nextX, y: nextY } : p,
  );
};

const handlePointerUp = () => {
  draggingCornerIndex.value = null;
};

const exportImage = async () => {
  if (!previewRef.value || !currentModel.value) return;

  try {
    const dataUrl = await toPng(previewRef.value, {
      quality: 0.95,
      pixelRatio: 2,
    });

    const link = document.createElement("a");
    link.download = `${currentModel.value.deviceName}-样机-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("导出图片失败:", error);
  }
};

onMounted(() => {
  window.addEventListener("resize", updateProtoSize);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateProtoSize);
  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerup", handlePointerUp);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="p-4">
      <div class="mb-6 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <img src="/logo.svg" alt="logo" class="h-8 w-8" />
          <h1 class="text-2xl font-bold">米环样机生成器</h1>
        </div>
        <a
          href="https://github.com/zaona/miband-proto-forge"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub 仓库"
          class="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <Github class="h-5 w-5" />
          <span class="sr-only">GitHub 仓库</span>
        </a>
      </div>

      <div class="flex flex-col lg:flex-row gap-4">
        <div class="w-full">
          <Card>
            <CardHeader>
              <CardTitle>配置选项</CardTitle>
              <CardDescription>选择手环型号并上传截图</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-2">
                <label class="text-sm font-medium">手环型号</label>
                <Select v-model="selectedModel">
                  <SelectTrigger>
                    <SelectValue placeholder="选择手环型号" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="device in deviceList"
                      :key="device.value"
                      :value="device.value"
                    >
                      {{ device.deviceName }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div
                class="space-y-2"
                v-if="deviceModels[selectedModel]?.templates.length > 1"
              >
                <label class="text-sm font-medium">样机模板</label>
                <Select v-model="selectedTemplate">
                  <SelectTrigger>
                    <SelectValue placeholder="选择样机模板" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="template in deviceModels[selectedModel]?.templates"
                      :key="template.id"
                      :value="template.id"
                    >
                      {{ template.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">手环截图</label>
                <Input
                  id="screenshot-upload"
                  type="file"
                  accept="image/*"
                  @change="handleFileUpload"
                />
                <p class="text-xs text-gray-500">
                  支持 JPG、PNG、WEBP 格式图片
                </p>
              </div>

              <div v-if="screenshotFile" class="space-y-2">
                <p class="text-sm font-medium">已选择文件</p>
                <div
                  class="flex items-center justify-between p-3 bg-gray-100 rounded-md"
                >
                  <span class="text-sm truncate">{{
                    screenshotFile.name
                  }}</span>
                  <Button variant="ghost" size="sm" @click="resetScreenshot">
                    重新选择
                  </Button>
                </div>
              </div>

              <div class="flex items-center justify-between gap-3">
                <div class="space-y-0.5">
                  <label for="screen-reflection" class="text-sm font-medium"
                    >屏幕反光</label
                  >
                  <p class="text-xs text-gray-500">
                    关闭后预览与导出不再叠加屏幕高光
                  </p>
                </div>
                <Switch
                  id="screen-reflection"
                  v-model="showScreenReflection"
                />
              </div>

              <div class="space-y-2" v-if="currentModel">
                <p class="text-sm font-medium">圆角设置（TL / TR / BR / BL）</p>
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="text-xs text-gray-500">TL</label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      :model-value="String(editableCornerRadii[0])"
                      @update:model-value="
                        (v) => setCornerRadius(0, String(v ?? '0'))
                      "
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs text-gray-500">TR</label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      :model-value="String(editableCornerRadii[1])"
                      @update:model-value="
                        (v) => setCornerRadius(1, String(v ?? '0'))
                      "
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs text-gray-500">BR</label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      :model-value="String(editableCornerRadii[2])"
                      @update:model-value="
                        (v) => setCornerRadius(2, String(v ?? '0'))
                      "
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs text-gray-500">BL</label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      :model-value="String(editableCornerRadii[3])"
                      @update:model-value="
                        (v) => setCornerRadius(3, String(v ?? '0'))
                      "
                    />
                  </div>
                </div>
                <p class="text-xs text-gray-500">
                  配置格式示例：`borderRadius: [{{ editableCornerRadii.join(", ") }}]`
                </p>
              </div>

              <div class="space-y-2">
                <p class="text-sm font-medium">角点调试</p>
                <div class="flex gap-2">
                  <Button variant="outline" size="sm" @click="toggleCornerEdit">
                    {{ cornerEditMode ? "关闭调试" : "编辑角点" }}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="!cornerEditMode"
                    @click="resetEditableCorners"
                  >
                    重置角点
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="effectiveCorners.length !== 4"
                    @click="copyCornerConfig"
                  >
                    复制角点配置
                  </Button>
                </div>
                <p class="text-xs text-gray-500">
                  拖动预览中的4个控制点，复制后粘贴到模板 `screenCorners`。
                </p>
                <pre
                  class="text-xs bg-gray-100 p-2 rounded-md overflow-auto max-h-40"
                  >{{ editableCornersAsConfig }}</pre
                >
              </div>

              <div v-if="screenshotUrl" class="space-y-2">
                <Button @click="exportImage" class="w-full"
                  >导出样机图片</Button
                >
              </div>
            </CardContent>
          </Card>
        </div>

        <ScrollArea class="rounded-md max-w-md whitespace-nowrap">
          <div>
            <Card class="w-md">
              <CardHeader>
                <CardTitle>样机预览</CardTitle>
                <CardDescription
                  >{{
                    currentModel?.deviceName || "设备"
                  }}
                  样机效果</CardDescription
                >
              </CardHeader>
              <CardContent>
                <div ref="previewRef" class="relative mx-auto inline-block">
                  <img
                    v-if="currentProtoImage"
                    ref="protoImageRef"
                    :src="currentProtoImage"
                    :alt="(currentModel?.deviceName || '设备') + ' 样机'"
                    class="block max-w-full h-auto"
                    @load="updateProtoSize"
                  />

                  <div class="absolute inset-0" v-if="currentModel">
                    <div
                      class="absolute left-0 top-0 overflow-hidden relative"
                      :style="{
                        width: scaledScreenSource.width + 'px',
                        height: scaledScreenSource.height + 'px',
                        borderRadius: scaledBorderRadius,
                        transform: warpMatrix,
                        transformOrigin: '0 0',
                      }"
                    >
                      <div
                        v-if="screenshotUrl"
                        class="w-full h-full absolute inset-0 z-10"
                      >
                        <img
                          :src="screenshotUrl"
                          :alt="currentModel.deviceName + ' 截图'"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        v-else
                        class="bg-white w-full h-full flex items-center justify-center absolute inset-0 z-10"
                      >
                        <div class="text-center text-gray-400">
                          <svg
                            class="w-8 h-8 mx-auto mb-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>

                      <div
                        v-if="showScreenReflection"
                        class="absolute inset-0 pointer-events-none z-20"
                        :style="{
                          borderRadius: scaledBorderRadius,
                          background: currentModel.highlightGradient,
                        }"
                      ></div>
                    </div>

                    <svg
                      v-if="cornerEditMode && effectiveCorners.length === 4"
                      class="absolute inset-0 w-full h-full"
                    >
                      <polygon
                        :points="guidePolygonPoints"
                        fill="rgba(59, 130, 246, 0.08)"
                        stroke="rgba(59, 130, 246, 0.75)"
                        stroke-width="2"
                        stroke-dasharray="6 4"
                      />
                    </svg>

                    <button
                      v-if="cornerEditMode"
                      v-for="(corner, index) in editableCorners"
                      :key="index"
                      type="button"
                      class="absolute w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow -translate-x-1/2 -translate-y-1/2 cursor-move"
                      :style="{
                        left: corner.x + 'px',
                        top: corner.y + 'px',
                      }"
                      @pointerdown="(e) => handleCornerPointerDown(index, e)"
                    ></button>
                  </div>
                </div>

                <div class="mt-4 text-center" v-if="currentModel">
                  <p class="text-sm text-gray-600">
                    源截图 {{ currentModel.screenSource.width }} ×
                    {{ currentModel.screenSource.height }} 像素
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  </div>
</template>
