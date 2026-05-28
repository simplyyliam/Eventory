import { create } from 'zustand';

type ModalStore = {
  modalId: string | null;
  openModal: (id: string) => void;
  closeModal: () => void
};

export const useModalStore = create<ModalStore>((set) => ({
    modalId: "",
    openModal: (id) => {
        set({modalId: id})
    },
    closeModal: () => {
        set({modalId: null})
    }
}))