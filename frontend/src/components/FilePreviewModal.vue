<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-sm" @click="close">
        <div class="relative max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] bg-black border-2 border-green-500 matrix-box-glow-strong overflow-hidden" @click.stop>
          <div class="flex items-center justify-between p-3 md:p-4 border-b border-green-500/30">
            <div class="font-mono text-green-500 font-bold text-sm md:text-base uppercase">&gt; [FILE_PREVIEW]</div>
            <button @click="close" class="text-green-500 active:text-green-400 md:hover:text-green-400 text-2xl md:text-xl px-2 py-1">&times;</button>
          </div>

          <div class="p-3 md:p-6 overflow-auto max-h-[calc(95vh-160px)] md:max-h-[calc(90vh-140px)]">
            <div v-if="fileType === 'image'" class="flex flex-col items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 md:h-16 md:w-16 text-green-500 matrix-glow-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <img :src="preview" alt="Preview" class="max-w-full max-h-[50vh] md:max-h-[60vh] border border-green-500" />
            </div>
            <div v-else-if="fileType === 'video'" class="flex flex-col items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 md:h-16 md:w-16 text-green-500 matrix-glow-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <video :src="preview" controls class="max-w-full max-h-[50vh] md:max-h-[60vh] border border-green-500"></video>
            </div>
            <div v-else-if="fileType === 'audio'" class="flex flex-col items-center justify-center gap-6 min-h-[150px] md:min-h-[200px]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 md:h-20 md:w-20 text-green-500 matrix-glow-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <div class="w-full max-w-md flex justify-center">
                <AudioPlayer :src="preview" />
              </div>
            </div>
            
            <div class="mt-3 md:mt-4 font-mono text-xs md:text-sm text-green-700 space-y-1">
              <div class="truncate">[NAME]: {{ fileName }}</div>
              <div>[SIZE]: {{ fileSize }}</div>
              <div class="truncate">[TYPE]: {{ file?.type || 'unknown' }}</div>
            </div>
          </div>

          <div class="flex gap-2 p-3 md:p-4 border-t border-green-500/30">
            <button @click="emit('send')" class="matrix-btn flex-1 py-3 md:py-2 px-4 font-bold text-sm md:text-base">[SEND]</button>
            <button @click="close" class="flex-1 py-3 md:py-2 px-4 font-bold font-mono border-2 border-red-500 text-red-500 active:bg-red-500/20 md:hover:bg-red-500/10 transition-all text-sm md:text-base">[CANCEL]</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import AudioPlayer from './AudioPlayer.vue';

interface Props {
  file: File | null;
  visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'send']);

const preview = ref<string>('');
const fileType = computed(() => {
  if (!props.file) return '';
  if (props.file.type.startsWith('image/')) return 'image';
  if (props.file.type.startsWith('video/')) return 'video';
  if (props.file.type.startsWith('audio/')) return 'audio';
  return 'unknown';
});

const fileName = computed(() => props.file?.name || '');
const fileSize = computed(() => {
  if (!props.file) return '';
  const size = props.file.size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
});

const close = () => {
  emit('close');
};

watch(() => props.file, (newFile) => {
  if (newFile && props.visible) {
    preview.value = URL.createObjectURL(newFile);
  }
  return () => {
    if (preview.value) {
      URL.revokeObjectURL(preview.value);
    }
  };
});
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>

