import { AppointmentCard } from "../../../types/appointment.type";
import dayjs from "dayjs";
import { getTimezoneLabelWithOffset } from "./timezone";
import { useState } from "react";
import { EditAppointmentModal } from "./form-edit-appt";
import DeleteAppointmentButton from "./delete-appt";

type Props = {
  appt: AppointmentCard;
  onDeleted?: () => void;
};

const formatDateTime = (
  date: string,
  timeRange: string,
  timezoneLabel: string
) => {
  const [start, end] = timeRange.split(" - ");
  const parsedDate = dayjs(date, "D MMMM YYYY");
  if (!parsedDate.isValid())
    return `Invalid Date (${timeRange}) ${timezoneLabel}`;
  return `${parsedDate.format(
    "D MMMM YYYY"
  )} (${start} - ${end}) ${timezoneLabel}`;
};

export const AppointmentCardView = ({ appt, onDeleted }: Props) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const timezone = appt.creator.preferredTimezone;
  const timezoneLabel = getTimezoneLabelWithOffset(timezone);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  return (
    <div className="bg-white shadow rounded p-4 flex justify-between">
      <div>
        <h2 className="text-xl font-semibold capitalize">{appt.title}</h2>
        <div className="flex justify-between items-start text-sm text-gray-400 my-1">
          <span>
            {formatDateTime(appt.date, appt.timeRange, timezoneLabel)}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Creator: <span className="font-medium">{appt.creator.username}</span>
        </p>
        <p className="text-sm text-gray-500">
          Participants:{" "}
          {appt.participants
            .filter((p) => p.id !== appt.creator.id)
            .map((p) => p.username)
            .join(", ")}
        </p>
      </div>

      <div>
        <button
          onClick={handleEditClick}
          className=" mr-1 text-primary hover:text-secondary cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
            <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
          </svg>
        </button>

        <EditAppointmentModal
          isOpen={isEditModalOpen}
          appointmentId={appt.id}
          initialForm={{
            title: appt.title,
            date: appt.date,
            startTime: appt.timeRange.split(" - ")[0],
            endTime: appt.timeRange.split(" - ")[1],
            inviteeUsernames: appt.participants
              .filter((p) => p.id !== appt.creator.id)
              .map((p) => p.username),
          }}
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
            window.dispatchEvent(new Event("appointment-updated"));
          }}
        />

        <DeleteAppointmentButton
          appointmentId={appt.id}
          onDeleted={onDeleted}
        />
      </div>
    </div>
  );
};
