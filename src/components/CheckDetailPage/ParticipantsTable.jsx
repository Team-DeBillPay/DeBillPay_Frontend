import React from "react";
import addIcon from "../../assets/icons/add.png";
import deleteIcon from "../../assets/icons/trash.png";

const ParticipantsTable = ({
  scenario,
  participants,
  currentUserId,
  organizerId,
  scenarioMarginBottom,
  amountOfDept,
  currency,
  isEditMode,
  onParticipantChange,
  onAddParticipant,
  onDeleteParticipant,
}) => {
  const formatName = (userId, name, isCurrentUser) => {
    return isCurrentUser ? `${name} (Я)` : name;
  };

  const filteredParticipants = participants.filter((p) =>
    scenario === "спільні витрати" ? true : !p.isAdminRights
  );

  const getScenarioDisplayName = (scenario) => {
    switch (scenario) {
      case "рівний розподіл":
        return "Рівний розподіл";
      case "індивідуальні суми":
        return "Індивідуальні суми";
      case "спільні витрати":
        return "Спільні витрати";
      default:
        return scenario;
    }
  };

  const canEditAssignedAmount = (scenario) => {
    return scenario === "індивідуальні суми";
  };

  const canEditPaidAmount = (scenario) => {
    return scenario === "спільні витрати";
  };

  const scenarioInfo = (
    <div
      className={`${
        scenarioMarginBottom || "mb-6"
      } flex justify-between items-center`}
    >
      <div className="flex items-center gap-4">
        <h3 className="text-[20px] text-[#021024] font-semibold">
          Сценарій розрахунку:
        </h3>
        <p className="text-[20px] text-[#042860]">
          {getScenarioDisplayName(scenario)}
        </p>
      </div>

      {scenario === "спільні витрати" && (
        <div className="flex items-center gap-4">
          <h3 className="text-[20px] text-[#021024] font-semibold">
            Загальні витрати:
          </h3>
          <p className="text-[20px] text-[#042860] font-semibold">
            {amountOfDept} {currency}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {scenarioInfo}

      {isEditMode && (
        <div className="mb-6">
          <button
            onClick={onAddParticipant}
            className="flex items-center bg-[#EBF1FF] border border-[#7B9CCA] rounded-[4px] py-[16px] px-[36px] hover:bg-[#dbe5ff]"
          >
            <img
              src={addIcon}
              alt="Add"
              className="w-[20px] h-[20px] mr-[20px]"
            />
            <span className="text-[#042860] text-[18px] font-medium">
              Додати нового учасника
            </span>
          </button>
        </div>
      )}

      <table className="w-full border-collapse border border-[#8A9CCB] table-fixed">
        <thead className="bg-[#B6CDFF] text-center text-[14px] text-[#021024] font-semibold">
          <tr>
            <th className="p-3 border border-[#8A9CCB]">Учасники чеку</th>
            {scenario === "спільні витрати" ? (
              <>
                <th className="p-3 border border-[#8A9CCB]">
                  Сума, яку витратив
                </th>
                <th className="p-3 border border-[#8A9CCB]">
                  Сума, яку має сплатити
                </th>
                <th className="p-3 border border-[#8A9CCB]">Вже сплатив</th>
                <th className="p-3 border border-[#8A9CCB]">Різниця</th>
              </>
            ) : (
              <>
                <th className="p-3 border border-[#8A9CCB]">
                  Сума, яку має сплатити
                </th>
                <th className="p-3 border border-[#8A9CCB]">Сплачено</th>
                <th className="p-3 border border-[#8A9CCB]">Залишок боргу</th>
              </>
            )}
            {isEditMode && (
              <th className="p-3 border border-[#8A9CCB] w-[60px]"></th>
            )}
          </tr>
        </thead>
        <tbody className="text-left text-[18px] text-[#042860]">
          {filteredParticipants.map((p) => {
            const difference = (p.paidAmount || 0) - (p.assignedAmount || 0);
            const isOverpaid = difference > 0;
            const isUnderpaid = difference < 0;
            const debt = (p.assignedAmount || 0) - (p.balance || 0);

            const isCurrentUser =
              p.userId.toString() === currentUserId?.toString();

            return (
              <tr key={p.userId}>
                <td className="p-3 border border-[#8A9CCB] font-semibold">
                  {formatName(p.userId, p.userName, isCurrentUser)}
                </td>

                {scenario === "спільні витрати" ? (
                  <>
                    {/* Спільні витрати: Редагуємо ТІЛЬКИ 'paidAmount' */}
                    <td className="p-3 border border-[#8A9CCB]">
                      {isEditMode && canEditPaidAmount(scenario) ? (
                        <input
                          type="number"
                          value={p.paidAmount || 0}
                          onChange={(e) =>
                            onParticipantChange(
                              p.userId,
                              "paidAmount",
                              e.target.value
                            )
                          }
                          className="w-full bg-transparent border-b border-[#042860] focus:outline-none"
                        />
                      ) : (
                        `${p.paidAmount || 0} ${currency}`
                      )}
                    </td>
                    <td className="p-3 border border-[#8A9CCB]">
                      {p.assignedAmount || 0} {currency}
                    </td>
                    <td className="p-3 border border-[#8A9CCB]">
                      {p.balance || 0} {currency}
                    </td>
                    <td
                      className={`p-3 font-semibold text-[18px] border border-[#8A9CCB] ${
                        isUnderpaid
                          ? "text-[#E5566C]"
                          : isOverpaid
                          ? "text-[#7BE495]"
                          : "text-[#042860]"
                      }`}
                    >
                      {difference > 0 ? `+${difference}` : difference}{" "}
                      {currency}
                    </td>
                  </>
                ) : (
                  <>
                    {/* Інші сценарії: Редагуємо ТІЛЬКИ 'assignedAmount' в індивідуальних сумах */}
                    <td className="p-3 border border-[#8A9CCB]">
                      {isEditMode && canEditAssignedAmount(scenario) ? (
                        <input
                          type="number"
                          value={p.assignedAmount || 0}
                          onChange={(e) =>
                            onParticipantChange(
                              p.userId,
                              "assignedAmount",
                              e.target.value
                            )
                          }
                          className="w-full bg-transparent border-b border-[#042860] focus:outline-none"
                        />
                      ) : (
                        `${p.assignedAmount || 0} ${currency}`
                      )}
                    </td>
                    <td className="p-3 border border-[#8A9CCB]">
                      {p.balance || 0} {currency}
                    </td>
                    <td className="p-3 font-semibold border border-[#8A9CCB]">
                      {debt} {currency}
                    </td>
                  </>
                )}

                {isEditMode && (
                  <td className="p-3 border border-[#8A9CCB] text-center">
                    <button
                      onClick={() => onDeleteParticipant(p.userId)}
                      title="Видалити учасника"
                    >
                      <img
                        src={deleteIcon}
                        alt="Del"
                        className="w-[20px] h-[20px] mx-auto"
                      />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default ParticipantsTable;