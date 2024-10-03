import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { format } from "date-fns";

interface Props {
  tasks: Task[];
  timeframe?: string;
  isAdmin?: boolean;
}

const History = ({ tasks, timeframe, isAdmin }: Props) => {
  const [groupedTasks, setGroupedTasks] = useState<{ [key: string]: { taskList: Task[], completed_tasks_count: number } } | null>(null)

  // Function to group tasks by date
  const groupTasksByDate = (tasks: Task[]) => {
    // Get the current date
    const today = new Date();

    // Calculate the most recent Monday (start of the week)
    const currentDayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
    const daysSinceMonday = (currentDayOfWeek + 6) % 7; // Offset for Monday (getDay() is 0-indexed from Sunday)
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysSinceMonday); // Go back to the most recent Monday
    monday.setHours(0, 0, 0, 0); // Set time to start of the day

    // Calculate the upcoming Sunday (end of the week)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6); // Add 6 days to get Sunday
    sunday.setHours(23, 59, 59, 999); // Set time to the end of the day

    // Calculate the date 7 days ago
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7); // Go back 7 days
    sevenDaysAgo.setHours(0, 0, 0, 0); // Set time to start of the day

    return tasks.reduce((acc: { [key: string]: Task[] }, task) => {
      // Extract the date part (YYYY-MM-DD) from the created_at field
      const taskDate = new Date(task.created_at);

      // Handle different timeframes
      if (timeframe === "weekly") {
        // Filter tasks for the current week (Monday to Sunday)
        if (taskDate < monday || taskDate > sunday) {
          return acc; // Skip tasks outside of this week
        }
      } else if (timeframe === "last7days") {
        // Filter tasks for the last 7 days
        if (taskDate < sevenDaysAgo || taskDate > today) {
          return acc; // Skip tasks outside of the last 7 days
        }
      }

      const date = taskDate.toISOString().split("T")[0];

      // Initialize the array for that date if it doesn't exist
      if (!acc[date]) {
        acc[date] = [];
      }

      // Add the task to the corresponding date
      acc[date].push(task);

      return acc;
    }, {} as { [key: string]: Task[] });
  };

  useEffect(() => { setGroupedTasks(addCompletedTasksCount(groupTasksByDate(tasks))); console.log(addCompletedTasksCount(groupTasksByDate(tasks))) }, [tasks])

  function addCompletedTasksCount(tasks: { [key: string]: Task[] }) {
    const tasksWithCount: { [key: string]: { taskList: Task[], completed_tasks_count: number } } = {};

    // Loop through the object and count completed tasks per day
    for (const [date, taskList] of Object.entries(tasks)) {
      const completedTasks = taskList.filter(task => task.is_complete).length;
      // Add the count to the new object under each date
      tasksWithCount[date] = { taskList, completed_tasks_count: completedTasks };
    }

    return tasksWithCount; // Return the updated object
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {groupedTasks && Object.keys(groupedTasks).length > 0 ? (
          Object.keys(groupedTasks)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort dates in descending order
            .filter((date) => {
              if (!isAdmin) {
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0); // Set to midnight (start of today)

                // Convert the 'date' key (string) to a Date object
                const taskDate = new Date(date);
                taskDate.setHours(0, 0, 0, 0); // Strip time part from the taskDate

                // Only return dates before today if isAdmin is true
                return taskDate < todayStart;
              }
              return true; // If not admin, return all dates
            })
            .map((date, index) => (
              <div key={index}>
                <div className="collapse collapse-arrow bg-black">
                  <input type="radio" name="my-accordion-1" />
                  <div className="collapse-title text-xl font-medium text-white">
                    {format(new Date(date), "EEEE, do MMM")}
                  </div>
                  <div className="collapse-content">
                    <h1 className={`text-white mb-4 text-lg tracking-widest text-center ${groupedTasks[date].completed_tasks_count == groupedTasks[date].taskList.length && "text-success"}`}>Tasks completed: {groupedTasks[date].completed_tasks_count} / {groupedTasks[date].taskList.length}</h1>
                    {groupedTasks[date].taskList
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime()
                      ) // Sort tasks within each date in descending order
                      .map((task, index) => (
                        <li
                          key={index}
                          className={`bg-gray-700 p-4 mb-4 w-full rounded-2xl flex items-center transition-all gap-4 ${task.is_complete
                            ? "line-through bg-green-300/40 text-black/50"
                            : ""
                            }`}
                        >
                          <div
                            className={`rounded-full flex justify-center items-center w-6 aspect-square ${task.is_complete ? "bg-green-500" : "bg-primary"
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
            ))
        ) : (
          <h1>No small wins yet...</h1>
        )}
      </div>
    </div>
  );
}

export default History;