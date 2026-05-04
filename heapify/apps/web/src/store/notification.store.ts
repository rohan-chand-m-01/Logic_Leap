import { create } from "zustand";

interface Notification { id: string; message: string }
interface NotificationStore {
  items: Notification[];
  push: (item: Notification) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  items: [],
  push: (item) => set((s) => ({ items: [item, ...s.items].slice(0, 50) })),
}));

