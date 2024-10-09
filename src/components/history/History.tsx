import React from "react";
import TaskHistory from "./TaskHistory";
import JournalHistory from "./JournalHistory";

interface Props {
  tasks?: Task[];
  journals?: Journal[];
  timeframe?: string;
  isAdmin?: boolean;
}

const History = ({ tasks, journals, timeframe, isAdmin }: Props) => {
  return (
    <div>
      {tasks ? (
        <TaskHistory tasks={tasks} timeframe={timeframe} isAdmin={isAdmin} />
      ) : (
        <JournalHistory
          journals={journals}
          timeframe={timeframe}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default History;
