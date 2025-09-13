import { defineStore } from "pinia"

export const useVisualizerStore = defineStore("visualizer", {
  state: () => ({
    audioUrl: null as string | null
  }),

  actions: {
    setAudioUrl(url: string | null) {
      console.log(url)
      this.audioUrl = url
    },
  },
})
