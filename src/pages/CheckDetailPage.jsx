import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { checksAPI } from "../api/checks";
import { usersAPI } from "../api/users";
import { contactsAPI } from "../api/contacts";
import { getIdFromJWT } from "../utils/jwt";

import CheckHeader from "../components/CheckDetailPage/CheckHeader";
import CheckInfoBlocks from "../components/CheckDetailPage/CheckInfoBlocks";
import ParticipantsTable from "../components/CheckDetailPage/ParticipantsTable";
import PaymentSection from "../components/CheckDetailPage/PaymentSection";
import Modals from "../components/CheckDetailPage/Modals";
import DeleteConfirmationModal from "../components/CheckDetailPage/DeleteConfirmationModal";
import DeleteParticipantModal from "../components/CheckDetailPage/DeleteParticipantModal";
import Loader from "../components/Reuse/Loader";

export default function CheckDetailPage() {
  const { ebillId } = useParams();
  const navigate = useNavigate();
  const [check, setCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({});
  const [organizerUser, setOrganizerUser] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const [isDeleteParticipantModalOpen, setIsDeleteParticipantModalOpen] =
    useState(false);
  const [participantToDelete, setParticipantToDelete] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedCheck, setEditedCheck] = useState(null);
  const [isRightsModalOpen, setIsRightsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [participantsToDelete, setParticipantsToDelete] = useState([]);

  const currentUserId = getIdFromJWT();

  const loadCheckData = async () => {
    try {
      setLoading(true);
      setError(null);

      const checkData = await checksAPI.getCheckById(ebillId);

      const organizerParticipant = checkData.participants.find(
        (p) => p.isAdminRights
      );
      if (organizerParticipant) {
        const organizer = await usersAPI.getUserById(
          organizerParticipant.userId
        );
        setOrganizerUser(organizer);
      }

      const usersData = {};
      for (const participant of checkData.participants) {
        if (!usersData[participant.userId]) {
          const user = await usersAPI.getUserById(participant.userId);
          usersData[participant.userId] = user;
        }
      }
      setUsers(usersData);

      const enrichedCheck = {
        ...checkData,
        participants: checkData.participants.map((participant) => {
          const userData = usersData[participant.userId];
          const firstName = userData?.firstName || "";
          const lastName = userData?.lastName || "";
          const fullName = `${firstName} ${lastName}`.trim();

          return {
            ...participant,
            userName: fullName || `Користувач ${participant.userId}`,
          };
        }),
        currentUserPaymentStatus:
          checkData.participants.find(
            (p) => p.userId.toString() === currentUserId?.toString()
          )?.paymentStatus || "непогашений",
      };

      setCheck(enrichedCheck);
      return enrichedCheck;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ebillId && currentUserId) {
      loadCheckData();
    }
  }, [ebillId, currentUserId]);

  const checkToRender = isEditMode ? editedCheck : check;

  const currentUserParticipant = useMemo(() => {
    return check?.participants.find(
      (p) => p.userId.toString() === currentUserId?.toString()
    );
  }, [check, currentUserId]);

  const isAdmin = currentUserParticipant?.isAdminRights || false;
  const isEditor = currentUserParticipant?.isEditorRights || false;

  const canEditCheck = isAdmin || isEditor;
  const canDeleteCheck = isAdmin;
  const canDeleteParticipants = isAdmin;
  const canGrantRights = isAdmin;

  const handleEnableEditMode = () => {
    if (!canEditCheck) return;
    setIsEditMode(true);
    setEditedCheck(JSON.parse(JSON.stringify(check)));
    setParticipantsToDelete([]);
  };

  const handleSave = async () => {
    if (!editedCheck) return;
    if (!canEditCheck) return;

    try {
      setSaveLoading(true);

      const changes = {
        checkUpdates: {},
        participantUpdates: [],
      };

      if (editedCheck.name !== check.name) {
        changes.checkUpdates.name = editedCheck.name;
      }
      if (editedCheck.description !== check.description) {
        changes.checkUpdates.description = editedCheck.description;
      }
      if (
        parseFloat(editedCheck.amountOfDept) !== parseFloat(check.amountOfDept)
      ) {
        changes.checkUpdates.amountOfDept =
          parseFloat(editedCheck.amountOfDept) || 0;
      }

      editedCheck.participants.forEach((editedParticipant) => {
        const originalParticipant = check.participants.find(
          (p) => p.participantId === editedParticipant.participantId
        );

        if (!originalParticipant) {
          return;
        }

        const participantUpdate = {
          participantId: editedParticipant.participantId,
          userId: editedParticipant.userId,
          changes: {},
        };

        if (editedCheck.scenario === "спільні витрати") {
          const editedPaid = parseFloat(editedParticipant.paidAmount) || 0;
          const originalPaid = parseFloat(originalParticipant.paidAmount) || 0;

          if (editedPaid !== originalPaid) {
            participantUpdate.changes.paidAmount = editedPaid;
          }
        }

        if (editedCheck.scenario === "індивідуальні суми") {
          const editedAssigned =
            parseFloat(editedParticipant.assignedAmount) || 0;
          const originalAssigned =
            parseFloat(originalParticipant.assignedAmount) || 0;

          if (editedAssigned !== originalAssigned) {
            participantUpdate.changes.assignedAmount = editedAssigned;
          }
        }

        if (Object.keys(participantUpdate.changes).length > 0) {
          changes.participantUpdates.push(participantUpdate);
        }
      });

      if (!canDeleteParticipants && participantsToDelete.length > 0) {
        setError("Ви не маєте прав на видалення учасників");
        setParticipantsToDelete([]);
        return;
      }

      if (participantsToDelete.length > 0) {
        for (const participantId of participantsToDelete) {
          await checksAPI.removeParticipant(ebillId, participantId);
        }
      }

      const organizerParticipant = editedCheck.participants.find(
        (p) => p.isAdminRights
      );

      const organizerUpdate = changes.participantUpdates.find(
        (update) => update.participantId === organizerParticipant?.participantId
      );

      if (
        organizerParticipant &&
        (organizerUpdate || Object.keys(changes.checkUpdates).length > 0)
      ) {
        const organizerUpdateData = {
          participantId: organizerParticipant.participantId,
        };

        if (Object.keys(changes.checkUpdates).length > 0) {
          Object.assign(organizerUpdateData, changes.checkUpdates);
        }

        if (organizerUpdate) {
          Object.assign(organizerUpdateData, organizerUpdate.changes);
        }

        await checksAPI.updateParticipants(ebillId, organizerUpdateData);
      }

      const otherParticipantUpdates = changes.participantUpdates.filter(
        (update) => update.participantId !== organizerParticipant?.participantId
      );

      if (otherParticipantUpdates.length > 0) {
        for (const update of otherParticipantUpdates) {
          const participantUpdateData = {
            participantId: update.participantId,
            ...update.changes,
          };

          if (Object.keys(changes.checkUpdates).length > 0) {
            Object.assign(participantUpdateData, changes.checkUpdates);
          }

          await checksAPI.updateParticipants(ebillId, participantUpdateData);
        }
      }

      if (
        participantsToDelete.length > 0 ||
        Object.keys(changes.checkUpdates).length > 0 ||
        changes.participantUpdates.length > 0
      ) {
        await loadCheckData();
      }

      setIsEditMode(false);
      setEditedCheck(null);
      setParticipantsToDelete([]);
    } catch (err) {
      console.error("Помилка при збереженні:", err);

      let errorMessage = "Помилка при збереженні: ";
      if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("CORS")
      ) {
        errorMessage += "Проблема з підключенням до сервера. Спробуйте ще раз.";
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);
      setParticipantsToDelete([]);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedCheck(null);
    setParticipantsToDelete([]);
    setIsDeleteParticipantModalOpen(false);
    setParticipantToDelete(null);
  };

  const handleTitleChange = (val) =>
    setEditedCheck({ ...editedCheck, name: val });

  const handleDescriptionChange = (val) =>
    setEditedCheck({ ...editedCheck, description: val });

  const handleOrganizerExpenseChange = (val) =>
    setEditedCheck({ ...editedCheck, amountOfDept: val });

  const handleParticipantChange = (userId, field, val) => {
    const updatedParticipants = editedCheck.participants.map((p) =>
      p.userId === userId ? { ...p, [field]: val } : p
    );
    setEditedCheck({ ...editedCheck, participants: updatedParticipants });
  };

  const handleAddParticipant = () => {
    if (!canEditCheck) return;
    setIsAddModalOpen(true);
  };

  const handleDeleteParticipant = (userId) => {
    if (!canDeleteParticipants) return;

    const participantToDeleteData = editedCheck.participants.find(
      (p) => p.userId === userId
    );

    if (!participantToDeleteData) {
      setError("Учасника не знайдено");
      return;
    }

    if (participantToDeleteData.isAdminRights) {
      setError("Не можна видалити організатора чеку");
      return;
    }

    setParticipantToDelete({
      userId: participantToDeleteData.userId,
      participantId: participantToDeleteData.participantId,
      userName: participantToDeleteData.userName,
    });
    setIsDeleteParticipantModalOpen(true);
  };

  const handleOpenPermissions = () => {
    if (!canGrantRights) return;
    setIsRightsModalOpen(true);
  };

  const handleSaveRights = async (selectedIds) => {
    if (!canGrantRights) return;

    try {
      const targetParticipants = check.participants.filter((p) => !p.isAdminRights);

      const payload = {
        participants: targetParticipants.map((p) => ({
          participantId: p.participantId,
          isEditorRights: selectedIds.includes(p.userId),
        })),
      };

      await checksAPI.updateEditorRights(ebillId, payload);

      await loadCheckData();
      setIsRightsModalOpen(false);
    } catch (err) {
      console.error("Помилка при видачі прав:", err);
      setError(err.message);
    }
  };

  const handleAddFriends = async (userIds) => {
    try {
      await checksAPI.addParticipants(ebillId, { userIds });

      const updatedCheck = await loadCheckData();

      if (isEditMode) {
        setEditedCheck(JSON.parse(JSON.stringify(updatedCheck)));
      }

      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Помилка при додаванні учасників:", err);
      setError("Ошибка додавання учасників: " + err.message);
    }
  };

  const handleDeleteCheck = async () => {
    if (!canDeleteCheck) return;

    try {
      await checksAPI.deleteCheck(ebillId);
      navigate("/checks");
    } catch (err) {
      console.error("Помилка видалення чека:", err);
      setError(err.message);
      setIsDeleteModalOpen(false);
    }
  };

  const handleOpenDeleteModal = () => {
    if (!canDeleteCheck) return;
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await handleDeleteCheck();
    } catch (err) {}
  };

  const handleConfirmDeleteParticipant = async () => {
    if (!participantToDelete) return;

    try {
      setParticipantsToDelete((prev) => [
        ...prev,
        participantToDelete.participantId,
      ]);

      const updatedParticipants = editedCheck.participants.filter(
        (p) => p.userId !== participantToDelete.userId
      );
      setEditedCheck({ ...editedCheck, participants: updatedParticipants });

      setIsDeleteParticipantModalOpen(false);
      setParticipantToDelete(null);
    } catch (err) {
      console.error("Помилка при додаванні до списку на видалення:", err);
      setError(err.message);
      setIsDeleteParticipantModalOpen(false);
      setParticipantToDelete(null);
    }
  };

  const handleHistoryClick = () => {
    navigate(`/checks/${ebillId}/history`);
  };

  const handleCommentsClick = () => {
    navigate(`/checks/${ebillId}/comments`);
  };

  if (loading) {
    return (
      <div className="p-7 bg-[#B6CDFF] rounded-[32px]">
        <div className="bg-white rounded-[24px] pb-10 min-h-[600px] flex items-center justify-center">
          <Loader text="Завантаження сторінки..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-7 bg-[#B6CDFF] rounded-[32px]">
        <div className="bg-white rounded-[24px] pb-10 min-h-[600px] flex items-center justify-center">
          <p className="text-xl text-red-600">Помилка: {error}</p>
          <button
            onClick={() => navigate("/checks")}
            className="ml-4 bg-[#456DB4] text-white px-4 py-2 rounded-lg"
          >
            Повернутися до чеків
          </button>
        </div>
      </div>
    );
  }

  if (!check) {
    return (
      <div className="p-7 bg-[#B6CDFF] rounded-[32px]">
        <div className="bg-white rounded-[24px] pb-10 min-h-[600px] flex items-center justify-center">
          <p className="text-xl text-[#4B6C9A]">Чек не знайдено</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-7 bg-[#B6CDFF] rounded-[32px]">
      <div className="bg-white rounded-[24px] px-10 pt-7 pb-9">
        <div className="mb-5">
          <CheckHeader
            title={checkToRender.name}
            isUserOrganizer={canEditCheck}
            isEditMode={isEditMode}
            onEditClick={handleEnableEditMode}
            onTitleChange={handleTitleChange}
            onOpenPermissions={handleOpenPermissions}
            onHistoryClick={handleHistoryClick}
            onDeleteCheck={handleOpenDeleteModal}
            onCommentsClick={handleCommentsClick}
            canGrantRights={canGrantRights}
            canDeleteCheck={canDeleteCheck}
          />
        </div>

        <div className="mb-6">
          <CheckInfoBlocks
            check={checkToRender}
            currentUserId={currentUserId}
            isUserOrganizer={canEditCheck}
            organizerUser={organizerUser}
            isEditMode={isEditMode}
            onDescriptionChange={handleDescriptionChange}
            onOrganizerExpenseChange={handleOrganizerExpenseChange}
          />
        </div>

        <ParticipantsTable
          scenario={checkToRender.scenario}
          participants={checkToRender.participants}
          currentUserId={currentUserId}
          organizerId={organizerUser?.userId}
          scenarioMarginBottom="mb-6"
          amountOfDept={checkToRender.amountOfDept}
          currency={checkToRender.currency}
          isEditMode={isEditMode}
          onParticipantChange={handleParticipantChange}
          onAddParticipant={handleAddParticipant}
          onDeleteParticipant={handleDeleteParticipant}
          canDeleteParticipants={canDeleteParticipants}
        />

        {isEditMode ? (
          <div className="flex justify-center gap-6 mt-10">
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="bg-[#456DB4] text-white text-[20px] font-semibold rounded-[16px] py-[20px] w-[226px] hover:bg-[#355a9e] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saveLoading ? "Збереження..." : "Зберегти зміни"}
            </button>
            <button
              onClick={handleCancel}
              disabled={saveLoading}
              className="bg-[#456DB4] text-white text-[20px] font-semibold rounded-[16px] py-[20px] w-[226px] hover:bg-[#355a9e] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Скасувати
            </button>
          </div>
        ) : (
          <PaymentSection
            check={checkToRender}
            ebillId={ebillId}
            currentUserData={currentUserParticipant}
            currency={checkToRender.currency}
            isUserOrganizer={canEditCheck}
            onRefresh={loadCheckData}
          />
        )}
      </div>

      <Modals
        isRightsModalOpen={isRightsModalOpen}
        setIsRightsModalOpen={setIsRightsModalOpen}
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        checkToRender={checkToRender}
        currentUserId={currentUserId}
        onSaveRights={handleSaveRights}
        onAddFriends={handleAddFriends}
        canGrantRights={canGrantRights}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <DeleteParticipantModal
        isOpen={isDeleteParticipantModalOpen}
        onClose={() => {
          setIsDeleteParticipantModalOpen(false);
          setParticipantToDelete(null);
        }}
        onConfirm={handleConfirmDeleteParticipant}
        participantName={participantToDelete?.userName || "учасника"}
      />
    </div>
  );
}
