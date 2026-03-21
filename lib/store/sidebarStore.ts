// Store: sidebarStore — controls sidebar collapsed/expanded state
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggle:      () => void
  toggleMobile:() => void
  closeMobile: () => void
  collapse:    () => void
  expand:      () => void
  setCollapsed: (v: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      toggle:      () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      toggleMobile:() => set((s) => ({ isMobileOpen: !s.isMobileOpen })),
      closeMobile: () => set({ isMobileOpen: false }),
      collapse:    () => set({ isCollapsed: true }),
      expand:      () => set({ isCollapsed: false }),
      setCollapsed: (v) => set({ isCollapsed: v }),
    }),
    { name: 'brighter-nepal-sidebar' }
  )
)
