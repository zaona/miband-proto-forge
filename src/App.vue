<script setup lang="ts">
import { ref, computed } from "vue";
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

const selectedModel = ref("xiaomi-band-10");
const screenshotFile = ref<File | null>(null);
const screenshotUrl = ref<string>("");

const models = [
  { value: "xiaomi-band-10", label: "小米手环10" },
  { value: "xiaomi-band-9", label: "小米手环9" },
  { value: "xiaomi-watch-s4", label: "Xiaomi Watch S4" },
  { value: "redmi-watch-5", label: "红米手表5" },
];

interface ModelInfo {
  width: number;
  height: number;
  deviceName: string;
  watchFaceType: "圆形" | "方形" | "跑道形";
  top: string;
  left: string;
}

const modelDimensions: Record<string, ModelInfo> = {
  "xiaomi-band-10": {
    width: 212,
    height: 520,
    deviceName: "小米手环10",
    watchFaceType: "跑道形",
    top: "-79.4px",
    left: "-8.8px",
  },
  "xiaomi-band-9": {
    width: 192,
    height: 490,
    deviceName: "小米手环9",
    watchFaceType: "跑道形",
    top: "-24px",
    left: "12px",
  },
  "xiaomi-watch-s4": {
    width: 464,
    height: 464,
    deviceName: "Xiaomi Watch S4",
    watchFaceType: "圆形",
    top: "40px",
    left: "40px",
  },
  "redmi-watch-5": {
    width: 340,
    height: 390,
    deviceName: "红米手表5",
    watchFaceType: "方形",
    top: "50px",
    left: "25px",
  },
};

interface RotationConfig {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
}

const defaultRotationConfigs: Record<string, RotationConfig> = {
  "xiaomi-band-10": { rotateX: 342, rotateY: 37, rotateZ: 28, scale: 0.51 },
  "xiaomi-band-9": { rotateX: 10, rotateY: -30, rotateZ: 8, scale: 0.78 },
  "xiaomi-watch-s4": { rotateX: 20, rotateY: -15, rotateZ: 0, scale: 0.85 },
  "redmi-watch-5": { rotateX: 8, rotateY: -28, rotateZ: 6, scale: 0.79 },
};

const rotationConfigs: Record<string, RotationConfig> = {
  ...defaultRotationConfigs,
};

const protoImages: Record<string, string> = {
  "xiaomi-band-10": "/src/assets/proto/10.png",
  "xiaomi-band-9": "/src/assets/proto/9.png",
  "xiaomi-watch-s4": "/src/assets/proto/watch-s4.png",
  "redmi-watch-5": "/src/assets/proto/redmi-watch-5.png",
};

const currentProtoImage = computed(() => protoImages[selectedModel.value]);

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

const currentModel = computed(() => modelDimensions[selectedModel.value]);
const currentRotation = computed(
  () =>
    rotationConfigs[selectedModel.value] ||
    defaultRotationConfigs[selectedModel.value]
);

const resetScreenshot = () => {
  screenshotFile.value = null;
  screenshotUrl.value = "";
  const fileInput = document.getElementById(
    "screenshot-upload"
  ) as HTMLInputElement;
  if (fileInput) fileInput.value = "";
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-6">MiBand Proto Forge</h1>

      <div class="flex flex-col lg:flex-row gap-4">
        <div class="h-full">
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
                      v-for="model in models"
                      :key="model.value"
                      :value="model.value"
                    >
                      {{ model.label }} -
                      {{ modelDimensions[model.value]?.watchFaceType }}
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
            </CardContent>
          </Card>
        </div>
        <div>
          <div class="h-full flex items-center justify-center">
            <Card class="w-full max-w-md">
              <CardHeader>
                <CardTitle>样机预览</CardTitle>
                <CardDescription
                  >{{ currentModel.deviceName }} 样机效果</CardDescription
                >
              </CardHeader>
              <CardContent>
                <div class="relative mx-auto" style="perspective: 1000px">
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
                        borderRadius:
                          currentModel.watchFaceType === '圆形'
                            ? '50%'
                            : currentModel.watchFaceType === '跑道形'
                            ? '200px'
                            : '20px',
                        transform: `rotateX(${currentRotation.rotateX}deg) rotateY(${currentRotation.rotateY}deg) rotateZ(${currentRotation.rotateZ}deg) scale(${currentRotation.scale})`,
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
        </div>
      </div>
    </div>
  </div>
</template>
