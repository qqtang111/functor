import { create } from 'zustand'

export const useViewStore = create((set) => ({
  /** '2D' | '3D' */
  mode: '2D',
  /** zoom level for 2D canvas (Desmos-like free zoom) */
  zoom: 1,
  /** pan offset for 2D canvas */
  offsetX: 0,
  offsetY: 0,
  /** grid lines visible */
  grid: true,
  /** axes visible */
  axes: true,
  /** point motion animation active */
  motionActive: false,
  /** motion speed multiplier */
  motionSpeed: 1,
  /** current tracked point position for status bar */
  trackerPos: null,

  setMode: (mode) => set({ mode, motionActive: false, trackerPos: null }),
  setZoom: (zoom) => set({ zoom: Math.max(0.05, Math.min(50, zoom)) }),
  zoomIn: () => set((s) => ({ zoom: s.zoom * 1.3 })),
  zoomOut: () => set((s) => ({ zoom: s.zoom / 1.3 })),
  setOffset: (x, y) => set({ offsetX: x, offsetY: y }),
  resetView: () => set({ zoom: 1, offsetX: 0, offsetY: 0 }),
  toggleGrid: () => set((s) => ({ grid: !s.grid })),
  toggleAxes: () => set((s) => ({ axes: !s.axes })),

  toggleMotion: () => set((s) => {
    if (s.motionActive) return { motionActive: false, trackerPos: null }
    return { motionActive: true }
  }),
  setMotionSpeed: (speed) => set({ motionSpeed: speed }),
  setTrackerPos: (pos) => set({ trackerPos: pos }),

  /** screenshot: triggers canvas.toDataURL */
  screenshotPending: false,
  requestScreenshot: () => set({ screenshotPending: true }),
  clearScreenshot: () => set({ screenshotPending: false }),

  /** fullscreen */
  toggleFullscreen: () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  },

  /** 3D enhancements */
  wireframe: false,
  contours: true,
  crossSection: false,
  paramAnim: false,
  paramValue: 1,       // t in f(x,y,t) when animating
  paramSpeed: 1,

  toggleWireframe: () => set((s) => ({ wireframe: !s.wireframe })),
  toggleContours: () => set((s) => ({ contours: !s.contours })),
  toggleCrossSection: () => set((s) => ({ crossSection: !s.crossSection })),
  toggleParamAnim: () => set((s) => ({ paramAnim: !s.paramAnim })),
  setParamValue: (v) => set({ paramValue: v }),
  setParamSpeed: (v) => set({ paramSpeed: v }),

  /** Function demo mode */
  demoActive: false,
  demoFunctionId: null,
  demoProgress: 0,   // 0..1 progress along the curve
  demoSpeed: 1,
  demoPaused: false,

  startDemo: (id) => set({ demoActive: true, demoFunctionId: id, demoProgress: 0, demoPaused: false }),
  stopDemo: () => set({ demoActive: false, demoFunctionId: null, demoProgress: 0 }),
  setDemoProgress: (p) => set({ demoProgress: Math.max(0, Math.min(1, p)) }),
  setDemoSpeed: (s) => set({ demoSpeed: s }),
  toggleDemoPause: () => set((s) => ({ demoPaused: !s.demoPaused })),
}))
