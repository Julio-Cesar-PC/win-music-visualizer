<template>
  <div class="app">
    <h1>🎶 Music Visualizer</h1>

    <div class="dropzone" @dragover.prevent @drop.prevent="onDrop" @click="fileInput?.click()">
      <p>Arraste sua música aqui ou clique para selecionar</p>
      <input
        type="file"
        accept="audio/*"
        ref="fileInput"
        style="display: none"
        @change="onFileChange"
      />
    </div>

    <Visualizer v-if="store.audioUrl" :audioRef="audioRef" ref="visualizerRef" />
    <button v-if="store.audioUrl" @click="goFullscreen">🖥️ Tela cheia</button>

    <AudioPlayer ref="audioPlayerRef" :src="store.audioUrl" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useVisualizerStore } from '../stores/useVisualizerStore'
import Visualizer from '../components/MusicVisualizer.vue'
import AudioPlayer from '../components/AudioPlayer.vue'

const store = useVisualizerStore()

const fileInput = ref<HTMLInputElement | null>(null)
const visualizerRef = ref()
const audioPlayerRef = ref()

const audioRef = ref<HTMLAudioElement | null>(null)
watch(
  () => audioPlayerRef.value?.audioRef,
  (val) => {
    audioRef.value = val
  },
  { immediate: true },
)

onMounted(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (!visualizerRef.value) return
    if (e.key === 'ArrowRight') {
      visualizerRef.value.mode = (visualizerRef.value.mode + 1) % 8
    }
    if (e.key === 'ArrowLeft') {
      visualizerRef.value.mode = (visualizerRef.value.mode + 7) % 8
    }
  }
  window.addEventListener('keydown', handleKey)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKey)
  })
})

function goFullscreen() {
  const canvas = visualizerRef.value?.canvas
  if (canvas && canvas.requestFullscreen) {
    canvas.requestFullscreen()
  } else {
    alert('Seu navegador não suporta fullscreen aqui.')
  }
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  handleFile(file)
}

function onDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  handleFile(file)
}

function handleFile(file?: File) {
  if (!file) return
  const url = URL.createObjectURL(file)
  store.setAudioUrl(url)
}
</script>

<style scoped>
.app {
  text-align: center;
  padding: 20px;
  color: white;
  background: #111;
  min-height: 100vh;
  padding-bottom: 70px; /* espaço para o player fixo */
}
.dropzone {
  border: 2px dashed #555;
  padding: 20px;
  margin: 20px auto;
  max-width: 400px;
  cursor: pointer;
}
button {
  margin: 20px;
  padding: 10px 20px;
}
a {
  display: block;
  margin-top: 10px;
  color: lime;
}
</style>
