import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";

interface Props {
  userId: string | undefined;
  tasks: Task[];
  handleUpdateTask: (tasks: Task[]) => void;
}

const LittleWins = ({ userId, tasks, handleUpdateTask }: Props) => {
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

    handleUpdateTask(updatedTasks);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const insertDataDB = async (taskName: string) => {
      const { data, error } = await supabase
        .from("todos")
        .insert({ name: taskName, user_id: userId })
        .select()
        .single();

      return data;
    };
    e.preventDefault(); // Prevent page refresh


    if (taskInput.trim()) {
      const insertedTask = await insertDataDB(taskInput);

      // Add the new task to the state
      const newTask = {
        id: insertedTask.id, // Generate a new ID
        name: taskInput,
        is_complete: false, // New tasks start as uncompleted
        created_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      };

      handleUpdateTask([...tasks, newTask]); // Update tasks with the new task
      setTaskInput(""); // Clear the input field
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: todosData, error: todosError } = await supabase
        .from("todos")
        .select()
        .eq("user_id", userId)

      if (todosData) {
        const tasks = todosData.map((task) => {
          return {
            id: task.id,
            name: task.name,
            is_complete: task.is_complete,
            created_at: task.created_at,
          };
        });

        handleUpdateTask(tasks);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const maxNumOfTasks = 15;
    if (inputRef.current) {
      if (tasks.length >= maxNumOfTasks) {
        inputRef.current.disabled = true;
        inputRef.current.placeholder = `Max number of tasks reached (${maxNumOfTasks})`;
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

    handleUpdateTask(
      tasks.filter((task) => {
        if (task.id === id) {
          deleteTaskDb(task.id);
        }
        return task.id !== id;
      })
    );
  };

  const editTask = (task: Task) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const updateTaskDB = async (id: string, name: string) => {
      await supabase
        .from("todos")
        .update({ name: name })
        .eq("id", id);
    };

    const updatedTasks = tasks.map((t) => {
      if (t.id === task.id) {
        updateTaskDB(task.id, e.target.value);
        return {
          ...t,
          name: e.target.value,
        };
      }
      return t;
    });

    handleUpdateTask(updatedTasks);
  }

  return (
    <div className="bg-base-200 w-full p-8 flex flex-col gap-8 rounded-2xl">
      <h1 className="text-4xl font-bold text-primary">My Small Wins</h1>
      <ul className="flex flex-col gap-2">
        {tasks
          .filter((task) => {
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
            const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

            // Convert task.created_at to a Date object for comparison
            const taskDate = new Date(task.created_at);

            // Compare the taskDate with today's start and end
            return taskDate >= todayStart && taskDate <= todayEnd;
          }).map((task, index) =>
          (
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
              <input type="text" value={task.name} onChange={editTask(task)}></input>
              <Icon
                icon="mdi:close"
                className="text-lg ml-auto text-black/80 cursor-pointer hover:text-primary transition"
                onClick={() => deleteTask(task.id)}
              />
            </li>
          )
          )}
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
