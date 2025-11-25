<template>
  <div class="flex items-center gap-3 bg-black/50 border border-green-500/50 px-3 py-2.5 min-w-[250px] max-w-[350px]">
    <button 
      @click="togglePlay" 
      class="flex-shrink-0 p-1 text-green-500 hover:text-green-400 transition-colors"
    >
      <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
      </svg>
    </button>

    <div class="flex-1 flex flex-col gap-1.5">
      <div class="flex items-center gap-2 relative py-1">
        <input 
          type="range" 
          v-model="currentTimePercent"
          @input="seek"
          min="0" 
          max="100" 
          class="flex-1 matrix-range"
        />
      </div>
      <div class="flex justify-between text-[10px] text-green-700 font-mono leading-none">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>

    <audio 
      ref="audioElement" 
      :src="src"
      @timeupdate="updateTime"
      @loadedmetadata="loadMetadata"
      @ended="onEnded"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

interface Props {
  src: string;
}

const props = defineProps<Props>();

const audioElement = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);

const currentTimePercent = computed({
  get: () => duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0,
  set: (value: number) => {
    if (audioElement.value && duration.value > 0) {
      audioElement.value.currentTime = (value / 100) * duration.value;
    }
  }
});

function togglePlay() {
  if (!audioElement.value) return;
  
  if (isPlaying.value) {
    audioElement.value.pause();
  } else {
    audioElement.value.play();
  }
  isPlaying.value = !isPlaying.value;
}

function seek(event: Event) {
  const target = event.target as HTMLInputElement;
  if (audioElement.value && duration.value > 0) {
    audioElement.value.currentTime = (parseFloat(target.value) / 100) * duration.value;
  }
}

function updateTime() {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime;
  }
}

function loadMetadata() {
  if (audioElement.value) {
    duration.value = audioElement.value.duration;
  }
}

function onEnded() {
  isPlaying.value = false;
  currentTime.value = 0;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause();
  }
});
</script>

<style scoped>
.matrix-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: transparent;
  outline: none;
  cursor: pointer;
  position: relative;
}

.matrix-range::-webkit-slider-track {
  width: 100%;
  height: 4px;
  background: rgba(0, 255, 65, 0.2);
  border-radius: 2px;
}

.matrix-range::-moz-range-track {
  width: 100%;
  height: 4px;
  background: rgba(0, 255, 65, 0.2);
  border-radius: 2px;
}

.matrix-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #00ff41;
  cursor: pointer;
  box-shadow: 0 0 6px #00ff41;
  margin-top: -5px;
  position: relative;
  z-index: 2;
}

.matrix-range::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #00ff41;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 6px #00ff41;
  position: relative;
  z-index: 2;
}

.matrix-range::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  background: rgba(0, 255, 65, 0.2);
  border-radius: 2px;
}
</style>

