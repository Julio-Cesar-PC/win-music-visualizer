<template>
  <canvas ref="canvas" width="800" height="400"></canvas>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from "vue"

const props = defineProps<{
  audioRef: HTMLAudioElement | null
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let audioCtx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let source: MediaElementAudioSourceNode | null = null
let dataArray: Uint8Array

const mode = ref(0)
defineExpose({ canvas, mode })
const MODES = 8
let intervalId: number | undefined

function draw() {
  requestAnimationFrame(draw)
  if (!analyser || !ctx || !canvas.value) return

  analyser.getByteFrequencyData(dataArray)

  const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length
  const hue = (avg + Date.now()/50) % 360
  const saturation = 65
  const lightness = 15

ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.15)`
ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

  switch (mode.value) {
    case 0: drawBars(); break
    case 1: drawCircles(); break
    case 2: drawWave(); break
    case 3: drawSpiral(); break
    case 4: drawParticles(); break
    case 5: drawConcentric(); break
    case 6: drawRibbons(); break
    case 7: drawWaveTunnel(); break
  }
}

function drawBars() {
  const barWidth = (canvas.value!.width / dataArray.length) * 2.5
  let x = 0
  const maxVal = Math.max(...dataArray) || 1

  for (let i = 0; i < dataArray.length; i++) {
    const normalized = dataArray[i] / maxVal
    const barHeight = normalized * canvas.value!.height * 0.9

    ctx!.fillStyle = `hsl(${(i*10 + Date.now()/100) % 360}, 70%, ${30 + 20*normalized}%)`
    const distortion = Math.sin(Date.now() / 200 + i) * 5
    ctx!.fillRect(x, canvas.value!.height - barHeight + distortion, barWidth, barHeight)

    x += barWidth + 1
  }
}

function drawCircles() {
  const centerX = canvas.value!.width / 2
  const centerY = canvas.value!.height / 2
  const maxRadius = Math.min(centerX, centerY) * 0.9
  ctx!.save()
  ctx!.globalAlpha = 0.7
  for (let i = 0; i < dataArray.length; i += 2) {
    const radius = (dataArray[i] / 255) * maxRadius
    const angle = (i / dataArray.length) * Math.PI * 2 + Date.now()/1000
    const offsetX = Math.cos(angle) * 50
    const offsetY = Math.sin(angle) * 50

    ctx!.beginPath()
    ctx!.arc(centerX + offsetX, centerY + offsetY, radius, 0, 2 * Math.PI)
    ctx!.strokeStyle = `hsl(${(i*8 + Date.now()/120) % 360}, 70%, ${40 + 20*(dataArray[i]/255)}%)`
    ctx!.lineWidth = 3 + 2 * Math.sin(Date.now()/500 + i)
    ctx!.stroke()
  }
  ctx!.restore()
}

function drawWave() {
  if (!canvas.value || !ctx) return
  const width = canvas.value.width
  const height = canvas.value.height

  ctx.save()
  ctx.beginPath()

  const smoothFactor = 0.25
  const amplitude = height * 0.25

  for (let i = 0; i < dataArray.length; i++) {
    const x = (i / dataArray.length) * width
    // combinamos sin, média do áudio e suavização
    const normalized = (dataArray[i] / 255)
    const y = height / 2 + Math.sin(i * smoothFactor + Date.now()/500) * amplitude + (normalized - 0.5) * amplitude

    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }

  // Stroke suave e psicodélico
  const hue = (Date.now()/5) % 360
  ctx.strokeStyle = `hsl(${hue}, 80%, 65%)`
  ctx.lineWidth = 4
  ctx.shadowColor = `hsl(${(hue+60)%360}, 100%, 70%)`
  ctx.shadowBlur = 15
  ctx.stroke()
  ctx.restore()
}

// NOVAS VISUALIZAÇÕES PSICODÉLICAS

function drawSpiral() {
  if (!canvas.value || !ctx) return
  const centerX = canvas.value.width / 2
  const centerY = canvas.value.height / 2
  const maxRadius = Math.min(centerX, centerY)
  ctx.save()
  ctx.globalAlpha = 0.6
  for (let i = 0; i < dataArray.length; i++) {
    const angle = (i / dataArray.length) * Math.PI * 10 + Date.now() / 500
    const radius = (dataArray[i] / 255) * maxRadius
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, 2 * Math.PI)
    ctx.fillStyle = `hsl(${(i*15 + Date.now()/10) % 360}, 100%, 60%)`
    ctx.fill()
  }
  ctx.restore()
}

function drawParticles() {
  if (!canvas.value || !ctx) return
  const centerX = canvas.value.width / 2
  const centerY = canvas.value.height / 2
  ctx.save()
  for (let i = 0; i < dataArray.length; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = (dataArray[i] / 255) * canvas.value.width / 2
    const x = centerX + Math.cos(angle + Date.now()/1000) * radius
    const y = centerY + Math.sin(angle + Date.now()/1000) * radius
    ctx.beginPath()
    ctx.arc(x, y, 2 + Math.random() * 3, 0, 2*Math.PI)
    ctx!.fillStyle = `hsl(${(i*12 + Date.now()/80) % 360}, 65%, ${50 + 15*(dataArray[i]/255)}%)`
    ctx.fill()
  }
  ctx.restore()
}

function drawConcentric() {
  if (!canvas.value || !ctx) return
  const cx = canvas.value.width/2
  const cy = canvas.value.height/2
  ctx.save()
  ctx.globalAlpha = 0.6
  for (let i = 0; i < dataArray.length; i+=2) {
    const radius = (dataArray[i]/255) * canvas.value.height/2
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, 2*Math.PI)
    ctx.strokeStyle = `hsl(${(i*20 + Date.now()/10)%360}, 100%, 60%)`
    ctx.lineWidth = 2 + i%5
    ctx.stroke()
  }
  ctx.restore()
}

function drawRibbons() {
  if (!canvas.value || !ctx) return
  ctx.save()
  ctx.beginPath()
  for (let i = 0; i < dataArray.length; i++) {
    const x = (i / dataArray.length) * canvas.value.width
    const y = canvas.value.height/2 + Math.sin(i/5 + Date.now()/300) * dataArray[i]
    if (i===0) ctx.moveTo(x,y)
    else ctx.lineTo(x,y)
  }
  ctx.strokeStyle = `hsl(${(Date.now()/2)%360}, 100%, 70%)`
  ctx.lineWidth = 3
  ctx.shadowColor = "#fff"
  ctx.shadowBlur = 10
  ctx.stroke()
  ctx.restore()
}

function drawWaveTunnel() {
  if (!canvas.value || !ctx) return
  const cx = canvas.value.width/2
  const cy = canvas.value.height/2
  ctx.save()
  ctx.globalAlpha = 0.7
  for (let i = 0; i < dataArray.length; i++) {
    const angle = (i / dataArray.length) * Math.PI * 4 + Date.now()/500
    const radius = (dataArray[i]/255) * (canvas.value.width/3)
    const x = cx + Math.cos(angle)*radius
    const y = cy + Math.sin(angle)*radius
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, 2*Math.PI)
    ctx.fillStyle = `hsl(${(i*15 + Date.now()/5)%360}, 100%, 65%)`
    ctx.fill()
  }
  ctx.restore()
}

function setupAudio() {
  const audio = props.audioRef
  if (!audio || !audio.src) return

  // Libera o contexto antigo se houver
  if (audioCtx) {
    audioCtx.close()
    audioCtx = null
  }

  audioCtx = new AudioContext()
  analyser = audioCtx.createAnalyser()
  source = audioCtx.createMediaElementSource(audio)
  source.connect(analyser)
  analyser.connect(audioCtx.destination)

  analyser.fftSize = 256
  const bufferLength = analyser.frequencyBinCount
  dataArray = new Uint8Array(bufferLength)

  draw()
}

// Sempre que o audioRef mudar OU o áudio começar a tocar, inicializa o visualizador
watch(
  () => props.audioRef,
  (audio, _, onCleanup) => {
    if (!audio) return
    const onPlay = () => setupAudio()
    audio.addEventListener("play", onPlay)
    // Se já está tocando, inicializa imediatamente
    if (!audio.paused) setupAudio()
    onCleanup(() => {
      audio.removeEventListener("play", onPlay)
    })
  },
  { immediate: true }
)

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext("2d")
  }
  intervalId = window.setInterval(() => {
    mode.value = (mode.value + 1) % MODES
  }, 10000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (audioCtx) audioCtx.close()
})
</script>

<style scoped>
canvas {
  display: block;
  margin: 20px auto;
  background: black;
}
</style>
