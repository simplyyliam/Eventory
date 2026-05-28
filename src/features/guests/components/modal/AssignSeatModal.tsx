import { useModalStore } from '@/store/useModalStore';

export const AssignSeatModal = () => {
  const modalId = useModalStore((s) => s.modalId);
  return (
    <>
      {modalId === "AssignSeat" && (
        <div className="flex items-center justify-center bg-muted backdrop-blur-md rounded-xl w-20 h-40">
          Hello
        </div>
      )}
    </>
  );
};
