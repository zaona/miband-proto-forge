<script setup lang="ts">
withDefaults(defineProps<{
  progress?: number | null;
  error?: boolean;
}>(), {
  progress: null,
  error: false,
});
</script>

<template>
  <span
    class="flex flex-col items-center gap-2"
    :class="error ? 'text-red-500' : 'text-blue-500'"
    role="status"
  >
    <svg viewBox="0 0 48 48" class="h-10 w-10" fill="none" aria-hidden="true">
      <circle
        cx="24" cy="24" r="19"
        stroke="currentColor" stroke-width="3" opacity=".2"
      />

      <g class="loading-orbit" :class="{ 'is-error': error }">
        <circle
          v-if="progress === null || progress === 0"
          cx="43" cy="24" r="1.5"
          fill="currentColor"
        />

        <circle
          v-else
          class="loading-progress"
          cx="24" cy="24" r="19"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          pathLength="100"
          :stroke-dasharray="`${progress} 100`"
        />
      </g>

      <path
        v-if="error"
        d="M34.4 30A12 12 0 1 1 34.4 18M28.4 18H34.4V12"
        transform="translate(24 24) scale(0.8) translate(-24 -24)"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <text
        v-if="progress !== null && !error"
        x="24" y="24"
        text-anchor="middle"
        dominant-baseline="central"
        fill="currentColor"
        font-size="10"
      >{{ Math.floor(progress) }}%</text>
    </svg>

    <span class="text-xs">
      {{ error ? "加载失败" : "加载中..." }}
    </span>
  </span>
</template>

<style scoped>
.loading-orbit {
  transform-box: view-box;
  transform-origin: center;
  animation: loading-rotate 1s linear infinite;
}

.loading-orbit.is-error {
  visibility: hidden;
  animation-play-state: paused;
}

.loading-progress {
  transition: stroke-dasharray .12s linear;
}

@keyframes loading-rotate {
  from { transform: rotate(-90deg); }
  to { transform: rotate(270deg); }
}
</style>