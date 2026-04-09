import { defineStore } from 'pinia';

export const useMapStore = defineStore('map', {
  state: () => ({
    selectedLayer: 'tdtVecLayer',
    mapCenter: [104.154319, 35.943354] as [number, number],
    zoom: 10
  }),
  getters: {
    lng: (state) => state.mapCenter[0],
    lat: (state) => state.mapCenter[1]
  },
  actions: {
    switchLayer(layerId: string) {
      this.selectedLayer = layerId;
    },
    moveTo(lng: number, lat: number, zoom?: number) {
      this.mapCenter = [lng, lat];
      if (typeof zoom === 'number') {
        this.zoom = zoom;
      }
    }
  }
});
