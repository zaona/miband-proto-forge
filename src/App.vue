<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
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
import { getPerspectiveTransform, type Point } from "@/lib/perspective";
import ImageLoading from "@/components/ImageLoading.vue";

const imageRequests = new Set<AbortController>();
const imageUrls = new Set<string>();

const releaseImage = (url: string) => {
  if (imageUrls.delete(url)) URL.revokeObjectURL(url);
};

const loadImage = async (
  src: string,
  onProgress: (value: number | null) => void,
  controller = new AbortController(),
): Promise<HTMLImageElement> => {
  const xhr = new XMLHttpRequest();
  const abort = () => xhr.abort();
  imageRequests.add(controller);
  controller.signal.addEventListener("abort", abort);
  let url = "";

  try {
    const blob = await new Promise<Blob>((resolve, reject) => {
      xhr.open("GET", src);
      xhr.responseType = "blob";
      xhr.onprogress = (event) => onProgress(
        event.lengthComputable && event.total > 0
          ? Math.min(100, (event.loaded / event.total) * 100)
          : null,
      );

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100);
          resolve(xhr.response);
        } else {
          reject(new Error("图片加载失败"));
        }
      };
      xhr.onerror = () => reject(new Error("图片加载失败"));
      xhr.onabort = () => reject(new DOMException("请求已取消", "AbortError"));
      xhr.send();
    });

    url = URL.createObjectURL(blob);
    const image = new Image();
    image.src = url;
    await image.decode();

    if (controller.signal.aborted) {
      throw new DOMException("请求已取消", "AbortError");
    }

    imageUrls.add(url);
    return image;
  } catch (error) {
    if (url) URL.revokeObjectURL(url);
    throw error;
  } finally {
    imageRequests.delete(controller);
    controller.signal.removeEventListener("abort", abort);
  }
};

const screenTypes = ["圆形", "方形", "跑道形"] as const;
const selectedScreenType = ref<ProtoTemplate["watchFaceType"]>("圆形");
const selectedModel = ref("");
const selectedTemplate = ref("");
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
          "linear-gradient(275deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
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
          "linear-gradient(260deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.3) 100%)",
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
          "linear-gradient(280deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.3) 100%)",
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
          "linear-gradient(290deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
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
          "linear-gradient(290deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.3) 100%)",
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
        borderRadius: [48, 44, 44, 47],
        highlightGradient:
          "linear-gradient(270deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0.22) 100%)",
        screenSource: {
          width: 336,
          height: 480,
        },
        screenCorners: [
          {
            x: 323,
            y: 68,
          },
          {
            x: 612,
            y: 199,
          },
          {
            x: 321,
            y: 707,
          },
          {
            x: 39,
            y: 563,
          },
        ],
      },
      {
        id: "9p-2",
        name: "模板二",
        imagePath: "/proto/9p-2.png",
        watchFaceType: "方形",
        borderRadius: 48,
        highlightGradient:
          "linear-gradient(340deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.2) 100%)",
        screenSource: {
          width: 336,
          height: 480,
        },
        screenCorners: [
          {
            x: 82,
            y: 362,
          },
          {
            x: 417,
            y: 281,
          },
          {
            x: 413,
            y: 917,
          },
          {
            x: 67,
            y: 966,
          },
        ],
      },
    ],
  },
  "xiaomi-band-10p": {
    deviceName: "小米手环10Pro",
    category: "手环",
    templates: [
      {
        id: "10p-1",
        name: "模板一",
        imagePath: "/proto/10p-1.png",
        watchFaceType: "方形",
        borderRadius: [54, 44, 44, 48],
        highlightGradient:
          "linear-gradient(305deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.3) 100%)",
        screenSource: {
          width: 336,
          height: 480,
        },
        screenCorners: [
          {
            x: 161,
            y: 135,
          },
          {
            x: 370,
            y: 118,
          },
          {
            x: 301,
            y: 515,
          },
          {
            x: 90,
            y: 510,
          },
        ],
      },
      {
        id: "10p-2",
        name: "模板二",
        imagePath: "/proto/10p-2.png",
        watchFaceType: "方形",
        borderRadius: [54, 44, 44, 48],
        highlightGradient:
          "linear-gradient(305deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.3) 100%)",
        screenSource: {
          width: 336,
          height: 480,
        },
        screenCorners: [
          {
            x: 161,
            y: 135,
          },
          {
            x: 370,
            y: 118,
          },
          {
            x: 301,
            y: 515,
          },
          {
            x: 90,
            y: 510,
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
        borderRadius: [74, 83, 74, 82],
        highlightGradient:
          "linear-gradient(335deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.2) 100%)",
        screenSource: {
          width: 432,
          height: 514,
        },
        screenCorners: [
          {
            x: 327,
            y: 264,
          },
          {
            x: 758,
            y: 339,
          },
          {
            x: 813,
            y: 819,
          },
          {
            x: 351,
            y: 773,
          },
        ],
      },
      {
        id: "r5-2",
        name: "模板二",
        imagePath: "/proto/r5-2.png",
        watchFaceType: "方形",
        borderRadius: [82, 88, 88, 82],
        highlightGradient:
          "linear-gradient(290deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.3) 100%)",
        screenSource: {
          width: 432,
          height: 514,
        },
        screenCorners: [
          {
            x: 664,
            y: 289,
          },
          {
            x: 1116,
            y: 308,
          },
          {
            x: 1116,
            y: 1014,
          },
          {
            x: 664,
            y: 1029,
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
          "linear-gradient(10deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.2) 100%)",
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
          "linear-gradient(295deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
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
          "linear-gradient(305deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
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
          "linear-gradient(305deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)",
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

const deviceList = computed(() =>
  Object.entries(deviceModels)
    .filter(([, device]) =>
      device.templates.some((t) => t.watchFaceType === selectedScreenType.value),
    )
    .map(([value, device]) => ({
      value,
      deviceName: device.deviceName,
      category: device.category,
    }))
    .sort((a, b) =>
      Number(a.category !== "手表") - Number(b.category !== "手表") ||
      Number(b.deviceName.match(/\d+/)?.[0] ?? 0) -
        Number(a.deviceName.match(/\d+/)?.[0] ?? 0) ||
      b.deviceName.localeCompare(a.deviceName, "zh-CN", { numeric: true }),
    ),
);

const currentTemplates = computed(() =>
  (deviceModels[selectedModel.value]?.templates ?? []).filter(
    (t) => t.watchFaceType === selectedScreenType.value,
  ),
);

watch(
  selectedScreenType,
  () => {
    selectedModel.value = deviceList.value[0]?.value ?? "";
  },
  { immediate: true },
);

watch(
  currentTemplates,
  (templates) => {
    selectedTemplate.value = templates[0]?.id ?? "";
  },
  { immediate: true },
);

const currentModel = computed(() => {
  const device = deviceModels[selectedModel.value];
  const template = currentTemplates.value.find(
    (t) => t.id === selectedTemplate.value,
  ) ?? currentTemplates.value[0];

  if (!device || !template) return null;
  return { ...template, deviceName: device.deviceName };
});

const previewModel = ref<
  (ProtoTemplate & {
    deviceName: string;
    imageWidth: number;
    imageHeight: number;
  }) | null
>(null);

const previewReady = ref(false);
let previewLoadId = 0;

const currentProtoImage = computed(() => previewModel.value?.imagePath || "");

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
  const model = previewModel.value;
  if (!el || !model) return;

  protoSize.value = {
    naturalWidth: model.imageWidth,
    naturalHeight: model.imageHeight,
    renderWidth: el.clientWidth || 1,
    renderHeight: el.clientHeight || 1,
  };
};

const cornerEditMode = ref(false);
const showCornerGuide = ref(true);
const showCornerDetails = ref(false);
const cornerLabels = ["TL", "TR", "BR", "BL"] as const;
const cornerAxes = ["x", "y"] as const;
const showCornerRadiusSettings = ref(false);
const editableCorners = ref<Point[]>([]);
const draggingCornerIndex = ref<number | null>(null);
let cornerDrag: {
  pointerId: number;
  offsetX: number;
  offsetY: number;
} | null = null;
const editableCornerRadii = ref<CornerRadii>([0, 0, 0, 0]);
type TemplateProgress = {
  radii?: CornerRadii;
  corners?: Point[];
};

const templateProgress = new Map<string, TemplateProgress>();

const progressKey = computed(() => {
  const model = previewModel.value;
  return model ? JSON.stringify([model.deviceName, model.id]) : "";
});

const saveProgress = (changes: TemplateProgress) => {
  const key = progressKey.value;
  if (!key || debugUnavailable.value) return;

  templateProgress.set(key, {
    ...templateProgress.get(key),
    ...changes,
  });
};

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
    templateProgress.get(progressKey.value)?.radii ??
      previewModel.value?.borderRadius,
  );
};

const resetEditableCornerRadii = () => {
  if (debugUnavailable.value) return;

  const saved = templateProgress.get(progressKey.value);
  if (saved) delete saved.radii;
  syncEditableCornerRadii();
};

const templatePreviewSize = { width: 96, height: 112 };
const templateImageSizes = ref<Record<string, {
  width: number;
  height: number;
}>>({});

const templateImages = ref<Record<string, {
  url: string;
  progress: number | null;
  error: boolean;
}>>({});

const previewImage = computed(() =>
  templateImages.value[currentModel.value?.imagePath ?? ""],
);

const previewLoading = computed(() =>
  !!currentModel.value &&
  !previewImage.value?.error &&
  (!previewImage.value?.url || !previewReady.value),
);

const previewLoadError = computed(() =>
  previewImage.value?.error ? "模板加载失败，请重试" : "",
);

const previewProgress = computed(() =>
  previewImage.value?.progress ?? null,
);

const debugUnavailable = computed(() => {
  const selected = currentModel.value;
  const shown = previewModel.value;

  return (
    previewLoading.value ||
    !!previewLoadError.value ||
    !selected ||
    !shown ||
    selected.id !== shown.id ||
    selected.deviceName !== shown.deviceName
  );
});

const debugHint = computed(() => {
  if (previewLoadError.value) {
    return "模板加载失败，暂时无法调整，请尝试重新加载";
  }
  return debugUnavailable.value ? "模板加载中，暂时无法调整，请耐心等待" : "";
});

watch(debugUnavailable, (disabled) => {
  if (disabled) {
    cornerDrag = null;
    draggingCornerIndex.value = null;
  }
}, { flush: "sync" });

const loadTemplateImage = async (template: ProtoTemplate) => {
  const path = template.imagePath;
  if (templateImages.value[path] && !templateImages.value[path].error) return;

  templateImages.value[path] = { url: "", progress: 0, error: false };
  const state = templateImages.value[path];

  try {
    const image = await loadImage(path, value => state.progress = value);
    templateImageSizes.value[path] = {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
    state.url = image.src;
  } catch {
    state.error = true;
  }
};

watch(currentTemplates, templates => {
  templates.forEach(loadTemplateImage);
}, { immediate: true });

const getTemplateMaskStyle = (template: ProtoTemplate) => {
  const size = templateImageSizes.value[template.imagePath];
  if (!size?.width || !size.height) return { display: "none" };

  const scale = Math.min(
    templatePreviewSize.width / size.width,
    templatePreviewSize.height / size.height,
  );
  const { width, height } = template.screenSource;

  return {
    left: (templatePreviewSize.width - size.width * scale) / 2 + "px",
    top: (templatePreviewSize.height - size.height * scale) / 2 + "px",
    width: width + "px",
    height: height + "px",
    borderRadius: normalizeCornerRadii(template.borderRadius)
      .map((radius) => radius + "px").join(" "),
    transform: `scale(${scale}) ${getPerspectiveTransform(width, height, template.screenCorners)}`,
    transformOrigin: "0 0",
    boxShadow: `0 0 0 ${0.75 / scale}px #000`,
  };
};

const setCornerRadius = (index: number, rawValue: string) => {
  if (!showCornerRadiusSettings.value || debugUnavailable.value) return;

  const parsed = Number(rawValue);
  const next = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;

  editableCornerRadii.value = editableCornerRadii.value.map((item, i) =>
    i === index ? next : item,
  ) as CornerRadii;

  saveProgress({ radii: [...editableCornerRadii.value] as CornerRadii });
};

const displayCornersFromConfig = computed<Point[]>(() => {
  const model = previewModel.value;
  if (!model) return [];

  const scaleX = protoSize.value.renderWidth / protoSize.value.naturalWidth;
  const scaleY = protoSize.value.renderHeight / protoSize.value.naturalHeight;

  return model.screenCorners.map((p) => ({
    x: p.x * scaleX,
    y: p.y * scaleY,
  }));
});

const syncEditableCorners = () => {
  const corners =
    templateProgress.get(progressKey.value)?.corners ??
    previewModel.value?.screenCorners ??
    [];

  const scaleX = protoSize.value.renderWidth / protoSize.value.naturalWidth;
  const scaleY = protoSize.value.renderHeight / protoSize.value.naturalHeight;

  editableCorners.value = corners.map((p) => ({
    x: p.x * scaleX,
    y: p.y * scaleY,
  }));
};

watch(
  [previewModel, protoSize],
  () => {
    draggingCornerIndex.value = null;
    syncEditableCorners();
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
  const model = previewModel.value;
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
  const radii = showCornerRadiusSettings.value
    ? editableCornerRadii.value
    : normalizeCornerRadii(previewModel.value?.borderRadius);

  const [tl, tr, br, bl] = radii.map(
    (radius) => radius * scale,
  ) as CornerRadii;

  return `${tl}px ${tr}px ${br}px ${bl}px`;
});

const warpMatrix = computed(() => {
  if (!previewModel.value || effectiveCorners.value.length !== 4) return "none";

  return getPerspectiveTransform(
    scaledScreenSource.value.width,
    scaledScreenSource.value.height,
    effectiveCorners.value,
  );
});

const guidePolygonPoints = computed(() => {
  return effectiveCorners.value.map((p) => `${p.x},${p.y}`).join(" ");
});

const cornerCoordinates = computed<Point[]>(() => {
  if (effectiveCorners.value.length !== 4) return [];

  const scaleX = protoSize.value.naturalWidth / protoSize.value.renderWidth;
  const scaleY = protoSize.value.naturalHeight / protoSize.value.renderHeight;

  return effectiveCorners.value.map((p) => ({
    x: Math.round(p.x * scaleX),
    y: Math.round(p.y * scaleY),
  }));
});

const editableCornersAsConfig = computed(() =>
  JSON.stringify(cornerCoordinates.value, null, 2),
);

const saveEditableCorners = () => {
  const scaleX = protoSize.value.naturalWidth / protoSize.value.renderWidth;
  const scaleY = protoSize.value.naturalHeight / protoSize.value.renderHeight;

  saveProgress({
    corners: editableCorners.value.map((p) => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    })),
  });
};

const setCornerCoordinate = (
  index: number,
  axis: "x" | "y",
  input: string,
) => {
  if (!cornerEditMode.value || debugUnavailable.value) return;
  if (input.trim() === "") return;

  const value = Number(input);
  const point = editableCorners.value[index];
  if (!point || !Number.isFinite(value)) return;

  const { naturalWidth, naturalHeight, renderWidth, renderHeight } =
    protoSize.value;
  const sourceSize = axis === "x" ? naturalWidth : naturalHeight;
  const renderSize = axis === "x" ? renderWidth : renderHeight;

  point[axis] =
    (Math.min(Math.max(Math.round(value), 0), sourceSize) * renderSize) /
    sourceSize;

  saveEditableCorners();
};

const numberStepDirections = [-1, 1] as const;
// Chromium SpinButtonElement 使用 ScrollbarTheme 默认时序：250ms / 50ms。
const numberStepTiming = { delay: 250, interval: 50 };
let numberStepDelay: number | undefined;
let numberStepRepeat: number | undefined;
let numberStepPress: {
  button: HTMLButtonElement;
  input: HTMLInputElement;
  pointerId: number;
  initialValue: string;
} | null = null;

const stopNumberStep = () => {
  window.clearTimeout(numberStepDelay);
  window.clearInterval(numberStepRepeat);
  numberStepDelay = numberStepRepeat = undefined;
  const press = numberStepPress;
  numberStepPress = null;
  if (!press) return;
  if (press.button.hasPointerCapture(press.pointerId)) {
    press.button.releasePointerCapture(press.pointerId);
  }
  if (press.input.value !== press.initialValue) {
    press.input.dispatchEvent(new Event("change", { bubbles: true }));
  }
};

const stepNumberInput = (button: HTMLButtonElement, direction: -1 | 1) => {
  const input = button.parentElement?.querySelector("input");
  if (!button.isConnected || !input || input.matches(":disabled") || input.readOnly || debugUnavailable.value) {
    return false;
  }
  const previous = input.value;
  if (direction > 0) input.stepUp();
  else input.stepDown();
  if (input.value !== previous) {
    input.dispatchEvent(new Event("input", { bubbles: true }));
    if (!numberStepPress) input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  return true;
};

const startNumberStep = (direction: -1 | 1, event: PointerEvent) => {
  if (!event.isPrimary || event.button !== 0 || debugUnavailable.value) return;
  event.preventDefault();
  stopNumberStep();
  const button = event.currentTarget as HTMLButtonElement;
  const input = button.parentElement?.querySelector("input");
  if (!input || input.matches(":disabled") || input.readOnly) return;
  input.focus({ preventScroll: true });
  input.select();
  numberStepPress = { button, input, pointerId: event.pointerId, initialValue: input.value };
  button.setPointerCapture(event.pointerId);
  const step = () => {
    if (!stepNumberInput(button, direction)) stopNumberStep();
  };
  numberStepDelay = window.setTimeout(() => {
    numberStepRepeat = window.setInterval(step, numberStepTiming.interval);
    step();
  }, numberStepTiming.delay);
  step();
};

const handleNumberStepMove = (event: PointerEvent) => {
  const press = numberStepPress;
  if (!press || press.pointerId !== event.pointerId) return;
  const rect = press.button.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
    stopNumberStep();
  }
};

watch([showCornerRadiusSettings, cornerEditMode, debugUnavailable, currentModel], stopNumberStep, { flush: "sync" });

const toggleCornerEdit = (enabled: boolean) => {
  if (debugUnavailable.value) return;

  cornerEditMode.value = enabled;
  draggingCornerIndex.value = null;
  syncEditableCorners();
};

const resetEditableCorners = () => {
  if (debugUnavailable.value) return;

  const saved = templateProgress.get(progressKey.value);
  if (saved) delete saved.corners;
  draggingCornerIndex.value = null;
  syncEditableCorners();
};

const copyCornerConfig = async () => {
  if (debugUnavailable.value) return;

  try {
    await navigator.clipboard.writeText(editableCornersAsConfig.value);
  } catch (err) {
    console.error("复制角点配置失败", err);
  }
};

const handleCornerPointerDown = (index: number, event: PointerEvent) => {
  if (!cornerEditMode.value || debugUnavailable.value || cornerDrag) return;
  if (!event.isPrimary || event.button !== 0) return;

  const image = protoImageRef.value;
  const point = editableCorners.value[index];
  if (!image || !point) return;

  event.preventDefault();

  const rect = image.getBoundingClientRect();
  cornerDrag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - rect.left - point.x,
    offsetY: event.clientY - rect.top - point.y,
  };

  draggingCornerIndex.value = index;
  (event.currentTarget as HTMLButtonElement).setPointerCapture(event.pointerId);
};

const handlePointerMove = (event: PointerEvent) => {
  const index = draggingCornerIndex.value;
  if (!cornerEditMode.value || debugUnavailable.value || index === null) return;
  if (!cornerDrag || event.pointerId !== cornerDrag.pointerId) return;

  const image = protoImageRef.value;
  if (!image) return;

  const rect = image.getBoundingClientRect();
  editableCorners.value[index] = {
    x: Math.min(
      Math.max(event.clientX - rect.left - cornerDrag.offsetX, 0),
      rect.width,
    ),
    y: Math.min(
      Math.max(event.clientY - rect.top - cornerDrag.offsetY, 0),
      rect.height,
    ),
  };

  saveEditableCorners();
};

const handlePointerUp = (event: PointerEvent) => {
  if (!cornerDrag || event.pointerId !== cornerDrag.pointerId) return;

  cornerDrag = null;
  draggingCornerIndex.value = null;
};

const formatExportTime = (date = new Date()) =>
  [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ]
    .map((value) => String(value).padStart(2, "0"))
    .join("");

const exportImage = async () => {
  const model = previewModel.value;

  if (
    !previewRef.value ||
    !model ||
    previewLoading.value ||
    previewLoadError.value
  ) return;

  const filename =
    `${model.deviceName}_${model.name}_${formatExportTime()}.png`;

  try {
    const dataUrl = await toPng(previewRef.value, {
      quality: 0.95,
      pixelRatio: 2,
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("导出图片失败:", error);
  }
};

const loadPreviewModel = (model: typeof currentModel.value) => {
  if (model) void loadTemplateImage(model);
};

watch(currentModel, loadPreviewModel, { immediate: true });

watch(
  [currentModel, () => previewImage.value?.url],
  async ([model, url]) => {
    const loadId = ++previewLoadId;
    previewReady.value = false;

    if (!model) {
      previewModel.value = null;
      return;
    }
    if (!url) return;

    const size = templateImageSizes.value[model.imagePath];
    if (!size) return;

    previewModel.value = {
      ...model,
      imagePath: url,
      imageWidth: size.width,
      imageHeight: size.height,
    };

    try {
      await nextTick();
      if (loadId !== previewLoadId) return;

      const image = protoImageRef.value;
      if (!image) return;
      if (!image.complete || !image.naturalWidth) await image.decode();

      if (loadId !== previewLoadId) return;
      updateProtoSize();
      await nextTick();
      if (loadId === previewLoadId) previewReady.value = true;
    } catch {
      if (loadId !== previewLoadId) return;
      const state = templateImages.value[model.imagePath];
      if (state) state.error = true;
    }
  },
  { immediate: true },
);

onMounted(() => {
  window.addEventListener("blur", stopNumberStep);
  document.addEventListener("visibilitychange", stopNumberStep);
  window.addEventListener("resize", updateProtoSize);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerUp);
});

onBeforeUnmount(() => {
  stopNumberStep();
  window.removeEventListener("blur", stopNumberStep);
  document.removeEventListener("visibilitychange", stopNumberStep);
  ++previewLoadId;
  imageRequests.forEach(controller => controller.abort());
  imageUrls.forEach(releaseImage);
  window.removeEventListener("resize", updateProtoSize);
  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerup", handlePointerUp);
  window.removeEventListener("pointercancel", handlePointerUp);
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
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span class="sr-only">GitHub 仓库</span>
        </a>
      </div>

      <div class="flex flex-col lg:flex-row gap-4">
        <div class="w-full min-w-0 lg:flex-1">
          <Card>
            <CardHeader>
              <CardTitle>配置选项</CardTitle>
              <CardDescription>选择设备型号并上传截图</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium">屏幕类型</label>
                <Select v-model="selectedScreenType">
                  <SelectTrigger>
                    <SelectValue placeholder="选择屏幕类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="type in screenTypes" :key="type" :value="type">
                      {{ type === "跑道形" ? "跑道型" : type }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium">设备名称</label>
                <Select :key="selectedScreenType" v-model="selectedModel">
                  <SelectTrigger :disabled="!deviceList.length">
                    <SelectValue placeholder="选择设备名称" />
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

              <div v-if="currentTemplates.length" class="flex flex-col gap-2">
                <label class="text-sm font-medium">模板</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="template in currentTemplates"
                    :key="template.id"
                    type="button"
                    :aria-pressed="selectedTemplate === template.id"
                    class="w-28 shrink-0 rounded-lg border-2 p-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
                    :class="selectedTemplate === template.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400'"
                    @click="selectedTemplate = template.id; loadTemplateImage(template)"
                  >
                    <div
                      class="relative mx-auto overflow-hidden"
                      :style="{
                        width: templatePreviewSize.width + 'px',
                        height: templatePreviewSize.height + 'px',
                      }"
                    >
                      <img
                        v-if="templateImages[template.imagePath]?.url"
                        :src="templateImages[template.imagePath]?.url"
                                            :alt="template.name"
                        class="block h-full w-full object-contain"
                      />
                      <div
                        v-if="templateImages[template.imagePath]?.url"
                        aria-hidden="true"
                        class="pointer-events-none absolute bg-black"
                        :style="getTemplateMaskStyle(template)"
                      ></div>
                      <ImageLoading
                        v-else
                        class="absolute inset-0 justify-center"
                        :progress="templateImages[template.imagePath]?.progress ?? null"
                        :error="templateImages[template.imagePath]?.error ?? false"
                      />
                    </div>
                    <span class="flex h-6 items-center justify-center">
                      <span class="truncate">{{ template.name }}</span>
                    </span>
                  </button>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium">屏幕截图</label>
                <Input
                  id="screenshot-upload"
                  type="file"
                  accept="image/*"
                  @change="handleFileUpload"
                />
                <p class="text-xs text-gray-500">
                  支持 JPG、PNG、WEBP、SVG 等格式图片
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

              <fieldset
                v-if="currentModel"
                :disabled="debugUnavailable"
                class="m-0 min-w-0 space-y-6 border-0 p-0"
              >
              <div class="space-y-3">
                <div class="flex items-center justify-between gap-3">
                  <div class="space-y-0.5">
                    <label for="corner-radius-settings" class="text-sm font-medium">
                      圆角设置
                    </label>
                    <p class="text-xs text-gray-500">
                      {{ debugHint || "手动调整屏幕四个角的圆角大小" }}
                    </p>
                  </div>
                  <Switch
                    id="corner-radius-settings"
                    :disabled="debugUnavailable"
                    v-model="showCornerRadiusSettings"
                  />
                </div>

                <div v-if="showCornerRadiusSettings" class="space-y-2">
                  <Button variant="outline" size="sm" @click="resetEditableCornerRadii">
                    重置圆角
                  </Button>
                  <div class="grid grid-cols-2 gap-2">
                    <div
                      v-for="(label, index) in ['TL', 'TR', 'BR', 'BL']"
                      :key="label"
                      class="flex flex-col gap-2"
                    >
                      <label :for="'radius-' + label" class="text-xs text-gray-500">
                        {{ label }}
                      </label>
                      <div class="number-stepper relative min-w-0">
                        <Input
                          :id="'radius-' + label"
                          class="number-stepper-input"
                          type="number"
                          min="0"
                          step="1"
                          :model-value="String(editableCornerRadii[index])"
                          @update:model-value="
                            (v) => setCornerRadius(index, String(v ?? '0'))
                          "
                        />
                        <button
                          v-for="direction in numberStepDirections"
                          :key="direction"
                          type="button"
                          tabindex="-1"
                          class="number-stepper-button"
                          :class="direction < 0 ? 'number-stepper-minus' : 'number-stepper-plus'"
                          :aria-label="`${label} 圆角${direction < 0 ? '减' : '加'} 1`"
                          :disabled="direction < 0 && editableCornerRadii[index] <= 0"
                          @pointerdown="(event) => startNumberStep(direction, event)"
                          @pointermove="handleNumberStepMove"
                          @pointerup="stopNumberStep"
                          @pointercancel="stopNumberStep"
                          @lostpointercapture="stopNumberStep"
                          @contextmenu.prevent
                          @click="(event) => event.detail === 0 && stepNumberInput(event.currentTarget as HTMLButtonElement, direction)"
                        >{{ direction < 0 ? '−' : '+' }}</button>
                      </div>
                    </div>
                  </div>

                  <p class="text-xs text-gray-500">
                    配置格式示例：`borderRadius: [{{ editableCornerRadii.join(", ") }}]`
                  </p>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex items-center justify-between gap-3">
                  <div class="space-y-0.5">
                    <label for="corner-debug" class="text-sm font-medium">
                      角点调试
                    </label>
                    <p class="text-xs text-gray-500">
                      {{ debugHint || "拖动预览中的4个控制点，复制后粘贴到模板 screenCorners" }}
                    </p>
                  </div>
                  <Switch
                    id="corner-debug"
                    :disabled="debugUnavailable"
                    :model-value="cornerEditMode"
                    @update:model-value="toggleCornerEdit"
                  />
                </div>

                <div v-if="cornerEditMode" class="space-y-3">
                  <div class="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" @click="resetEditableCorners">
                      重置角点
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      @click="showCornerGuide = !showCornerGuide"
                    >
                      {{ showCornerGuide ? "隐藏蚂蚁线" : "显示蚂蚁线" }}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      :aria-expanded="showCornerDetails"
                      @click="showCornerDetails = !showCornerDetails"
                    >
                      {{ showCornerDetails ? "隐藏详细配置" : "显示详细配置" }}
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

                  <div class="grid grid-cols-2 gap-2">
                    <div
                      v-for="(corner, index) in cornerCoordinates"
                      :key="index"
                      class="min-w-0 space-y-2 rounded-lg border bg-gray-50 p-2"
                    >
                      <div class="text-xs font-medium text-gray-600">
                        {{ cornerLabels[index] }}
                      </div>

                      <div class="grid grid-cols-2 gap-2">
                        <div
                          v-for="axis in cornerAxes"
                          :key="axis"
                          class="number-stepper relative min-w-0"
                        >
                          <Input
                            class="number-stepper-input corner-coordinate-input min-w-0"
                            type="number"
                            min="0"
                            step="1"
                            :max="axis === 'x' ? protoSize.naturalWidth : protoSize.naturalHeight"
                            :model-value="corner[axis]"
                            :aria-label="`${cornerLabels[index]} ${axis.toUpperCase()} 坐标`"
                            @update:model-value="
                              (value) => setCornerCoordinate(index, axis, String(value ?? ''))
                            "
                          />
                          <button
                            v-for="direction in numberStepDirections"
                            :key="direction"
                            type="button"
                            tabindex="-1"
                            class="number-stepper-button"
                            :class="direction < 0 ? 'number-stepper-minus' : 'number-stepper-plus'"
                            :aria-label="`${cornerLabels[index]} ${axis.toUpperCase()} 坐标${direction < 0 ? '减' : '加'} 1`"
                            :disabled="direction < 0 ? corner[axis] <= 0 : corner[axis] >= (axis === 'x' ? protoSize.naturalWidth : protoSize.naturalHeight)"
                            @pointerdown="(event) => startNumberStep(direction, event)"
                            @pointermove="handleNumberStepMove"
                            @pointerup="stopNumberStep"
                            @pointercancel="stopNumberStep"
                            @lostpointercapture="stopNumberStep"
                            @contextmenu.prevent
                            @click="(event) => event.detail === 0 && stepNumberInput(event.currentTarget as HTMLButtonElement, direction)"
                          >{{ direction < 0 ? '−' : '+' }}</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <pre
                    v-if="showCornerDetails"
                    class="max-h-40 overflow-auto rounded-md bg-gray-100 p-2 text-xs"
                  >{{ editableCornersAsConfig }}</pre>
                </div>
              </div>
              </fieldset>

              <div v-if="screenshotUrl" class="space-y-2">
                <Button
                  @click="exportImage"
                  class="w-full"
                  :disabled="previewLoading || !!previewLoadError || !previewModel"
                >
                  导出 {{ previewModel?.deviceName || "设备" }} 图片
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div class="w-full min-w-0 lg:w-md lg:shrink-0">
          <Card class="w-full">
              <CardHeader>
                <CardTitle>预览</CardTitle>
                <CardDescription
                  >{{
                    previewModel?.deviceName || "设备"
                  }}
                  效果预览</CardDescription
                >
              </CardHeader>
              <CardContent>
                <div
                  ref="previewRef"
                  class="relative w-full"
                  :class="{ 'min-h-64': !previewModel }"
                >
                  <img
                    v-if="currentProtoImage"
                    ref="protoImageRef"
                    :key="currentProtoImage"
                    :src="currentProtoImage"
                    :width="previewModel?.imageWidth"
                    :height="previewModel?.imageHeight"
                    :alt="(previewModel?.deviceName || '设备') + ' 样机'"
                    class="block w-full h-auto"
                    @load="updateProtoSize"
                  />
                  

                  <div class="absolute inset-0" v-if="previewModel">
                    <div class="absolute inset-0 overflow-hidden">
                      <div
                        class="absolute left-0 top-0 overflow-hidden"
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
                          :alt="previewModel.deviceName + ' 截图'"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        v-else
                        class="bg-white w-full h-full flex items-center justify-center absolute inset-0 z-10"
                      >
                        <div class="text-center text-gray-400">
                          <img
                            src="/logo.svg"
                            alt="logo"
                            class="w-8 h-8 mx-auto mb-1"
                          />
                        </div>
                      </div>

                      <div
                        v-if="showScreenReflection"
                        class="absolute inset-0 pointer-events-none z-20"
                        :style="{
                          borderRadius: scaledBorderRadius,
                          background: previewModel.highlightGradient,
                        }"
                      ></div>
                    </div>
                  </div>

                    <svg
                      v-if="cornerEditMode && showCornerGuide && effectiveCorners.length === 4"
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
                      :aria-label="`${cornerLabels[index]} 角点`"
                      :disabled="debugUnavailable"
                      class="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 touch-none select-none items-center justify-center border-0 bg-transparent p-0 cursor-move"
                      :style="{
                        left: corner.x + 'px',
                        top: corner.y + 'px',
                      }"
                      @pointerdown="(e) => handleCornerPointerDown(index, e)"
                      @lostpointercapture="handlePointerUp"
                    >
                      <span
                        class="pointer-events-none h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow"
                      ></span>
                    </button>
                  </div>
                  <div
                    v-if="previewLoading || previewLoadError"
                    class="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-white"
                  >
                    <button
                      type="button"
                      class="border-0 bg-transparent p-0 enabled:cursor-pointer"
                      :disabled="!previewLoadError"
                      aria-label="重新加载当前模板"
                      @click="loadPreviewModel(currentModel)"
                    >
                      <ImageLoading
                        :key="currentModel?.imagePath"
                        :progress="previewProgress"
                        :error="!!previewLoadError"
                      />
                    </button>
                  </div>
                </div>

                <div class="mt-4 text-center" v-if="previewModel">
                  <p class="text-sm text-gray-600">
                    源截图 {{ previewModel.screenSource.width }} ×
                    {{ previewModel.screenSource.height }} 像素
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
:deep(.number-stepper-input::-webkit-inner-spin-button) {
  opacity: 1;
}

.number-stepper-button {
  display: none;
}

@media (pointer: coarse) {
  :deep(.number-stepper-input) {
    appearance: textfield;
    padding-inline: 24%;
    text-align: center;
    font-size: 0.75rem;
  }

  :deep(.number-stepper-input::-webkit-inner-spin-button),
  :deep(.number-stepper-input::-webkit-outer-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }

  .number-stepper-button {
    position: absolute;
    top: 1px;
    bottom: 1px;
    display: flex;
    width: 22%;
    max-width: 1.75rem;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 0.25rem;
    background: transparent;
    padding: 0;
    font-size: 0.875rem;
    touch-action: none;
    user-select: none;
    -webkit-touch-callout: none;
  }

  .number-stepper-minus { left: 2px; }
  .number-stepper-plus { right: 2px; }
  .number-stepper-button:active { background: rgb(0 0 0 / 5%); }
  .number-stepper-button:disabled { opacity: 0.35; }
}
</style>