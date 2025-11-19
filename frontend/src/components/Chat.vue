<template>
  <div class="flex h-[calc(100vh-3.5rem)] flex-col md:flex-row overflow-hidden bg-zinc-950">
    <!-- Sidebar / Topbar -->
    <div class="flex w-full flex-row border-b border-white/5 bg-zinc-900/30 backdrop-blur-xl md:w-80 md:flex-col md:border-r md:border-b-0">
      <div class="hidden p-4 md:block">
        <h2 class="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Direct Messages</h2>
      </div>
      
      <div class="flex flex-1 overflow-x-auto px-2 py-2 md:flex-col md:overflow-y-auto md:px-2 md:py-0">
        <div v-if="loading" class="flex justify-center py-4">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent"></div>
        </div>
        
        <div
          v-for="user in users"
          :key="user.id"
          @click="selectUser(user)"
          class="group flex min-w-[80px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 transition-all hover:bg-white/5 md:min-w-0 md:flex-row md:justify-start md:gap-3 md:px-3"
          :class="{ 'bg-white/10': selectedUser && selectedUser.id === user.id }"
        >
          <div class="relative">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 md:h-9 md:w-9">
              {{ user.username.charAt(0).toUpperCase() }}
            </div>
            <span
              v-if="onlineUsers.includes(user.id.toString())"
              class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-900 bg-emerald-500 md:h-2.5 md:w-2.5"
            ></span>
          </div>
          
          <div class="flex w-full flex-col items-center overflow-hidden md:items-start">
            <h4 class="w-full truncate text-center text-xs font-medium text-zinc-200 group-hover:text-white md:text-left md:text-sm">
              {{ user.username }}
            </h4>
            <p class="hidden truncate text-xs text-zinc-500 group-hover:text-zinc-400 md:block">
              {{ onlineUsers.includes(user.id.toString()) ? 'Online' : 'Offline' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Area -->
    <div class="flex flex-1 flex-col bg-zinc-950 min-h-0">
      <div v-if="selectedUser" class="flex items-center border-b border-white/5 bg-zinc-900/30 px-4 py-2 backdrop-blur-xl md:px-6 md:py-3">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-medium text-white">
            {{ selectedUser.username.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-sm font-medium text-white">{{ selectedUser.username }}</h2>
            <p class="text-xs text-zinc-500">
              {{ onlineUsers.includes(selectedUser.id.toString()) ? 'Active now' : 'Offline' }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 md:p-6 messages-container min-h-0">
        <div v-if="!selectedUser" class="flex h-full flex-col items-center justify-center text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">👋</div>
          <h3 class="mt-4 text-lg font-medium text-white">Welcome to MessageX</h3>
          <p class="mt-2 text-sm text-zinc-500">Select a conversation to start chatting</p>
        </div>

        <div v-else class="space-y-4 md:space-y-6">
          <div
            v-for="msg in conversationMessages"
            :key="msg.id || (msg.timestamp + msg.message)"
            class="flex flex-col"
            :class="msg.from_user_id == currentUserId ? 'items-end' : 'items-start'"
          >
            <div
              class="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm"
              :class="msg.from_user_id == currentUserId 
                ? 'bg-indigo-600 text-white rounded-br-sm' 
                : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'"
            >
              <template v-if="msg.messageType === 'image'">
                 <div v-if="msg.decryptedImage" class="relative group cursor-pointer">
                    <img :src="msg.decryptedImage" alt="Encrypted Image" class="max-w-full rounded-lg" @click="openImage(msg.decryptedImage)" />
                 </div>
                 <div v-else class="flex items-center gap-2 text-xs italic opacity-70">
                   <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                   Decrypting image...
                 </div>
              </template>
              <template v-else-if="msg.messageType === 'video'">
                 <div v-if="msg.decryptedVideo" class="relative group">
                    <video :src="msg.decryptedVideo" controls class="max-w-full rounded-lg"></video>
                 </div>
                 <div v-else class="flex items-center gap-2 text-xs italic opacity-70">
                   <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                   Decrypting video...
                 </div>
              </template>
              <template v-else-if="msg.messageType === 'audio'">
                 <div v-if="msg.decryptedAudio" class="relative group">
                    <audio :src="msg.decryptedAudio" controls class="w-full min-w-[200px]"></audio>
                 </div>
                 <div v-else class="flex items-center gap-2 text-xs italic opacity-70">
                   <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                   Decrypting audio...
                 </div>
              </template>
              <template v-else>
                {{ msg.message }}
              </template>
            </div>
            <span class="mt-1 text-[10px] text-zinc-600">
              {{ formatTimestamp(msg.timestamp) }}
            </span>
          </div>

          <!-- Typing indicator -->
          <div v-if="isUserTyping" class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400">
              {{ selectedUser.username.charAt(0).toUpperCase() }}
            </div>
            <div class="flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-2">
              <div class="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]"></div>
              <div class="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]"></div>
              <div class="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500"></div>
            </div>
          </div>
        </div>
      </div>


      
      <!-- Image Upload Input (Hidden) -->
      <input
        type="file"
        ref="fileInput"
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />
      
      <!-- Video Upload Input (Hidden) -->
      <input
        type="file"
        ref="videoInput"
        accept="video/*"
        class="hidden"
        @change="handleVideoSelect"
      />
      
      <!-- Audio Upload Input (Hidden) -->
      <input
        type="file"
        ref="audioInput"
        accept="audio/*"
        class="hidden"
        @change="handleAudioSelect"
      />
      
      <div v-if="selectedUser" class="border-t border-white/5 bg-zinc-900/30 p-3 md:p-4 backdrop-blur-xl">
        <form @submit.prevent="handleSendMessage" class="relative flex items-center gap-2">
          <!-- Attachment Dropdown -->
          <div class="relative">
            <div
              v-if="showAttachMenu"
              class="absolute bottom-full left-0 mb-2 flex w-48 flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-900/90 p-1 backdrop-blur-xl shadow-xl"
            >
              <button
                type="button"
                @click="triggerFileUpload(); showAttachMenu = false"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                Image
              </button>
              <button
                type="button"
                @click="triggerVideoUpload(); showAttachMenu = false"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                Video
              </button>
              <button
                type="button"
                @click="triggerAudioUpload(); showAttachMenu = false"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
                Audio
              </button>
            </div>
            
            <button
              type="button"
              @click="showAttachMenu = !showAttachMenu"
              class="rounded-md p-2 text-zinc-400 hover:bg-white/10 hover:text-indigo-400 transition-colors"
              :class="{ 'text-indigo-400 bg-white/10': showAttachMenu }"
              title="Attach file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            @click="isRecording ? stopRecording() : startRecording()"
            class="rounded-md p-2 transition-colors"
            :class="isRecording ? 'text-red-500 hover:bg-red-500/10 animate-pulse' : 'text-zinc-400 hover:bg-white/10 hover:text-indigo-400'"
            :title="isRecording ? 'Stop Recording' : 'Record Audio'"
          >
            <svg v-if="!isRecording" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
            </svg>
          </button>
          <input
            v-model="messageText"
            type="text"
            placeholder="Type a message..."
            autocomplete="off"
            @input="handleInput"
            class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pr-12 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button
            type="submit"
            class="absolute right-2 rounded-md p-1.5 text-zinc-400 hover:bg-white/10 hover:text-indigo-400 transition-colors"
            :disabled="!messageText.trim()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { apiService, type User } from '../services/api';
import { useSocket } from '../services/useSocket';
import { useUserStore } from '../stores/userStore';
import { AESImage } from '../crypto/AESImage';
import { AESVideo } from '../crypto/AESVideo';
import { AESAudio } from '../crypto/AESAudio';
import { secureStorage } from '../services/secureStorage';

const userStore = useUserStore();
const users = ref<User[]>([]);
const loading = ref(false);
const selectedUser = ref<User | null>(null);
const messageText = ref('');
const currentUserId = userStore.currentUser?.id.toString() || '';
const typingTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const videoInput = ref<HTMLInputElement | null>(null);
const audioInput = ref<HTMLInputElement | null>(null);
const showAttachMenu = ref(false);
const isRecording = ref(false);
const mediaRecorder = ref<MediaRecorder | null>(null);
const audioChunks = ref<Blob[]>([]);
const aesImage = new AESImage();
const aesVideo = new AESVideo();
const aesAudio = new AESAudio();

const { messages, onlineUsers, typingUsers, sendMessage, startTyping, stopTyping, socket } = useSocket();

const conversationMessages = computed(() => {
  if (!selectedUser.value) return [];
  const filtered = messages.value.filter(
    m =>
      (m.from_user_id == currentUserId && m.to_user_id == selectedUser.value?.id) ||
      (m.to_user_id == currentUserId && m.from_user_id == selectedUser.value?.id)
  );
  
  // Trigger decryption for images/videos/audios if not already done
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

// Auto-scroll to bottom when new messages arrive
watch(conversationMessages, async () => {
  await nextTick();
  const messagesContainer = document.querySelector('.messages-container');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}, { deep: true });

const loadUsers = async () => {
  loading.value = true;
  try {
    users.value = await apiService.getUsers();
    // Filter out the current user to prevent self-messaging
    users.value = users.value.filter(user => user.id !== userStore.currentUser?.id);
    if (users.value.length > 0) {
      selectedUser.value = users.value[0];
    }
  } catch (error) {
    console.error('Failed to load users:', error);
  } finally {
    loading.value = false;
  }
};

function selectUser(user: User) {
  selectedUser.value = user;
}

function handleSendMessage() {
  if (!messageText.value.trim() || !selectedUser.value) return;
  console.log('💬 Sending message to user:', selectedUser.value.username, 'Message:', messageText.value);
  sendMessage(selectedUser.value.id.toString(), messageText.value);
  messageText.value = '';

  // Stop typing indicator
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
    typingTimeout.value = null;
  }
  stopTyping(selectedUser.value.id.toString());
}

function handleInput() {
  if (!selectedUser.value) return;

  // Start typing indicator
  startTyping(selectedUser.value.id.toString());

  // Clear existing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }

  // Set timeout to stop typing indicator after 1 second of no input
  typingTimeout.value = setTimeout(() => {
    stopTyping(selectedUser.value.id.toString());
    typingTimeout.value = null;
  }, 1000);
}

function formatTimestamp(ts: string) {
  const date = new Date(ts);
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
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

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0 && selectedUser.value) {
    const file = input.files[0];
    
    try {
      // 1. Encrypt the image
      const { encryptedData, key } = await aesImage.encryptFile(file);
      
      // 2. Export the key to send it
      const rawKey = await aesImage.exportKey(key);
      
      // 3. Emit to server
      socket.value.emit('private-image-message', {
        from: currentUserId,
        to: selectedUser.value.id.toString(),
        encryptedData: encryptedData, // ArrayBuffer
        key: rawKey // ArrayBuffer
      });
      
      console.log('📤 Sent encrypted image');
    } catch (error) {
      console.error('Error sending image:', error);
    }
    
    // Reset input
    input.value = '';
  }
}

async function handleVideoSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0 && selectedUser.value) {
    const file = input.files[0];
    
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
        alert('Video file is too large. Max 50MB.');
        input.value = '';
        return;
    }
    
    try {
      console.log('🎥 Encrypting video...');
      // 1. Encrypt the video
      const { encryptedData, key } = await aesVideo.encryptFile(file);
      
      // 2. Export the key to send it
      const rawKey = await aesVideo.exportKey(key);
      
      // 3. Emit to server
      socket.value.emit('private-video-message', {
        from: currentUserId,
        to: selectedUser.value.id.toString(),
        encryptedData: encryptedData, // ArrayBuffer
        key: rawKey // ArrayBuffer
      });
      
      console.log('📤 Sent encrypted video');
    } catch (error) {
      console.error('Error sending video:', error);
    }
    
    // Reset input
    input.value = '';
  }
}

async function handleAudioSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    await sendAudioFile(file);
    input.value = '';
  }
}

async function sendAudioFile(file: File) {
    if (!selectedUser.value) return;

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
        alert('Audio file is too large. Max 50MB.');
        return;
    }
    
    try {
      console.log('🎤 Encrypting audio...');
      // 1. Encrypt the audio
      const { encryptedData, key } = await aesAudio.encryptFile(file);
      
      // 2. Export the key to send it
      const rawKey = await aesAudio.exportKey(key);
      
      // 3. Emit to server
      socket.value.emit('private-audio-message', {
        from: currentUserId,
        to: selectedUser.value.id.toString(),
        encryptedData: encryptedData, // ArrayBuffer
        key: rawKey // ArrayBuffer
      });
      
      console.log('📤 Sent encrypted audio');
    } catch (error) {
      console.error('Error sending audio:', error);
    }
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
      await sendAudioFile(audioFile);
      
      // Stop all tracks to release microphone
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.value.start();
    isRecording.value = true;
  } catch (error) {
    console.error('Error accessing microphone:', error);
    alert('Could not access microphone. Please ensure you have granted permission.');
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
        
        if (!privateKeyPem) {
            console.warn('Cannot decrypt image: missing private key');
            return;
        }
        
        const aesKeyBase64 = await decryptWithPrivateKey(msg.encryptedKey, privateKeyPem);
        const keyBuffer = Uint8Array.from(atob(aesKeyBase64), c => c.charCodeAt(0));
        const messageKey = await window.crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'AES-CBC' },
            false,
            ['decrypt']
        );
        
        let encryptedBytes: ArrayBuffer;
        if (typeof msg.message === 'string') {
             if ((msg.message as any).type === 'Buffer') {
                 encryptedBytes = new Uint8Array((msg.message as any).data).buffer;
             } else {
                 const binaryString = atob(msg.message);
                 const bytes = new Uint8Array(binaryString.length);
                 for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                 }
                 encryptedBytes = bytes.buffer;
             }
        } else {
            encryptedBytes = msg.message;
        }
        
        const imageBlob = await aesImage.decryptFile(encryptedBytes, messageKey);
        msg.decryptedImage = URL.createObjectURL(imageBlob);
        
    } catch (error) {
        console.error('Error decrypting image:', error);
    }
}

async function decryptVideoMessage(msg: any) {
    if (msg.decryptedVideo) return;
    
    try {
        const { decryptWithPrivateKey } = await import('../crypto/rsa');
        const privateKeyPem = await secureStorage.getItem('privateKey');
        
        if (!privateKeyPem) {
            console.warn('Cannot decrypt video: missing private key');
            return;
        }
        
        const aesKeyBase64 = await decryptWithPrivateKey(msg.encryptedKey, privateKeyPem);
        const keyBuffer = Uint8Array.from(atob(aesKeyBase64), c => c.charCodeAt(0));
        const messageKey = await window.crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'AES-CBC' },
            false,
            ['decrypt']
        );
        
        let encryptedBytes: ArrayBuffer;
        if (typeof msg.message === 'string') {
             if ((msg.message as any).type === 'Buffer') {
                 encryptedBytes = new Uint8Array((msg.message as any).data).buffer;
             } else {
                 const binaryString = atob(msg.message);
                 const bytes = new Uint8Array(binaryString.length);
                 for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                 }
                 encryptedBytes = bytes.buffer;
             }
        } else {
            encryptedBytes = msg.message;
        }
        
        const videoBlob = await aesVideo.decryptFile(encryptedBytes, messageKey);
        msg.decryptedVideo = URL.createObjectURL(videoBlob);
        
    } catch (error) {
        console.error('Error decrypting video:', error);
    }
}

async function decryptAudioMessage(msg: any) {
    if (msg.decryptedAudio) return;
    
    try {
        const { decryptWithPrivateKey } = await import('../crypto/rsa');
        const privateKeyPem = await secureStorage.getItem('privateKey');
        
        if (!privateKeyPem) {
            console.warn('Cannot decrypt audio: missing private key');
            return;
        }
        
        const aesKeyBase64 = await decryptWithPrivateKey(msg.encryptedKey, privateKeyPem);
        const keyBuffer = Uint8Array.from(atob(aesKeyBase64), c => c.charCodeAt(0));
        const messageKey = await window.crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'AES-CBC' },
            false,
            ['decrypt']
        );
        
        let encryptedBytes: ArrayBuffer;
        if (typeof msg.message === 'string') {
             if ((msg.message as any).type === 'Buffer') {
                 encryptedBytes = new Uint8Array((msg.message as any).data).buffer;
             } else {
                 const binaryString = atob(msg.message);
                 const bytes = new Uint8Array(binaryString.length);
                 for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                 }
                 encryptedBytes = bytes.buffer;
             }
        } else {
            encryptedBytes = msg.message;
        }
        
        const audioBlob = await aesAudio.decryptFile(encryptedBytes, messageKey);
        msg.decryptedAudio = URL.createObjectURL(audioBlob);
        
    } catch (error) {
        console.error('Error decrypting audio:', error);
    }
}

function openImage(url: string) {
    window.open(url, '_blank');
}

onMounted(loadUsers);
</script>
