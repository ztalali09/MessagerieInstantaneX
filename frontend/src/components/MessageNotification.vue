<template>
  <Transition name="notification">
    <div
      v-if="notification"
      @click="handleClick"
      class="fixed top-16 left-1/2 transform -translate-x-1/2 z-[100] min-w-[300px] max-w-[90%] md:max-w-[500px] cursor-pointer"
    >
      <div class="bg-black/95 border-2 border-green-500 backdrop-blur-xl matrix-box-glow-strong p-3 md:p-4 font-mono">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-black border-2 border-green-500 text-sm font-bold text-green-500 matrix-glow-subtle">
            {{ notification.fromUsername.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-bold text-green-500 truncate">
              {{ notification.fromUsername }}
            </div>
            <div class="text-xs text-green-700 mt-1 line-clamp-2">
              <template v-if="notification.messageType === 'text'">
                {{ notification.message }}
              </template>
              <template v-else-if="notification.messageType === 'image'">
                [IMAGE]
              </template>
              <template v-else-if="notification.messageType === 'video'">
                [VIDEO]
              </template>
              <template v-else-if="notification.messageType === 'audio'">
                [AUDIO]
              </template>
              <template v-else>
                [MESSAGE]
              </template>
            </div>
          </div>
          <button
            @click.stop="handleClose"
            class="flex-shrink-0 text-green-500 hover:text-green-400 text-lg font-bold transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMessageNotifications } from '../composables/useMessageNotifications';

interface Props {
  notification: {
    id: number;
    fromUserId: string;
    fromUsername: string;
    message: string;
    messageType: string;
    timestamp: string;
  } | null;
}

const props = defineProps<Props>();
const emit = defineEmits(['click', 'close']);

const router = useRouter();
const { hideNotification } = useMessageNotifications();

const handleClick = () => {
  if (props.notification) {
    emit('click', props.notification.fromUserId);
    hideNotification();
    // Naviguer vers le chat et sélectionner l'utilisateur
    router.push('/chat');
  }
};

const handleClose = () => {
  hideNotification();
  emit('close');
};
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translate(-50%, -100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translate(-50%, -100%);
  opacity: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

