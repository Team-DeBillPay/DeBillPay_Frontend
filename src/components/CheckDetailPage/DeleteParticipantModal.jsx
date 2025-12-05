import React from "react";

const DeleteParticipantModal = ({ isOpen, onClose, onConfirm, participantName }) => {
  if (!isOpen) return null;

  const handleConfirm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm();
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-[4px] p-8 flex flex-col items-center shadow-lg max-w-[400px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[24px] text-[#021024] font-bold mb-8 text-center">
          Ви впевнені, що хочете видалити учасника з чеку?
        </h3>
        
        {participantName && (
          <p className="text-[18px] text-[#042860] mb-8 text-center">
            Учасник: <span className="font-semibold">{participantName}</span>
          </p>
        )}
        
        <div className="flex gap-5">
          <button
            onClick={handleConfirm}
            className="bg-[#456DB4] text-white text-[20px] font-semibold py-3 px-10 rounded-[16px] hover:bg-[#d63f56]"
          >
            Так
          </button>
          <button
            onClick={handleClose}
            className="bg-[#B6CDFF] text-[#042860] text-[20px] font-semibold py-3 px-10 rounded-[16px] hover:bg-[#a4c0ff]"
          >
            Ні
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteParticipantModal;