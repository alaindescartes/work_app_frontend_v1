import { CompletedTask } from "@/interfaces/taskInterface";
import { RootState } from "@/redux/store";
import React, { useState } from "react";
import { useSelector } from "react-redux";

type TaskProps = {
  id: number;
  description: string;
  groupHomeId: number;
  residentId?: number | null;
  // status: "pending" | "completed";
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  statusState: "pending" | "completed" | "not-done";
  onStatusChange: (status: "pending" | "completed" | "not-done") => void;
  onComplete: (task: CompletedTask) => void;
};

function Task({
  id,
  description,
  groupHomeId,
  residentId,
  // status,
  completedAt,
  createdAt,
  updatedAt,
  statusState,
  onStatusChange,
  onComplete,
}: TaskProps) {
  const [time, setTime] = useState(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  });

  const [reason, setReason] = useState("");
  const staffId = useSelector(
    (state: RootState) => state.reducer.user.userInfo.staffId
  );

  const handleComplete = () => {
    // cycle status: pending → completed → not‑done → pending …
    const nextStatus =
      statusState === "pending"
        ? "completed"
        : statusState === "completed"
        ? "not-done"
        : "pending";

    // tell parent to update visual status map
    onStatusChange(nextStatus);

    // Build a CompletedTask payload representing the new state
    const payload: CompletedTask = {
      id,
      description,
      groupHomeId,
      residentId: residentId ?? undefined,
      status: nextStatus, // ← actual status (includes "not-done")
      completedAt: nextStatus === "pending" ? undefined : time,
      completedBy: staffId ?? 0,
      createdAt,
      updatedAt,
      reason: nextStatus === "not-done" ? reason : undefined,
    };

    onComplete(payload);
  };

  return (
    <div className="p-5 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition space-y-5">
      <div className="flex flex-col space-y-1">
        <span className="text-sm text-gray-500 font-medium">
          Task Description
        </span>
        <p className="text-base text-gray-800 font-semibold">{description}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-gray-500 font-medium">Status</span>
          <span
            className={`text-sm font-semibold w-fit px-3 py-1 rounded-full ${
              statusState === "completed"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {statusState}
          </span>
        </div>

        <div className="flex flex-col space-y-1">
          <label
            htmlFor={`completed-time-${id}`}
            className="text-sm text-gray-500 font-medium"
          >
            Completed Time
          </label>
          <input
            id={`completed-time-${id}`}
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
          />
        </div>
      </div>

      <div className="flex flex-col items-end space-y-3">
        {statusState === "not-done" && (
          <input
            type="text"
            placeholder="Enter reason for not completing"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-red-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        )}
        <button
          onClick={handleComplete}
          className={`${
            statusState === "completed"
              ? "bg-green-600 hover:bg-green-700"
              : statusState === "not-done"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-purple-600 hover:bg-purple-700"
          } text-white px-5 py-2 rounded-md text-sm font-medium transition`}
        >
          {statusState === "completed"
            ? "Completed"
            : statusState === "not-done"
            ? "Not Done"
            : "Mark as Done"}
        </button>
      </div>
    </div>
  );
}

export default Task;
