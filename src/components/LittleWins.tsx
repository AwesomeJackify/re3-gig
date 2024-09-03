import React, { useState } from 'react'
import { Icon } from '@iconify/react';
import { v4 as uuidv4 } from 'uuid';

const LittleWins = () => {

    const exampleTasks = [
        {
            id: uuidv4(),
            name: "Clean the house",
            status: "completed",
        },
        {
            id: uuidv4(),
            name: "Go for a run",
            status: "uncompleted",
        },
        {
            id: uuidv4(),
            name: "Study for exam ",
            status: "uncompleted",
        },
    ];

    const [tasks, setTasks] = useState(exampleTasks)
    const [taskInput, setTaskInput] = useState(""); // Manage input value


    const toggleCompleted = (id: string) => {
        const updatedTasks = tasks.map((task) => {
            if (task.id === id) {
                // Create a new task object with the updated status
                return {
                    ...task,
                    status: task.status === "completed" ? "uncompleted" : "completed",
                };
            }
            return task;
        });

        setTasks(updatedTasks);
    }

    // Handle form submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent page refresh

        if (taskInput.trim()) {
            // Add the new task to the state
            const newTask = {
                id: uuidv4(), // Generate a new ID
                name: taskInput,
                status: "uncompleted", // New tasks start as uncompleted
            };

            setTasks([...tasks, newTask]); // Update tasks with the new task
            setTaskInput(""); // Clear the input field
        }
    };

    return (
        <div
            className="bg-base-200 w-full max-w-screen-sm p-8 flex flex-col gap-8 rounded-2xl"
        >
            <h1 className="text-4xl font-bold text-primary">My Little Wins</h1>
            <ul className="flex flex-col gap-2">
                {
                    tasks.map((task, index) => (
                        <li
                            key={index}
                            className={`bg-white p-4 rounded-2xl flex items-center transition-all gap-4 ${task.status == "completed" ? "line-through  bg-primary/40 text-black/50" : ""}`}
                        >
                            <div
                                className={`rounded-full flex justify-center items-center w-6 aspect-square ${task.status == "completed" ? "bg-primary" : "bg-stone-300"} cursor-pointer`}
                                onClick={() => toggleCompleted(task.id)}

                            >
                                <Icon icon="mdi:check" className="text-sm text-white" />
                            </div>
                            {task.name}
                        </li>
                    ))
                }
            </ul>
            <form onSubmit={handleSubmit}>
                <label
                    className="input input-bordered text-xl flex items-center gap-2 p-4 rounded-2xl"
                >
                    <span className="font-bold">+</span>
                    <input
                        id="task"
                        name="task"
                        type="text"
                        className="grow"
                        required
                        placeholder="Add a task"
                        onChange={(e) => setTaskInput(e.target.value)}
                        value={taskInput}
                    />
                </label>
            </form>
        </div>
    )
}

export default LittleWins