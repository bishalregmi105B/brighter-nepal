// Store: uiStore — global UI state (modals, drawers, toasts)
import { create } from 'zustand'

interface UiState {
  // Submit confirm modal (exam)
  isSubmitModalOpen:    boolean
  openSubmitModal:      () => void
  closeSubmitModal:     () => void

  // Tab switch warning modal
  isTabWarningOpen:     boolean
  tabWarningCount:      number
  openTabWarning:       (count: number) => void
  closeTabWarning:      () => void

  // User detail drawer (admin)
  drawerUserId:         string | null
  openUserDrawer:       (userId: string) => void
  closeUserDrawer:      () => void

  // Mobile sidebar
  isMobileSidebarOpen:  boolean
  openMobileSidebar:    () => void
  closeMobileSidebar:   () => void
}

export const useUiStore = create<UiState>()((set) => ({
  isSubmitModalOpen:   false,
  openSubmitModal:     () => set({ isSubmitModalOpen: true }),
  closeSubmitModal:    () => set({ isSubmitModalOpen: false }),

  isTabWarningOpen:    false,
  tabWarningCount:     0,
  openTabWarning:      (count) => set({ isTabWarningOpen: true, tabWarningCount: count }),
  closeTabWarning:     () => set({ isTabWarningOpen: false }),

  drawerUserId:        null,
  openUserDrawer:      (userId) => set({ drawerUserId: userId }),
  closeUserDrawer:     () => set({ drawerUserId: null }),

  isMobileSidebarOpen: false,
  openMobileSidebar:   () => set({ isMobileSidebarOpen: true }),
  closeMobileSidebar:  () => set({ isMobileSidebarOpen: false }),
}))
