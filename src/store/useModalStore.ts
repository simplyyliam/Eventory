import { create } from 'zustand';

type ModalStore = {
  modalId: string;
  isModalOpen: boolean
  openModal: (id: string) => void;
  closeModal: () => void
};

export const useModalStore = create<ModalStore>((set, get) => ({
    modalId: "",
    isModalOpen: false,
    openModal: (id) => {
        const {isModalOpen, modalId} = get() 
        if(modalId === id && isModalOpen) return

        set({modalId: id, isModalOpen: true})
    },
    closeModal: () => {
        set({modalId: "", isModalOpen: false})
    }
}))