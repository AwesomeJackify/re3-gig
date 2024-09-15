import React from "react";
import { Icon } from "@iconify/react";
import { format } from "date-fns";

interface Props {
  tasks: Task[];
}

const History = ({ tasks }: Props) => {
  // Function to group tasks by date
  const groupTasksByDate = (tasks: Task[]) => {
    return tasks.reduce((acc: { [key: string]: Task[] }, task) => {
      // Extract the date part (YYYY-MM-DD) from the created_at field
      const date = new Date(task.created_at).toISOString().split("T")[0];
      // Initialize the array for that date if it doesn't exist
      if (!acc[date]) {
        acc[date] = [];
      }
      // Add the task to the corresponding date
      acc[date].push(task);
      return acc;
    }, {} as { [key: string]: Task[] });
  };

  const groupedTasks = groupTasksByDate(tasks);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-bold text-2xl">Past Small Wins</h1>
      <div className="flex flex-col gap-2">
        {Object.keys(groupedTasks)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort dates in descending order
          .filter((date) => {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0); // Set to midnight (start of today)
            // Convert the 'date' key (string) to a Date object
            const taskDate = new Date(date);
            taskDate.setHours(0, 0, 0, 0); // Strip time part from the taskDate
            // Only return dates before today
            return taskDate < todayStart;
          })
          .map((date, index) => (
            <div key={index}>
              <div className="collapse collapse-arrow bg-black">
                <input type="radio" name="my-accordion-1" />
                <div className="collapse-title text-xl font-medium text-white">
                  {format(new Date(date), "EEEE, do MMM")}
                </div>
                <div className="collapse-content">
                  {groupedTasks[date]
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    ) // Sort tasks within each date in descending order
                    .map((task, index) => (
                      <li
                        key={index}
                        className={`bg-gray-700 p-4 mb-4 w-full rounded-2xl flex items-center transition-all gap-4 ${
                          task.is_complete
                            ? "line-through bg-green-300/40 text-black/50"
                            : ""
                        }`}
                      >
                        <div
                          className={`rounded-full flex justify-center items-center w-6 aspect-square ${
                            task.is_complete ? "bg-green-500" : "bg-primary"
                          }`}
                        >
                          {task.is_complete ? (
                            <Icon
                              icon="mdi:check"
                              className="text-sm text-white"
                            />
                          ) : (
                            <Icon
                              icon="mdi:close"
                              className="text-sm text-white"
                            />
                          )}
                        </div>
                        <h1 className="text-white">{task.name}</h1>
                      </li>
                    ))}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default History;