import React from 'react'
import { Icon } from '@iconify/react';
import { format } from 'date-fns';

interface Props {
    tasks: Task[];
}

const History = ({ tasks }: Props) => {
    // Function to group tasks by date
    const groupTasksByDate = (tasks: Task[]) => {
        return tasks.reduce((acc: { [key: string]: Task[] }, task) => {
            // Extract the date part (YYYY-MM-DD) from the created_at field
            const date = new Date(task.created_at).toISOString().split('T')[0];

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
        <div className='flex flex-col gap-4'>
            <h1 className='font-bold text-2xl'>Past small wins</h1>
            <div className='flex flex-col gap-2'>
                {Object.keys(groupedTasks)
                    .filter((date) => {
                        const todayStart = new Date();
                        todayStart.setHours(0, 0, 0, 0); // Set to midnight (start of today)
                        // Convert the 'date' key (string) to a Date object
                        const taskDate = new Date(date);
                        taskDate.setHours(0, 0, 0, 0); // Strip time part from the taskDate
                        console.log(todayStart, taskDate);
                        // Only return dates before today
                        return taskDate < todayStart;
                    }).map((date, index) =>
                    (
                        <div key={index}>
                            <div className="collapse collapse-arrow bg-base-200">
                                <input type="radio" name="my-accordion-1" />
                                <div className="collapse-title text-xl font-medium">{format(date, "EEEE, do MMM")}</div>
                                <div className="collapse-content">
                                    {groupedTasks[date].map((task, index) => (
                                        <li
                                            key={index}
                                            className={`bg-white p-4 mb-4 w-full rounded-2xl flex items-center transition-all gap-4 ${task.is_complete ? "line-through bg-primary/40 text-black/50" : ""
                                                }`}
                                        >
                                            <div
                                                className={`rounded-full flex justify-center items-center w-6 aspect-square ${task.is_complete ? "bg-primary" : "bg-stone-300"
                                                    }`}
                                            >
                                                <Icon icon="mdi:check" className="text-sm text-white" />
                                            </div>
                                            <h1>{task.name}</h1>
                                        </li>
                                    )
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                    )}
            </div>
        </div>
    )
}

export default History