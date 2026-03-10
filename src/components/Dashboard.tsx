import { useEffect, useState } from "react";
import SmallWins from "./SmallWins";
import { supabase } from "../lib/supabase";
import History from "./history/History";
import DashboardLayout from "../layouts/DashboardLayout";
import JournalComponent from "./Journal";
import type { Task, Journal as JournalType } from "../types";

interface Props {
  currentUserId: string;
  name: string;
}

const Dashboard = ({ currentUserId, name }: Props) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [journals, setJournals] = useState<JournalType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: todosData } = await supabase
        .from("todos")
        .select()
        .eq("user_id", currentUserId);

      const { data: journalsData } = await supabase
        .from("journals")
        .select()
        .eq("user_id", currentUserId);

      if (todosData) {
        const tasks = todosData.map((task) => {
          return {
            id: task.id,
            name: task.name,
            user_id: task.user_id,
            is_complete: task.is_complete,
            created_at: task.created_at,
          };
        });

        setTasks(tasks);
      }
      if (journalsData) {
        const journals = journalsData.map((journal) => {
          return {
            id: journal.id,
            journal_entry: journal.journal_entry,
            user_id: journal.user_id,
            created_at: journal.created_at,
          };
        });

        setJournals(journals);
      }
    };

    fetchData();
  }, []);

  const updateTasks = (tasks: Task[]) => {
    setTasks(tasks);
  };

  return (
    <DashboardLayout name={name} showCourse>
      <div className="flex flex-col gap-16">
        <div className="grid grid-cols-2 gap-8 max-md:grid-cols-1">
          <SmallWins
            userId={currentUserId}
            tasks={tasks}
            handleUpdateTask={updateTasks}
          />
          <JournalComponent userId={currentUserId} />
        </div>
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-8">
          <div className="flex flex-col gap-4 w-full">
            <h1 className="font-bold text-2xl">Past Small Wins</h1>
            <History tasks={tasks} timeframe="last7days" />
          </div>
          <div className="flex flex-col gap-4 w-full">
            <h1 className="font-bold text-2xl">Past Journal Entries</h1>
            <History journals={journals} timeframe="last7days" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
