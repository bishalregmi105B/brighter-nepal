// Store: sidebarStore — controls sidebar collapsed/expanded state
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isCollapsed: boolean
  toggle:      () => void
  collapse:    () => void
  expand:      () => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggle:  () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      collapse: () => set({ isCollapsed: true }),
      expand:   () => set({ isCollapsed: false }),
    }),
    { name: 'brighter-nepal-sidebar' }
  )
)
