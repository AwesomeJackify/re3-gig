import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../lib/supabase";

interface Props {
  userId: string | undefined;
}

const LittleWins = ({ userId }: Props) => {
  const [tasks, setTasks] = useState<
    { id: string; name: string; is_complete: boolean }[]
  >([]);
  const [taskInput, setTaskInput] = useState(""); // Manage input value
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleCompleted = (id: string) => {
    const updateTaskDB = async (id: string, is_complete: boolean) => {
      const { data, error } = await supabase
        .from("todos")
        .update({
          is_complete: is_complete,
        })
        .eq("id", id)
        .select();
    };

    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        updateTaskDB(task.id, !task.is_complete);
        // Create a new task object with the updated status
        return {
          ...task,
          is_complete: !task.is_complete,
        };
      }
      return task;
    });

    setTasks(updatedTasks);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const insertDataDB = async (taskName: string) => {
      const { error } = await supabase
        .from("todos")
        .insert({ name: taskName, user_id: userId });
    };
    e.preventDefault(); // Prevent page refresh

    if (taskInput.trim()) {
      // Add the new task to the state
      const newTask = {
        id: uuidv4(), // Generate a new ID
        name: taskInput,
        is_complete: false, // New tasks start as uncompleted
      };

      insertDataDB(taskInput);

      setTasks([...tasks, newTask]); // Update tasks with the new task
      setTaskInput(""); // Clear the input field
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: todosData, error: todosError } = await supabase
        .from("todos")
        .select()
        .eq("user_id", userId);

      if (todosData) {
        const tasks = todosData.map((task) => {
          return {
            id: task.id,
            name: task.name,
            is_complete: task.is_complete,
          };
        });

        setTasks(tasks);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const maxNumOfTasks = 10;
    if (inputRef.current) {
      if (tasks.length >= maxNumOfTasks) {
        console.log(tasks.length);
        inputRef.current.disabled = true;
        inputRef.current.placeholder = `Only ${maxNumOfTasks} tasks allowed`;
      } else {
        inputRef.current.disabled = false;
        inputRef.current.placeholder = "Add a task";
      }
    }
  }, [tasks]);

  const deleteTask = (id: string) => {
    const deleteTaskDb = async (id: string) => {
      await supabase.from("todos").delete().eq("id", id);
    };

    setTasks(
      tasks.filter((task) => {
        if (task.id === id) {
          deleteTaskDb(task.id);
        }
        return task.id !== id;
      })
    );
  };

  return (
    <div className="bg-base-200 w-full max-w-screen-sm p-8 flex flex-col gap-8 rounded-2xl">
      <h1 className="text-4xl font-bold text-primary">My Little Wins</h1>
      <ul className="flex flex-col gap-2">
        {tasks.map((task, index) => (
          <li
            key={index}
            className={`bg-white p-4 w-full rounded-2xl flex items-center transition-all gap-4 ${task.is_complete ? "line-through bg-primary/40 text-black/50" : ""
              }`}
          >
            <div
              className={`rounded-full flex justify-center items-center w-6 aspect-square ${task.is_complete ? "bg-primary" : "bg-stone-300"
                } cursor-pointer`}
              onClick={() => toggleCompleted(task.id)}
            >
              <Icon icon="mdi:check" className="text-sm text-white" />
            </div>
            <h1>{task.name}</h1>
            <Icon
              icon="mdi:close"
              className="text-lg ml-auto text-black/80 cursor-pointer hover:text-primary transition"
              onClick={() => deleteTask(task.id)}
            />
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <label className="input input-bordered text-xl flex items-center gap-2 p-4 rounded-2xl">
          <span className="font-bold">+</span>
          <input
            ref={inputRef}
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
  );
};

export default LittleWins;
