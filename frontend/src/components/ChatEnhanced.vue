<template>
  <div class="flex h-full flex-col md:flex-row overflow-hidden relative z-10"
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

    <div v-if="!isOnline" class="absolute top-0 left-0 right-0 z-40 bg-red-500/90 text-white text-center py-2 font-mono text-xs md:text-sm">
      [CONNECTION_LOST] Reconnecting...
    </div>

    <div 
      v-show="!isMobile || !selectedUser"
      class="flex w-full flex-col md:w-80 md:border-r matrix-box-glow" 
      :class="[
        isMobile ? 'h-full border-b-0 slide-in-left' : 'border-b max-h-[30vh] md:max-h-none md:border-b-0'
      ]"
      style="border-color: var(--matrix-dark); background: rgba(10, 15, 10, 0.75); backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);">
      <div class="p-3 md:p-4 space-y-3">
        <h2 class="px-2 text-xs font-bold uppercase tracking-widest text-green-500 matrix-glow-subtle matrix-glitch">&gt; DIRECT_MESSAGES</h2>
        <SearchBar placeholder="> SEARCH_USER..." @search="handleSearch" />
      </div>
      
      <div 
        class="flex flex-1 px-2 py-2 scrollbar-thin"
        :class="isMobile ? 'flex-col overflow-y-auto gap-0' : 'overflow-x-auto md:overflow-x-hidden gap-2 md:flex-col md:overflow-y-auto md:px-2 md:py-0 md:gap-0'"
      >
        <div v-if="loading" class="flex justify-center py-4 w-full">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-green-500 border-t-transparent matrix-glow-subtle"></div>
        </div>
        
        <div v-if="!loading && filteredUsers.length === 0" class="flex flex-col items-center justify-center py-6 md:py-8 px-4 text-center w-full">
          <div class="text-2xl md:text-3xl mb-2">👤</div>
          <p class="text-xs md:text-sm text-green-700 font-mono">[NO_USERS_FOUND]</p>
        </div>
        
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          @click="selectUser(user)"
          :class="[
            'group relative flex cursor-pointer transition-all active:bg-green-500/20 border border-transparent active:border-green-500/50 md:hover:bg-green-500/10 md:hover:border-green-500/30 hover-matrix-glow touch-manipulation',
            isMobile ? 'flex-row items-center gap-3 px-3 py-3' : 'min-w-[80px] flex-shrink-0 flex-col items-center justify-center gap-1.5 px-2.5 py-2.5 md:min-w-0 md:flex-row md:justify-start md:gap-3 md:px-3 md:py-2',
            { 'bg-green-500/20 border-green-500 matrix-box-glow': selectedUser && selectedUser.id === user.id }
          ]"
        >
          <div class="relative flex-shrink-0">
            <div 
              class="flex items-center justify-center bg-black border-2 border-green-500 font-bold text-green-500 shadow-lg matrix-glow-subtle"
              :class="isMobile ? 'h-12 w-12 text-base' : 'h-10 w-10 text-sm md:h-9 md:w-9 md:text-sm'"
            >
              {{ user.username.charAt(0).toUpperCase() }}
            </div>
            <span
              v-if="onlineUsers.includes(user.id.toString())"
              class="absolute bottom-0 right-0 h-3 w-3 border-2 border-black bg-green-500 rounded-full md:h-2.5 md:w-2.5 matrix-glow-subtle"
            ></span>
            <span
              v-if="getUnreadCount(user.id.toString()) > 0"
              class="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full md:h-5 md:w-5 md:text-[10px] matrix-glow-subtle"
            >
              {{ getUnreadCount(user.id.toString()) }}
            </span>
          </div>
          
          <div class="flex w-full flex-col overflow-hidden min-w-0" :class="isMobile ? 'items-start' : 'items-center md:items-start'">
            <h4 
              class="w-full truncate font-bold text-green-500 group-hover:text-green-400 leading-tight"
              :class="isMobile ? 'text-sm text-left' : 'text-center text-[11px] md:text-left md:text-sm'"
            >
              {{ user.username }}
            </h4>
            <p 
              class="truncate text-xs text-green-700 group-hover:text-green-600 font-mono"
              :class="isMobile ? 'block' : 'hidden md:block'"
            >
              {{ onlineUsers.includes(user.id.toString()) ? '[ONLINE]' : '[OFFLINE]' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div 
      v-show="!isMobile || selectedUser"
      class="flex flex-1 flex-col min-h-0" 
      :class="{ 'slide-in-right': isMobile && selectedUser }"
      style="background: transparent;"
    >
      <div v-if="selectedUser" class="flex items-center justify-between border-b px-3 py-2.5 backdrop-blur-md md:px-6 md:py-3 matrix-box-glow flex-shrink-0" style="border-color: var(--matrix-dark); background: rgba(10, 15, 10, 0.92);">
        <div class="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <button 
            v-if="isMobile"
            @click="backToContacts"
            class="flex items-center justify-center p-2 text-green-500 active:text-green-400 transition-colors flex-shrink-0 touch-manipulation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-black border-2 border-green-500 text-xs font-bold text-green-500 md:h-8 md:w-8 md:text-xs matrix-glow-subtle">
            {{ selectedUser.username.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="text-xs md:text-sm font-bold text-green-500 matrix-glow-subtle truncate">&gt; {{ selectedUser.username }}</h2>
            <p class="text-[10px] md:text-xs text-green-700 font-mono truncate">
              {{ onlineUsers.includes(selectedUser.id.toString()) ? '[ACTIVE_NOW]' : '[OFFLINE]' }}
            </p>
          </div>
        </div>
        <button 
          v-if="!isMobile"
          @click="showShortcuts = !showShortcuts" 
          class="text-green-500 active:text-green-400 text-sm md:text-xs font-mono px-2 py-1 flex-shrink-0 border border-green-500 active:bg-green-500/20 md:border-0 md:hover:text-green-400 touch-manipulation"
        >
          [?]
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-3 md:p-6 messages-container min-h-0 relative" ref="messagesContainer" style="background: transparent;">
        <div v-if="!selectedUser" class="flex h-full flex-col items-center justify-center text-center matrix-fade-in space-y-3 md:space-y-4 px-4">
          <div class="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center border-2 border-green-500 bg-black text-2xl md:text-3xl matrix-box-glow">🟢</div>
          <h3 class="text-base md:text-lg font-bold text-green-500 matrix-glow typing-cursor">THE_X_MESSENGER</h3>
          <p class="text-xs md:text-sm text-green-700 font-mono">&gt; SELECT_CONVERSATION_TO_START</p>
          <div class="text-xs text-green-800 font-mono space-y-1 hidden md:block">
            <p>[TIP]: Press Ctrl+K to search</p>
            <p>[TIP]: Drag & drop files to send</p>
          </div>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="(group, groupIndex) in groupedMessages"
            :key="groupIndex"
            class="flex flex-col matrix-fade-in mb-4"
            :class="group.isSent ? 'items-end' : 'items-start'"
          >
            <div v-if="!group.isSent" class="flex items-center gap-2 mb-2 px-1">
              <div class="flex h-6 w-6 items-center justify-center bg-black border border-green-500 text-[10px] font-bold text-green-500">
                {{ selectedUser.username.charAt(0).toUpperCase() }}
              </div>
              <span class="text-xs font-bold" style="color: var(--matrix-medium);">{{ selectedUser.username }}</span>
              <span v-if="onlineUsers.includes(selectedUser.id.toString())" class="text-[10px] font-mono" style="color: var(--matrix-dim);">[ONLINE]</span>
            </div>
            
            <div class="space-y-2 flex flex-col" :class="group.isSent ? 'items-end' : 'items-start'">
              <div
                v-for="(msg, msgIndex) in group.messages"
                :key="msg.id || (msg.timestamp + msg.message)"
                class="flex flex-col"
                :class="group.isSent ? 'items-end' : 'items-start'"
              >
                <div
                  class="text-sm md:text-[15px] font-mono max-w-[90%] md:max-w-[85%] lg:max-w-[70%]"
                  :class="group.isSent 
                    ? 'matrix-message-sent' 
                    : 'matrix-message-received'"
                  style="color: var(--matrix-normal);"
                >
                  <template v-if="msg.messageType === 'image'">
                     <div v-if="msg.decryptedImage" class="relative group cursor-pointer">
                        <img :src="msg.decryptedImage" alt="Encrypted Image" class="max-w-full rounded-lg" @click="openImage(msg.decryptedImage)" />
                     </div>
                     <div v-else class="flex items-center gap-2 text-xs font-mono" style="color: var(--matrix-dim);">
                       <div class="h-4 w-4 animate-spin border-2 border-green-500 border-t-transparent"></div>
                       [DECRYPTING_IMAGE...]
                     </div>
                  </template>
                  <template v-else-if="msg.messageType === 'video'">
                     <div v-if="msg.decryptedVideo" class="relative group">
                        <video :src="msg.decryptedVideo" controls class="max-w-full border border-green-500"></video>
                     </div>
                     <div v-else class="flex items-center gap-2 text-xs font-mono" style="color: var(--matrix-dim);">
                       <div class="h-4 w-4 animate-spin border-2 border-green-500 border-t-transparent"></div>
                       [DECRYPTING_VIDEO...]
                     </div>
                  </template>
                  <template v-else-if="msg.messageType === 'audio'">
                     <div v-if="msg.decryptedAudio" class="relative group">
                        <AudioPlayer :src="msg.decryptedAudio" />
                     </div>
                     <div v-else class="flex items-center gap-2 text-xs font-mono" style="color: var(--matrix-dim);">
                       <div class="h-4 w-4 animate-spin border-2 border-green-500 border-t-transparent"></div>
                       [DECRYPTING_AUDIO...]
                     </div>
                  </template>
                  <template v-else>
                    {{ msg.message }}
                  </template>
                </div>
                
                <div class="flex items-center gap-2 mt-0.5 px-1">
                  <span class="text-[9px] md:text-[10px] font-mono" style="color: var(--matrix-dim);">
                    [{{ formatTimestamp(msg.timestamp) }}]
                  </span>
                </div>
              </div>
            </div>
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
      
      <div v-if="selectedUser" class="border-t p-2 md:p-4 backdrop-blur-md matrix-box-glow flex-shrink-0 safe-area-bottom" style="border-color: var(--matrix-dark); background: rgba(10, 15, 10, 0.92);">
        <form @submit.prevent="handleSendMessage" class="relative flex items-end gap-1.5 md:gap-2">
          <div class="relative flex-shrink-0">
            <div
              v-if="showAttachMenu"
              class="absolute bottom-full left-0 mb-2 flex w-48 md:w-52 flex-col overflow-hidden border-2 border-green-500 bg-black/95 p-1 backdrop-blur-xl shadow-xl matrix-box-glow-strong z-10"
            >
              <button
                type="button"
                @click="triggerFileUpload(); showAttachMenu = false"
                class="flex items-center gap-3 px-3 py-2.5 md:py-2 text-xs md:text-sm text-green-500 active:bg-green-500/20 md:hover:bg-green-500/10 transition-colors text-left font-mono border border-transparent active:border-green-500 md:hover:border-green-500 touch-manipulation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>[IMAGE]</span>
              </button>
              <button
                type="button"
                @click="triggerVideoUpload(); showAttachMenu = false"
                class="flex items-center gap-3 px-3 py-2.5 md:py-2 text-xs md:text-sm text-green-500 active:bg-green-500/20 md:hover:bg-green-500/10 transition-colors text-left font-mono border border-transparent active:border-green-500 md:hover:border-green-500 touch-manipulation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>[VIDEO]</span>
              </button>
              <button
                type="button"
                @click="triggerAudioUpload(); showAttachMenu = false"
                class="flex items-center gap-3 px-3 py-2.5 md:py-2 text-xs md:text-sm text-green-500 active:bg-green-500/20 md:hover:bg-green-500/10 transition-colors text-left font-mono border border-transparent active:border-green-500 md:hover:border-green-500 touch-manipulation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <span>[AUDIO]</span>
              </button>
            </div>
            
            <button
              type="button"
              @click="showAttachMenu = !showAttachMenu"
              class="flex items-center justify-center text-green-500 active:bg-green-500/20 md:hover:bg-green-500/10 transition-colors border-2 border-green-500 touch-manipulation h-[44px] w-[44px] md:h-[40px] md:w-[40px]"
              :class="{ 'text-green-400 bg-green-500/20 matrix-box-glow': showAttachMenu }"
              title="Attach file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
          </div>
          <div class="flex-shrink-0">
            <button
              type="button"
              @click="isRecording ? stopRecording() : startRecording()"
              class="flex items-center justify-center transition-colors border-2 border-green-500 touch-manipulation h-[44px] w-[44px] md:h-[40px] md:w-[40px]"
              :class="isRecording ? 'text-red-500 active:bg-red-500/20 md:hover:bg-red-500/10 animate-pulse border-red-500' : 'text-green-500 active:bg-green-500/20 md:hover:bg-green-500/10 md:hover:text-green-400'"
              :title="isRecording ? 'Stop Recording' : 'Record Audio'"
            >
              <svg v-if="!isRecording" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
            </button>
          </div>
          <div class="relative flex-1 min-w-0">
            <div v-if="isRecording" class="flex items-center gap-3 matrix-input w-full px-3 md:px-4 py-3 md:py-2.5">
              <div class="flex items-center gap-2 flex-shrink-0">
                <div class="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                <span class="font-mono text-sm md:text-base text-green-500 font-bold">{{ recordingTime }}</span>
              </div>
              <div class="flex-1 flex items-center justify-center gap-0.5 h-8">
                <div 
                  v-for="i in 30" 
                  :key="i" 
                  class="w-1 bg-green-500 rounded-full transition-all duration-150"
                  :style="{ height: audioWaveHeights[i - 1] + 'px' }"
                ></div>
              </div>
              <button
                type="button"
                @click="cancelRecording"
                class="flex items-center justify-center p-1 text-red-500 active:bg-red-500/20 md:hover:bg-red-500/10 transition-colors flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <textarea
              v-else
              v-model="messageText"
              ref="messageInput"
              rows="1"
              :placeholder="isMobile ? '> TYPE...' : '> TYPE_MESSAGE... (Enter to send)'"
              class="matrix-input w-full pl-3 pr-12 md:px-4 md:pr-10 py-3 md:py-2.5 text-base md:text-sm resize-none max-h-[120px]"
              style="font-size: 16px !important;"
              @keydown.enter.exact.prevent="handleKeyEnter"
              @keydown.enter.shift.exact.prevent="handleShiftEnter"
              @input="handleInput"
            />
            <button
              v-if="!isRecording"
              type="submit"
              class="absolute right-2 md:right-2 top-1/2 -translate-y-1/2 flex items-center justify-center p-2 text-green-500 active:bg-green-500/20 md:hover:bg-green-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
              :disabled="!messageText.trim()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
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
      <div v-if="showShortcuts" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" @click="showShortcuts = false">
        <div class="bg-black border-2 border-green-500 p-4 md:p-6 max-w-md w-full matrix-box-glow-strong" @click.stop>
          <h3 class="text-green-500 font-bold text-base md:text-lg mb-3 md:mb-4 font-mono">[KEYBOARD_SHORTCUTS]</h3>
          <div class="space-y-2 text-xs md:text-sm font-mono">
            <div class="flex justify-between gap-4"><span class="text-green-700">Enter</span><span class="text-green-500">Send message</span></div>
            <div class="flex justify-between gap-4"><span class="text-green-700">Shift+Enter</span><span class="text-green-500">New line</span></div>
            <div class="flex justify-between gap-4"><span class="text-green-700">Esc</span><span class="text-green-500">Close menu</span></div>
            <div class="flex justify-between gap-4"><span class="text-green-700 hidden md:block">Ctrl+K</span><span class="text-green-500 hidden md:block">Search</span></div>
          </div>
          <button @click="showShortcuts = false" class="mt-4 matrix-btn w-full py-3 md:py-2 font-bold">[CLOSE]</button>
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
import AudioPlayer from './AudioPlayer.vue';

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
const isMobile = ref(window.innerWidth < 768);
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
const recordingSeconds = ref(0);
const recordingInterval = ref<ReturnType<typeof setInterval> | null>(null);
const audioWaveHeights = ref<number[]>(Array(30).fill(4));
const waveAnimationFrame = ref<number | null>(null);

const aesImage = new AESImage();
const aesVideo = new AESVideo();
const aesAudio = new AESAudio();

const { messages, onlineUsers, typingUsers, sendMessage, startTyping, stopTyping, socket } = useSocket();

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  const filtered = users.value.filter(u => u.username.toLowerCase().includes(query));
  console.log(`🔍 Search query: "${query}", Found ${filtered.length} users`);
  return filtered;
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

const groupedMessages = computed(() => {
  const msgs = conversationMessages.value;
  if (msgs.length === 0) return [];
  
  const groups: Array<{ isSent: boolean; messages: any[] }> = [];
  let currentGroup: { isSent: boolean; messages: any[] } | null = null;
  
  msgs.forEach((msg, index) => {
    const isSent = msg.from_user_id == currentUserId;
    const timestamp = new Date(msg.timestamp).getTime();
    
    const shouldStartNewGroup = 
      !currentGroup ||
      currentGroup.isSent !== isSent ||
      (index > 0 && timestamp - new Date(msgs[index - 1].timestamp).getTime() > 5 * 60 * 1000);
    
    if (shouldStartNewGroup) {
      currentGroup = { isSent, messages: [msg] };
      groups.push(currentGroup);
    } else {
      currentGroup.messages.push(msg);
    }
  });
  
  return groups;
});

const isUserTyping = computed(() => {
  return selectedUser.value && typingUsers.value.includes(selectedUser.value.id.toString());
});

const recordingTime = computed(() => {
  const minutes = Math.floor(recordingSeconds.value / 60);
  const seconds = recordingSeconds.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    if (users.value.length > 0 && !isMobile.value) {
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
  messageText.value = '';
  
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
    if (messageInput.value && !isMobile.value) {
      messageInput.value.focus();
    }
  });
}

function backToContacts() {
  selectedUser.value = null;
  messageText.value = '';
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

async function handleKeyEnter(event: KeyboardEvent) {
  event.preventDefault();
  await nextTick();
  handleSendMessage();
}

function handleShiftEnter(event: KeyboardEvent) {
  event.preventDefault();
  messageText.value += '\n';
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = 'auto';
      messageInput.value.style.height = messageInput.value.scrollHeight + 'px';
    }
  });
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
  console.log(`🔍 handleSearch called with: "${query}"`);
  searchQuery.value = query;
  console.log(`🔍 searchQuery.value set to: "${searchQuery.value}"`);
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
    recordingSeconds.value = 0;

    recordingInterval.value = setInterval(() => {
      recordingSeconds.value++;
    }, 1000);

    animateWaves();

    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data);
    };

    mediaRecorder.value.onstop = async () => {
      if (recordingInterval.value) {
        clearInterval(recordingInterval.value);
        recordingInterval.value = null;
      }
      if (waveAnimationFrame.value) {
        cancelAnimationFrame(waveAnimationFrame.value);
        waveAnimationFrame.value = null;
      }
      recordingSeconds.value = 0;
      audioWaveHeights.value = Array(30).fill(4);
      
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      previewFile.value = audioFile;
      pendingFileType.value = 'audio';
      showPreview.value = true;
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.value.start();
    isRecording.value = true;
  } catch (err) {
    showError('[ERROR]', 'Cannot access microphone');
  }
}

function animateWaves() {
  const animate = () => {
    if (!isRecording.value) return;
    
    audioWaveHeights.value = audioWaveHeights.value.map((_, index) => {
      const time = Date.now() / 200;
      const wave1 = Math.sin(time + index * 0.5) * 10;
      const wave2 = Math.sin(time * 1.5 + index * 0.3) * 8;
      const randomNoise = Math.random() * 6;
      return Math.max(4, Math.min(28, 14 + wave1 + wave2 + randomNoise));
    });
    
    waveAnimationFrame.value = requestAnimationFrame(animate);
  };
  
  animate();
}

function stopRecording() {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
    isRecording.value = false;
  }
}

function cancelRecording() {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
    isRecording.value = false;
    audioChunks.value = [];
    if (recordingInterval.value) {
      clearInterval(recordingInterval.value);
      recordingInterval.value = null;
    }
    if (waveAnimationFrame.value) {
      cancelAnimationFrame(waveAnimationFrame.value);
      waveAnimationFrame.value = null;
    }
    recordingSeconds.value = 0;
    audioWaveHeights.value = Array(30).fill(4);
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

  const handleResize = () => {
    isMobile.value = window.innerWidth < 768;
  };
  window.addEventListener('resize', handleResize);
});
</script>

