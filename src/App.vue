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
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getPerspectiveTransform, type Point } from "@/lib/perspective";

const selectedModel = ref("xiaomi-band-10");
const selectedTemplate = ref("10-1");
const screenshotFile = ref<File | null>(null);
const screenshotUrl = ref<string>("");

interface ProtoTemplate {
  id: string;
  name: string;
  imagePath: string;
  watchFaceType: "圆形" | "方形" | "跑道形";
  borderRadius: string;
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
  "xiaomi-band-10": {
    deviceName: "小米手环10",
    category: "手环",
    templates: [
      {
        id: "10-1",
        name: "模板一",
        imagePath: "/proto/10-1.png",
        watchFaceType: "跑道形",
        borderRadius: "200px",
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
        borderRadius: "48px",
        highlightGradient:
          "linear-gradient(325deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        screenSource: {
          width: 336,
          height: 480,
        },
        screenCorners: [
          {
            x: 326,
            y: 75,
          },
          {
            x: 605,
            y: 203,
          },
          {
            x: 324,
            y: 696,
          },
          {
            x: 51,
            y: 557,
          },
        ],
      },
      {
        id: "9p-2",
        name: "模板二",
        imagePath: "/proto/9p-2.png",
        watchFaceType: "方形",
        borderRadius: "48px",
        highlightGradient:
          "linear-gradient(325deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        screenSource: {
          width: 336,
          height: 480,
        },
        screenCorners: [
          {
            x: 80,
            y: 356,
          },
          {
            x: 411,
            y: 276,
          },
          {
            x: 407,
            y: 920,
          },
          {
            x: 66,
            y: 972,
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

const effectiveCorners = computed<Point[]>(() => {
  if (cornerEditMode.value && editableCorners.value.length === 4) {
    return editableCorners.value;
  }
  return displayCornersFromConfig.value;
});

const warpMatrix = computed(() => {
  const model = currentModel.value;
  if (!model || effectiveCorners.value.length !== 4) return "none";

  return getPerspectiveTransform(
    model.screenSource.width,
    model.screenSource.height,
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
      <div class="flex gap-2 mb-6 items-center">
        <img src="/logo.svg" alt="logo" class="w-8 h-8 mt-1" />
        <h1 class="text-2xl font-bold">MiBand Proto Forge V2</h1>
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

              <Separator />

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

              <Separator />

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

        <ScrollArea class="border rounded-md max-w-md whitespace-nowrap">
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
                        width: currentModel.screenSource.width + 'px',
                        height: currentModel.screenSource.height + 'px',
                        borderRadius: currentModel.borderRadius,
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
                          <p>请上传截图</p>
                        </div>
                      </div>

                      <div
                        class="absolute inset-0 pointer-events-none z-20"
                        :style="{
                          borderRadius: currentModel.borderRadius,
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
