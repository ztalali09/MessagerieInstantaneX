<template>
  <canvas ref="canvas" class="fixed top-0 left-0 w-full h-full pointer-events-none opacity-40 z-[1]" :class="{ 'opacity-20': isMobile }"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const canvas = ref<HTMLCanvasElement | null>(null);
const isMobile = ref(window.innerWidth < 768);
let animationId: number;
let lastFrameTime = 0;
const targetFPS = isMobile.value ? 20 : 30;

onMounted(() => {
  if (!canvas.value) return;

  const ctx = canvas.value.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) return;

  canvas.value.width = window.innerWidth;
  canvas.value.height = window.innerHeight;

  const fontSize = isMobile.value ? 14 : 16;
  const columns = Math.floor(canvas.value.width / fontSize);
  const drops: number[] = Array(columns).fill(0).map(() => Math.floor(Math.random() * -100));

  const matrixChars = isMobile.value 
    ? '01234567890123456789' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'アイウエオカキクケコサシスセソ' + '¢£¥€₹$@#%&*'
    : '01234567890123456789' +
      'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
      'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' +
      'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ' +
      'ابتثجحخدذرزسشصضطظعغفقكلمنهوي' +
      '¢£¥€₹$@#%&*+-=<>[]{}|/\\~^' +
      '░▒▓█▀▄■□▪▫';

  function draw(currentTime: number) {
    if (!canvas.value || !ctx) return;

    const deltaTime = currentTime - lastFrameTime;
    const frameInterval = 1000 / targetFPS;

    if (deltaTime < frameInterval) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    lastFrameTime = currentTime - (deltaTime % frameInterval);

    ctx.fillStyle = isMobile.value ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.03)';
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);

    ctx.font = `${fontSize}px 'Fira Code', monospace`;

    const step = isMobile.value ? 2 : 1;
    for (let i = 0; i < drops.length; i += step) {
      const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      if (isMobile.value) {
        ctx.fillStyle = '#00ff41';
      } else {
        const gradient = ctx.createLinearGradient(x, y - fontSize, x, y + fontSize);
        gradient.addColorStop(0, '#00ff41');
        gradient.addColorStop(0.5, '#00cc33');
        gradient.addColorStop(1, '#003300');
        ctx.fillStyle = gradient;
      }

      ctx.fillText(text, x, y);

      if (!isMobile.value && (drops[i] === 1 || Math.random() > 0.98)) {
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, x, y);
      }

      if (y > canvas.value.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i]++;
    }

    animationId = requestAnimationFrame(draw);
  }

  animationId = requestAnimationFrame(draw);

  const handleResize = () => {
    if (!canvas.value) return;
    canvas.value.width = window.innerWidth;
    canvas.value.height = window.innerHeight;
    isMobile.value = window.innerWidth < 768;
  };

  window.addEventListener('resize', handleResize);

  onUnmounted(() => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', handleResize);
  });
});
</script>

