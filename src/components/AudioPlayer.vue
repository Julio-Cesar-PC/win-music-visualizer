<template>
  <div class="audio-player">
    <audio ref="audioRef" controls :src="src"></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineExpose } from "vue"

const props = defineProps<{
  src: string | null
}>()

const audioRef = ref<HTMLAudioElement | null>(null)
defineExpose({ audioRef })

watch(
  () => props.src,
  (newSrc) => {
    if (audioRef.value && newSrc) {
      audioRef.value.src = newSrc
    }
  }
)
</script>

<style scoped>
.audio-player {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #222;
  padding: 10px 0 5px 0;
  z-index: 1000;
  box-shadow: 0 -2px 10px #000a;
  display: flex;
  justify-content: center;
}
audio {
  width: 100vw;
}
</style>
