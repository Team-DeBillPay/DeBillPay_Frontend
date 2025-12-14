import React from "react";
import GiveRightsModal from "./GiveRightsModal";
import AddMembersModal from "./AddMembersModal";

const Modals = ({
  isRightsModalOpen,
  setIsRightsModalOpen,
  isAddModalOpen,
  setIsAddModalOpen,
  checkToRender,
  currentUserId,
  onSaveRights,
  onAddFriends,
  canGrantRights,
}) => {
  return (
    <>
      {canGrantRights && (
        <GiveRightsModal
          isOpen={isRightsModalOpen}
          onClose={() => setIsRightsModalOpen(false)}
          participants={checkToRender?.participants?.filter(
            (p) => p.userId.toString() !== currentUserId?.toString()
          )}
          onSave={onSaveRights}
        />
      )}

      <AddMembersModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentParticipants={checkToRender?.participants}
        onAdd={onAddFriends}
      />
    </>
  );
};

export default Modals;
