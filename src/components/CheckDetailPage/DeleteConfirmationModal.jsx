import React from "react";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[4px] p-8 flex flex-col items-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[24px] text-[#021024] font-bold mb-8 text-center max-w-[300px]">
          Ви впевнені, що хочете видалити чек?
        </h3>
        <div className="flex gap-5">
          <button
            onClick={onConfirm}
            className="bg-[#456DB4] text-white text-[20px] font-semibold py-3 px-10 rounded-[16px] hover:bg-[#d63f56]"
          >
            Так
          </button>
          <button
            onClick={onClose}
            className="bg-[#B6CDFF] text-[#042860] text-[20px] font-semibold py-3 px-10 rounded-[16px] hover:bg-[#a4c0ff]"
          >
            Ні
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;