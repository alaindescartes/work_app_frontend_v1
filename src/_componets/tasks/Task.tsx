import React, { useState } from "react";

type TaskProps = {
  id: number;
  description: string;
  groupHomeId: number;
  residentId?: number | null;
  status: "pending" | "completed";
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

function Task({
  id,
  description,
  groupHomeId,
  residentId,
  status,
  completedAt,
  createdAt,
  updatedAt,
}: TaskProps) {
  const [time, setTime] = useState(() => new Date().toISOString().slice(0, 16));

  const handleComplete = () => {
    // Here you can handle marking the task as complete
    console.log(`Task ${id} marked as completed at ${time}`);
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow space-y-4">
      <h2 className="font-bold text-2xl text-purple-700">Task #{id}</h2>
      <div className="space-y-2 text-gray-700">
        <p>
          <span className="font-semibold text-gray-500">Description:</span>{" "}
          {description}
        </p>
        <p>
          <span className="font-semibold text-gray-500">Status:</span>{" "}
          <span
            className={
              status === "completed"
                ? "text-green-600 font-semibold"
                : "text-yellow-600 font-semibold"
            }
          >
            {status}
          </span>
        </p>
        <div>
          <label className="font-semibold text-gray-500">Current Time:</label>
          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="ml-2 border rounded px-2 py-1"
          />
        </div>
        <button
          onClick={handleComplete}
          className="mt-3 inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          Mark as Completed
        </button>
      </div>
    </div>
  );
}

export default Task;
