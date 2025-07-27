<script setup lang="ts">
import { ref, computed } from "vue";
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

const selectedModel = ref("xiaomi-band-10");
const selectedTemplate = ref("10-standard");
const screenshotFile = ref<File | null>(null);
const screenshotUrl = ref<string>("");

/**
 * 设备型号配置数据
 * 统一存储所有设备信息，包含显示名称和模板配置
 */
const deviceModels: Record<string, DeviceModel> = {
  "xiaomi-band-10": {
    deviceName: "小米手环10",
    category: "手环",
    templates: [
      {
        id: "10-1",
        name: "模板一",
        imagePath: "/proto/10.png",
        width: 212,
        height: 520,
        watchFaceType: "跑道形",
        top: "-79.678px",
        left: "-8.95px",
        borderRadius: "200px",
        highlightGradient:
          "linear-gradient(300deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        rotation: { rotateX: 342, rotateY: 37, rotateZ: 27.8, scale: 0.515 },
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
        imagePath: "/proto/9p.png",
        width: 336,
        height: 480,
        watchFaceType: "方形",
        top: "-84.8px",
        left: "-35.8px",
        borderRadius: "48px",
        highlightGradient:
          "linear-gradient(325deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
        rotation: { rotateX: 25, rotateY: 331, rotateZ: 35, scale: 0.48 },
      },
    ],
  },
  // "xiaomi-band-9": {
  //   deviceName: "小米手环9",
  //   category: "手环",
  //   templates: [
  //     {
  //       id: "9-1",
  //       name: "模板一",
  //       imagePath: "/proto/9p.png",
  //       width: 336,
  //       height: 480,
  //       watchFaceType: "方形",
  //       top: "-84.8px",
  //       left: "-35.8px",
  //       borderRadius: "48px",
  //       highlightGradient:
  //         "linear-gradient(325deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
  //       rotation: { rotateX: 25, rotateY: 331, rotateZ: 35, scale: 0.48 },
  //     },
  //   ],
  // },
  // "xiaomi-watch-s3": {
  //   deviceName: "Xiaomi Watch S3",
  //   category: "手表",
  //   templates: [
  //     {
  //       id: "s3-1",
  //       name: "模板一",
  //       imagePath: "/proto/9p.png",
  //       width: 336,
  //       height: 480,
  //       watchFaceType: "方形",
  //       top: "-84.8px",
  //       left: "-35.8px",
  //       borderRadius: "48px",
  //       highlightGradient:
  //         "linear-gradient(325deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
  //       rotation: { rotateX: 25, rotateY: 331, rotateZ: 35, scale: 0.48 },
  //     },
  //   ],
  // },
  // "xiaomi-watch-s4": {
  //   deviceName: "Xiaomi Watch S4",
  //   category: "手表",
  //   templates: [
  //     {
  //       id: "s4-1",
  //       name: "模板一",
  //       imagePath: "/proto/9p.png",
  //       width: 336,
  //       height: 480,
  //       watchFaceType: "方形",
  //       top: "-84.8px",
  //       left: "-35.8px",
  //       borderRadius: "48px",
  //       highlightGradient:
  //         "linear-gradient(325deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
  //       rotation: { rotateX: 25, rotateY: 331, rotateZ: 35, scale: 0.48 },
  //     },
  //   ],
  // },
  // "redmi-watch-5": {
  //   deviceName: "红米手表5",
  //   category: "手表",
  //   templates: [
  //     {
  //       id: "r5-1",
  //       name: "模板一",
  //       imagePath: "/proto/9p.png",
  //       width: 336,
  //       height: 480,
  //       watchFaceType: "方形",
  //       top: "-84.8px",
  //       left: "-35.8px",
  //       borderRadius: "48px",
  //       highlightGradient:
  //         "linear-gradient(325deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
  //       rotation: { rotateX: 25, rotateY: 331, rotateZ: 35, scale: 0.48 },
  //     },
  //   ],
  // },
};

// 监听设备型号变化，自动选择第一个模板
import { watch } from "vue";
watch(selectedModel, (newModel) => {
  const device = deviceModels[newModel];
  if (device && device.templates.length > 0) {
    selectedTemplate.value = device.templates[0].id;
  }
});

interface ProtoTemplate {
  id: string;
  name: string;
  imagePath: string;
  width: number;
  height: number;
  watchFaceType: "圆形" | "方形" | "跑道形";
  top: string;
  left: string;
  borderRadius: string;
  highlightGradient: string;
  rotation: {
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    scale: number;
  };
}

interface DeviceModel {
  deviceName: string;
  category: string;
  templates: ProtoTemplate[];
}

/**
 * 当前选中的样机模板图片路径
 */
const currentProtoImage = computed(() => currentModel.value?.imagePath || "");

/**
 * 获取所有设备型号列表（用于下拉选择框）
 * 返回排序后的设备列表
 */
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

/**
 * 处理文件上传
 * 读取用户选择的截图文件并生成预览URL
 */
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    screenshotFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      screenshotUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

/**
 * 当前选中的设备型号和模板信息
 * 包含设备名称、模板配置等完整信息
 */
const currentModel = computed(() => {
  const device = deviceModels[selectedModel.value];
  const template =
    device?.templates.find((t) => t.id === selectedTemplate.value) ||
    device?.templates[0];
  return {
    ...template,
    deviceName: device?.deviceName || "设备",
  };
});

/**
 * 重置截图选择
 * 清除已选择的文件和预览
 */
const resetScreenshot = () => {
  screenshotFile.value = null;
  screenshotUrl.value = "";
  const fileInput = document.getElementById(
    "screenshot-upload"
  ) as HTMLInputElement;
  if (fileInput) fileInput.value = "";
};

// 预览区域的DOM引用
const previewRef = ref<HTMLDivElement | null>(null);

/**
 * 导出样机图片
 * 将预览区域渲染为PNG图片并下载
 */
const exportImage = async () => {
  if (!previewRef.value) return;

  try {
    const dataUrl = await toPng(previewRef.value, {
      quality: 0.95,
      // backgroundColor: '#ffffff',
      pixelRatio: 2, // 导出2倍高清图片
    });

    const link = document.createElement("a");
    link.download = `${currentModel.value.deviceName}-样机-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("导出图片失败:", error);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-6">⌚ MiBand Proto Forge</h1>

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

              <div v-if="screenshotUrl" class="space-y-2">
                <Button @click="exportImage" class="w-full">
                  导出样机图片
                </Button>
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
                  >{{ currentModel.deviceName }} 样机效果</CardDescription
                >
              </CardHeader>
              <CardContent>
                <div ref="previewRef" class="relative mx-auto">
                  <div class="relative mx-auto">
                    <!-- 样机图片（背景层） -->
                    <img
                      v-if="currentProtoImage"
                      :src="currentProtoImage"
                      :alt="currentModel.deviceName + ' 样机'"
                      class="inset-0 w-full h-full object-contain"
                    />

                    <!-- 截图显示区域（前景层） -->
                    <div
                      class="absolute overflow-hidden"
                      :style="{
                        top: currentModel.top,
                        left: currentModel.left,
                        width: currentModel.width + 'px',
                        height: currentModel.height + 'px',
                        borderRadius: currentModel.borderRadius,
                        transform: `rotateX(${currentModel.rotation.rotateX}deg) rotateY(${currentModel.rotation.rotateY}deg) rotateZ(${currentModel.rotation.rotateZ}deg) scale(${currentModel.rotation.scale})`,
                        transformStyle: 'preserve-3d',
                      }"
                    >
                      <div v-if="screenshotUrl" class="w-full h-full">
                        <img
                          :src="screenshotUrl"
                          :alt="currentModel.deviceName + ' 截图'"
                          class="w-full h-full object-contain"
                        />
                      </div>
                      <div
                        v-else
                        class="bg-white w-full h-full flex items-center justify-center"
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
                      <!-- 白色渐变高光蒙版 -->
                      <div
                        class="absolute inset-0 pointer-events-none"
                        :style="{
                          borderRadius: currentModel.borderRadius,
                          background: currentModel.highlightGradient,
                        }"
                      ></div>
                    </div>
                  </div>
                </div>

                <div class="mt-4 text-center">
                  <p class="text-sm text-gray-600">
                    {{ currentModel.width }} × {{ currentModel.height }} 像素
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
