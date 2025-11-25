<template>
  <div class="flex h-[calc(100vh-3.5rem)] flex-col md:flex-row overflow-hidden relative z-10"
       @drop.prevent="handleDrop"
       @dragover.prevent="isDragging = true"
       @dragleave.prevent="isDragging = false">
    
    <div v-if="isDragging" class="absolute inset-0 z-50 bg-green-500/10 border-4 border-green-500 border-dashed flex items-center justify-center backdrop-blur-sm">
      <div class="text-center px-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 md:h-20 md:w-20 mx-auto mb-3 md:mb-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div class="text-lg md:text-2xl font-bold text-green-500 matrix-glow">[DROP_FILES_HERE]</div>
      </div>
    </div>

    <div v-if="!isOnline" class="absolute top-0 left-0 right-0 z-40 bg-red-500/90 text-white text-center py-2 font-mono text-sm">
      [CONNECTION_LOST] Reconnecting...
    </div>

    <div class="flex w-full flex-row border-b border-green-500/30 bg-black/90 backdrop-blur-xl md:w-80 md:flex-col md:border-r md:border-b-0 matrix-box-glow">
      <div class="hidden p-4 md:block space-y-3">
        <h2 class="px-2 text-xs font-bold uppercase tracking-widest text-green-500 matrix-glow-subtle matrix-glitch">&gt; DIRECT_MESSAGES</h2>
        <SearchBar placeholder="> SEARCH_USER..." @search="handleSearch" />
      </div>
      
      <div class="flex flex-1 overflow-x-auto px-2 py-2 md:flex-col md:overflow-y-auto md:px-2 md:py-0">
        <div v-if="loading" class="flex justify-center py-4">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-green-500 border-t-transparent matrix-glow-subtle"></div>
        </div>
        
        <div v-if="!loading && filteredUsers.length === 0" class="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div class="text-3xl mb-2">👤</div>
          <p class="text-sm text-green-700 font-mono">[NO_USERS_FOUND]</p>
        </div>
        
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          @click="selectUser(user)"
          class="group relative flex min-w-[80px] cursor-pointer flex-col items-center justify-center gap-1 px-2 py-2 transition-all hover:bg-green-500/10 md:min-w-0 md:flex-row md:justify-start md:gap-3 md:px-3 border border-transparent hover:border-green-500/30 hover-matrix-glow"
          :class="{ 'bg-green-500/20 border-green-500 matrix-box-glow': selectedUser && selectedUser.id === user.id }"
        >
          <div class="relative">
            <div class="flex h-10 w-10 items-center justify-center bg-black border-2 border-green-500 text-sm font-bold text-green-500 shadow-lg md:h-9 md:w-9 matrix-glow-subtle">
              {{ user.username.charAt(0).toUpperCase() }}
            </div>
            <span
              v-if="onlineUsers.includes(user.id.toString())"
              class="absolute bottom-0 right-0 h-3 w-3 border-2 border-black bg-green-500 md:h-2.5 md:w-2.5 matrix-glow-subtle"
            ></span>
            <span
              v-if="getUnreadCount(user.id.toString()) > 0"
              class="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full matrix-glow-subtle"
            >
              {{ getUnreadCount(user.id.toString()) }}
            </span>
          </div>
          
          <div class="flex w-full flex-col items-center overflow-hidden md:items-start">
            <h4 class="w-full truncate text-center text-xs font-bold text-green-500 group-hover:text-green-400 md:text-left md:text-sm">
              &gt; {{ user.username }}
            </h4>
            <p class="hidden truncate text-xs text-green-700 group-hover:text-green-600 md:block font-mono">
              {{ onlineUsers.includes(user.id.toString()) ? '[ONLINE]' : '[OFFLINE]' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-1 flex-col bg-black min-h-0">
      <div v-if="selectedUser" class="flex items-center justify-between border-b border-green-500/30 bg-black/90 px-4 py-2 backdrop-blur-xl md:px-6 md:py-3 matrix-box-glow">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center bg-black border-2 border-green-500 text-xs font-bold text-green-500 matrix-glow-subtle">
            {{ selectedUser.username.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-sm font-bold text-green-500 matrix-glow-subtle">&gt; {{ selectedUser.username }}</h2>
            <p class="text-xs text-green-700 font-mono">
              {{ onlineUsers.includes(selectedUser.id.toString()) ? '[ACTIVE_NOW]' : '[OFFLINE]' }}
            </p>
          </div>
        </div>
        <button @click="showShortcuts = !showShortcuts" class="text-green-500 hover:text-green-400 text-xs font-mono">
          [?]
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 md:p-6 messages-container min-h-0" ref="messagesContainer">
        <div v-if="!selectedUser" class="flex h-full flex-col items-center justify-center text-center matrix-fade-in space-y-4">
          <div class="flex h-16 w-16 items-center justify-center border-2 border-green-500 bg-black text-3xl matrix-box-glow">🟢</div>
          <h3 class="text-lg font-bold text-green-500 matrix-glow typing-cursor">THE_X_MESSENGER</h3>
          <p class="text-sm text-green-700 font-mono">&gt; SELECT_CONVERSATION_TO_START</p>
          <div class="text-xs text-green-800 font-mono space-y-1">
            <p>[TIP]: Press Ctrl+K to search</p>
            <p>[TIP]: Drag & drop files to send</p>
          </div>
        </div>

        <div v-else class="space-y-4 md:space-y-6">
          <div
            v-for="msg in conversationMessages"
            :key="msg.id || (msg.timestamp + msg.message)"
            class="flex flex-col matrix-fade-in"
            :class="msg.from_user_id == currentUserId ? 'items-end' : 'items-start'"
          >
            <div
              class="max-w-[85%] md:max-w-[70%] px-4 py-2 text-sm font-mono"
              :class="msg.from_user_id == currentUserId 
                ? 'matrix-message-sent text-green-500' 
                : 'matrix-message-received text-green-400'"
            >
              <template v-if="msg.messageType === 'image'">
                 <div v-if="msg.decryptedImage" class="relative group cursor-pointer">
                    <img :src="msg.decryptedImage" alt="Encrypted Image" class="max-w-full rounded-lg" @click="openImage(msg.decryptedImage)" />
                 </div>
                 <div v-else class="flex items-center gap-2 text-xs font-mono opacity-70">
                   <div class="h-4 w-4 animate-spin border-2 border-green-500 border-t-transparent matrix-glow-subtle"></div>
                   [DECRYPTING_IMAGE...]
                 </div>
              </template>
              <template v-else-if="msg.messageType === 'video'">
                 <div v-if="msg.decryptedVideo" class="relative group">
                    <video :src="msg.decryptedVideo" controls class="max-w-full border border-green-500"></video>
                 </div>
                 <div v-else class="flex items-center gap-2 text-xs font-mono opacity-70">
                   <div class="h-4 w-4 animate-spin border-2 border-green-500 border-t-transparent matrix-glow-subtle"></div>
                   [DECRYPTING_VIDEO...]
                 </div>
              </template>
              <template v-else-if="msg.messageType === 'audio'">
                 <div v-if="msg.decryptedAudio" class="relative group">
                    <audio :src="msg.decryptedAudio" controls class="w-full min-w-[200px]"></audio>
                 </div>
                 <div v-else class="flex items-center gap-2 text-xs font-mono opacity-70">
                   <div class="h-4 w-4 animate-spin border-2 border-green-500 border-t-transparent matrix-glow-subtle"></div>
                   [DECRYPTING_AUDIO...]
                 </div>
              </template>
              <template v-else>
                &gt; {{ msg.message }}
              </template>
            </div>
            <span class="mt-1 text-[10px] text-green-800 font-mono">
              [{{ formatTimestamp(msg.timestamp) }}]
            </span>
          </div>

          <div v-if="isUserTyping" class="flex items-center gap-2 matrix-fade-in">
            <div class="flex h-8 w-8 items-center justify-center bg-black border-2 border-green-500 text-xs font-bold text-green-500 matrix-glow-subtle">
              {{ selectedUser.username.charAt(0).toUpperCase() }}
            </div>
            <div class="flex items-center gap-1 bg-green-500/10 border border-green-500 px-3 py-2 font-mono text-green-500">
              <span class="text-xs">&gt; TYPING</span>
              <div class="h-1.5 w-1.5 animate-bounce bg-green-500 [animation-delay:-0.3s] matrix-glow-subtle"></div>
              <div class="h-1.5 w-1.5 animate-bounce bg-green-500 [animation-delay:-0.15s] matrix-glow-subtle"></div>
              <div class="h-1.5 w-1.5 animate-bounce bg-green-500 matrix-glow-subtle"></div>
            </div>
          </div>
        </div>
      </div>

      <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileSelect" />
      <input type="file" ref="videoInput" accept="video/*" class="hidden" @change="handleVideoSelect" />
      <input type="file" ref="audioInput" accept="audio/*" class="hidden" @change="handleAudioSelect" />
      
      <div v-if="selectedUser" class="border-t border-green-500/30 bg-black/90 p-3 md:p-4 backdrop-blur-xl matrix-box-glow">
        <form @submit.prevent="handleSendMessage" class="relative flex items-center gap-2">
          <div class="relative">
            <div
              v-if="showAttachMenu"
              class="absolute bottom-full left-0 mb-2 flex w-48 flex-col overflow-hidden border-2 border-green-500 bg-black/95 p-1 backdrop-blur-xl shadow-xl matrix-box-glow-strong"
            >
              <button
                type="button"
                @click="triggerFileUpload(); showAttachMenu = false"
                class="flex items-center gap-3 px-3 py-2 text-sm text-green-500 hover:bg-green-500/10 transition-colors text-left font-mono border border-transparent hover:border-green-500"
              >
                <span>[IMAGE]</span>
              </button>
              <button
                type="button"
                @click="triggerVideoUpload(); showAttachMenu = false"
                class="flex items-center gap-3 px-3 py-2 text-sm text-green-500 hover:bg-green-500/10 transition-colors text-left font-mono border border-transparent hover:border-green-500"
              >
                <span>[VIDEO]</span>
              </button>
              <button
                type="button"
                @click="triggerAudioUpload(); showAttachMenu = false"
                class="flex items-center gap-3 px-3 py-2 text-sm text-green-500 hover:bg-green-500/10 transition-colors text-left font-mono border border-transparent hover:border-green-500"
              >
                <span>[AUDIO]</span>
              </button>
            </div>
            
            <button
              type="button"
              @click="showAttachMenu = !showAttachMenu"
              class="flex items-center justify-center p-2 text-green-500 hover:bg-green-500/10 transition-colors border border-green-500"
              :class="{ 'text-green-400 bg-green-500/20 matrix-box-glow': showAttachMenu }"
              title="Attach file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            @click="isRecording ? stopRecording() : startRecording()"
            class="flex items-center justify-center p-2 transition-colors border border-green-500"
            :class="isRecording ? 'text-red-500 hover:bg-red-500/10 animate-pulse border-red-500' : 'text-green-500 hover:bg-green-500/10 hover:text-green-400'"
            :title="isRecording ? 'Stop Recording' : 'Record Audio'"
          >
            <svg v-if="!isRecording" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
          <textarea
            v-model="messageText"
            ref="messageInput"
            rows="1"
            placeholder="> TYPE_MESSAGE... (Enter to send, Shift+Enter for new line)"
            class="matrix-input w-full px-4 py-2.5 pr-12 text-sm resize-none"
            @keydown.enter.exact.prevent="handleSendMessage"
            @keydown.enter.shift.exact="messageText += '\n'"
            @input="handleInput"
          />
          <button
            type="submit"
            class="absolute right-2 flex items-center justify-center p-2 text-green-500 hover:bg-green-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="!messageText.trim()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>

    <FilePreviewModal
      :file="previewFile"
      :visible="showPreview"
      @close="showPreview = false; previewFile = null"
      @send="confirmFileSend"
    />

    <ProgressBar
      :visible="uploadProgress > 0 && uploadProgress < 100"
      :progress="uploadProgress"
      :title="uploadTitle"
      :message="uploadMessage"
    />

    <Teleport to="body">
      <div v-if="showShortcuts" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" @click="showShortcuts = false">
        <div class="bg-black border-2 border-green-500 p-6 max-w-md matrix-box-glow-strong" @click.stop>
          <h3 class="text-green-500 font-bold text-lg mb-4 font-mono">[KEYBOARD_SHORTCUTS]</h3>
          <div class="space-y-2 text-sm font-mono">
            <div class="flex justify-between"><span class="text-green-700">Enter</span><span class="text-green-500">Send message</span></div>
            <div class="flex justify-between"><span class="text-green-700">Shift+Enter</span><span class="text-green-500">New line</span></div>
            <div class="flex justify-between"><span class="text-green-700">Esc</span><span class="text-green-500">Close menu</span></div>
            <div class="flex justify-between"><span class="text-green-700">Ctrl+K</span><span class="text-green-500">Search</span></div>
          </div>
          <button @click="showShortcuts = false" class="mt-4 matrix-btn w-full py-2">[CLOSE]</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { apiService, type User } from '../services/api';
import { useSocket } from '../services/useSocket';
import { useUserStore } from '../stores/userStore';
import { useToast } from '../composables/useToast';
import { useKeyboard } from '../composables/useKeyboard';
import { useUnreadMessages } from '../composables/useUnreadMessages';
import { useConnectionStatus } from '../composables/useConnectionStatus';
import { AESImage } from '../crypto/AESImage';
import { AESVideo } from '../crypto/AESVideo';
import { AESAudio } from '../crypto/AESAudio';
import { secureStorage } from '../services/secureStorage';
import SearchBar from './SearchBar.vue';
import FilePreviewModal from './FilePreviewModal.vue';
import ProgressBar from './ProgressBar.vue';

const userStore = useUserStore();
const { success, error: showError } = useToast();
const { register } = useKeyboard();
const { getCount: getUnreadCount, markAsRead, increment: incrementUnread } = useUnreadMessages();
const { isOnline } = useConnectionStatus();

const users = ref<User[]>([]);
const loading = ref(false);
const selectedUser = ref<User | null>(null);
const messageText = ref('');
const currentUserId = userStore.currentUser?.id.toString() || '';
const typingTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const videoInput = ref<HTMLInputElement | null>(null);
const audioInput = ref<HTMLInputElement | null>(null);
const messageInput = ref<HTMLTextAreaElement | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);
const showAttachMenu = ref(false);
const isRecording = ref(false);
const mediaRecorder = ref<MediaRecorder | null>(null);
const audioChunks = ref<Blob[]>([]);
const searchQuery = ref('');
const isDragging = ref(false);
const showPreview = ref(false);
const previewFile = ref<File | null>(null);
const pendingFileType = ref<'image' | 'video' | 'audio' | null>(null);
const uploadProgress = ref(0);
const uploadTitle = ref('');
const uploadMessage = ref('');
const showShortcuts = ref(false);

const aesImage = new AESImage();
const aesVideo = new AESVideo();
const aesAudio = new AESAudio();

const { messages, onlineUsers, typingUsers, sendMessage, startTyping, stopTyping, socket } = useSocket();

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(u => u.username.toLowerCase().includes(query));
});

const conversationMessages = computed(() => {
  if (!selectedUser.value) return [];
  const filtered = messages.value.filter(
    m =>
      (m.from_user_id == currentUserId && m.to_user_id == selectedUser.value?.id) ||
      (m.to_user_id == currentUserId && m.from_user_id == selectedUser.value?.id)
  );
  
  filtered.forEach(async (msg) => {
    if (msg.messageType === 'image' && !msg.decryptedImage && msg.encryptedKey) {
        try {
             await decryptImageMessage(msg);
        } catch (e) {
            console.error('Failed to decrypt image', e);
        }
    } else if (msg.messageType === 'video' && !msg.decryptedVideo && msg.encryptedKey) {
        try {
             await decryptVideoMessage(msg);
        } catch (e) {
            console.error('Failed to decrypt video', e);
        }
    } else if (msg.messageType === 'audio' && !msg.decryptedAudio && msg.encryptedKey) {
        try {
             await decryptAudioMessage(msg);
        } catch (e) {
            console.error('Failed to decrypt audio', e);
        }
    }
  });

  return filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
});

const isUserTyping = computed(() => {
  return selectedUser.value && typingUsers.value.includes(selectedUser.value.id.toString());
});

watch(conversationMessages, async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}, { deep: true });

watch(selectedUser, (newUser) => {
  if (newUser) {
    markAsRead(newUser.id.toString());
  }
});

watch(() => messages.value.length, () => {
  const lastMsg = messages.value[messages.value.length - 1];
  if (lastMsg && lastMsg.to_user_id == currentUserId) {
    if (!selectedUser.value || lastMsg.from_user_id != selectedUser.value.id) {
      incrementUnread(lastMsg.from_user_id.toString());
    }
    if (Notification.permission === 'granted') {
      new Notification('New message', { body: 'You have a new message', icon: '/icon.png' });
    }
  }
});

const loadUsers = async () => {
  loading.value = true;
  try {
    users.value = await apiService.getUsers();
    users.value = users.value.filter(user => user.id !== userStore.currentUser?.id);
    if (users.value.length > 0) {
      selectedUser.value = users.value[0];
    }
  } catch (err) {
    showError('[ERROR]', 'Failed to load users');
  } finally {
    loading.value = false;
  }
};

function selectUser(user: User) {
  selectedUser.value = user;
  markAsRead(user.id.toString());
  nextTick(() => messageInput.value?.focus());
}

function handleSendMessage() {
  if (!messageText.value.trim() || !selectedUser.value) return;
  sendMessage(selectedUser.value.id.toString(), messageText.value);
  messageText.value = '';

  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
    typingTimeout.value = null;
  }
  stopTyping(selectedUser.value.id.toString());
}

function handleInput() {
  if (!selectedUser.value) return;
  startTyping(selectedUser.value.id.toString());

  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }

  typingTimeout.value = setTimeout(() => {
    stopTyping(selectedUser.value.id.toString());
    typingTimeout.value = null;
  }, 1000);
}

function formatTimestamp(ts: string) {
  const date = new Date(ts);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function handleSearch(query: string) {
  searchQuery.value = query;
}

function triggerFileUpload() {
  fileInput.value?.click();
}

function triggerVideoUpload() {
  videoInput.value?.click();
}

function triggerAudioUpload() {
  audioInput.value?.click();
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    previewFile.value = input.files[0];
    pendingFileType.value = 'image';
    showPreview.value = true;
    input.value = '';
  }
}

function handleVideoSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    previewFile.value = input.files[0];
    pendingFileType.value = 'video';
    showPreview.value = true;
    input.value = '';
  }
}

function handleAudioSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    previewFile.value = input.files[0];
    pendingFileType.value = 'audio';
    showPreview.value = true;
    input.value = '';
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0 && selectedUser.value) {
    const file = files[0];
    if (file.type.startsWith('image/')) {
      previewFile.value = file;
      pendingFileType.value = 'image';
      showPreview.value = true;
    } else if (file.type.startsWith('video/')) {
      previewFile.value = file;
      pendingFileType.value = 'video';
      showPreview.value = true;
    } else if (file.type.startsWith('audio/')) {
      previewFile.value = file;
      pendingFileType.value = 'audio';
      showPreview.value = true;
    }
  }
}

async function confirmFileSend() {
  if (!previewFile.value || !selectedUser.value || !pendingFileType.value) return;
  
  showPreview.value = false;
  uploadProgress.value = 10;
  uploadTitle.value = '[ENCRYPTING]';
  uploadMessage.value = 'Securing your file...';

  try {
    if (pendingFileType.value === 'image') {
      await sendImageFile(previewFile.value);
    } else if (pendingFileType.value === 'video') {
      await sendVideoFile(previewFile.value);
    } else if (pendingFileType.value === 'audio') {
      await sendAudioFile(previewFile.value);
    }
    
    uploadProgress.value = 100;
    success('[SENT]', 'File encrypted and sent');
    setTimeout(() => uploadProgress.value = 0, 1000);
  } catch (err) {
    showError('[ERROR]', 'Failed to send file');
    uploadProgress.value = 0;
  }

  previewFile.value = null;
  pendingFileType.value = null;
}

async function sendImageFile(file: File) {
  if (!selectedUser.value) return;
  uploadProgress.value = 30;
  const { encryptedData, key } = await aesImage.encryptFile(file);
  uploadProgress.value = 60;
  const rawKey = await aesImage.exportKey(key);
  uploadProgress.value = 80;
  socket.value.emit('private-image-message', {
    from: currentUserId,
    to: selectedUser.value.id.toString(),
    encryptedData,
    key: rawKey
  });
}

async function sendVideoFile(file: File) {
  if (!selectedUser.value) return;
  if (file.size > 50 * 1024 * 1024) {
    showError('[ERROR]', 'Video too large. Max 50MB');
    return;
  }
  uploadProgress.value = 30;
  const { encryptedData, key } = await aesVideo.encryptFile(file);
  uploadProgress.value = 60;
  const rawKey = await aesVideo.exportKey(key);
  uploadProgress.value = 80;
  socket.value.emit('private-video-message', {
    from: currentUserId,
    to: selectedUser.value.id.toString(),
    encryptedData,
    key: rawKey
  });
}

async function sendAudioFile(file: File) {
  if (!selectedUser.value) return;
  if (file.size > 50 * 1024 * 1024) {
    showError('[ERROR]', 'Audio too large. Max 50MB');
    return;
  }
  uploadProgress.value = 30;
  const { encryptedData, key } = await aesAudio.encryptFile(file);
  uploadProgress.value = 60;
  const rawKey = await aesAudio.exportKey(key);
  uploadProgress.value = 80;
  socket.value.emit('private-audio-message', {
    from: currentUserId,
    to: selectedUser.value.id.toString(),
    encryptedData,
    key: rawKey
  });
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.value = new MediaRecorder(stream);
    audioChunks.value = [];

    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data);
    };

    mediaRecorder.value.onstop = async () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      previewFile.value = audioFile;
      pendingFileType.value = 'audio';
      showPreview.value = true;
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.value.start();
    isRecording.value = true;
    success('[RECORDING]', 'Recording audio...');
  } catch (err) {
    showError('[ERROR]', 'Cannot access microphone');
  }
}

function stopRecording() {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
    isRecording.value = false;
  }
}

async function decryptImageMessage(msg: any) {
  if (msg.decryptedImage) return;
  try {
    const { decryptWithPrivateKey } = await import('../crypto/rsa');
    const privateKeyPem = await secureStorage.getItem('privateKey');
    if (!privateKeyPem) return;
    const aesKeyBase64 = await decryptWithPrivateKey(msg.encryptedKey, privateKeyPem);
    const keyBuffer = Uint8Array.from(atob(aesKeyBase64), c => c.charCodeAt(0));
    const messageKey = await window.crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-CBC' }, false, ['decrypt']);
    let encryptedBytes: ArrayBuffer;
    if (typeof msg.message === 'string') {
      const binaryString = atob(msg.message);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      encryptedBytes = bytes.buffer;
    } else {
      encryptedBytes = msg.message;
    }
    const imageBlob = await aesImage.decryptFile(encryptedBytes, messageKey);
    msg.decryptedImage = URL.createObjectURL(imageBlob);
  } catch (err) {
    console.error('Error decrypting image:', err);
  }
}

async function decryptVideoMessage(msg: any) {
  if (msg.decryptedVideo) return;
  try {
    const { decryptWithPrivateKey } = await import('../crypto/rsa');
    const privateKeyPem = await secureStorage.getItem('privateKey');
    if (!privateKeyPem) return;
    const aesKeyBase64 = await decryptWithPrivateKey(msg.encryptedKey, privateKeyPem);
    const keyBuffer = Uint8Array.from(atob(aesKeyBase64), c => c.charCodeAt(0));
    const messageKey = await window.crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-CBC' }, false, ['decrypt']);
    let encryptedBytes: ArrayBuffer;
    if (typeof msg.message === 'string') {
      const binaryString = atob(msg.message);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      encryptedBytes = bytes.buffer;
    } else {
      encryptedBytes = msg.message;
    }
    const videoBlob = await aesVideo.decryptFile(encryptedBytes, messageKey);
    msg.decryptedVideo = URL.createObjectURL(videoBlob);
  } catch (err) {
    console.error('Error decrypting video:', err);
  }
}

async function decryptAudioMessage(msg: any) {
  if (msg.decryptedAudio) return;
  try {
    const { decryptWithPrivateKey } = await import('../crypto/rsa');
    const privateKeyPem = await secureStorage.getItem('privateKey');
    if (!privateKeyPem) return;
    const aesKeyBase64 = await decryptWithPrivateKey(msg.encryptedKey, privateKeyPem);
    const keyBuffer = Uint8Array.from(atob(aesKeyBase64), c => c.charCodeAt(0));
    const messageKey = await window.crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-CBC' }, false, ['decrypt']);
    let encryptedBytes: ArrayBuffer;
    if (typeof msg.message === 'string') {
      const binaryString = atob(msg.message);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      encryptedBytes = bytes.buffer;
    } else {
      encryptedBytes = msg.message;
    }
    const audioBlob = await aesAudio.decryptFile(encryptedBytes, messageKey);
    msg.decryptedAudio = URL.createObjectURL(audioBlob);
  } catch (err) {
    console.error('Error decrypting audio:', err);
  }
}

function openImage(url: string) {
  window.open(url, '_blank');
}

onMounted(() => {
  loadUsers();
  
  register({ key: 'k', ctrl: true, handler: () => {
    const searchInput = document.querySelector('input[placeholder*="SEARCH"]') as HTMLInputElement;
    searchInput?.focus();
  }});

  register({ key: 'Escape', handler: () => {
    showAttachMenu.value = false;
    showPreview.value = false;
    showShortcuts.value = false;
  }});

  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
});
</script>

