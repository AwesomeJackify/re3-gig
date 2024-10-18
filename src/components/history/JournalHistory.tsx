import React, { useEffect, useState } from "react";
import { format } from "date-fns";

interface JournalHistoryProps {
  journals?: Journal[];
  isAdmin?: boolean;
  timeframe?: string;
}

const JournalHistory = ({
  journals,
  isAdmin,
  timeframe,
}: JournalHistoryProps) => {
  const [groupedJournals, setGroupedJournals] = useState<{
    [key: string]: Journal;
  } | null>(null);

  // Function to group journals by date
  const groupJournalsByDate = (journals: Journal[]) => {
    return journals.reduce((acc: { [key: string]: Journal }, journal) => {
      const journalDate = new Date(journal.created_at);
      const date = journalDate.toISOString().split("T")[0];

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

      // Handle different timeframes
      if (timeframe === "weekly") {
        // Filter tasks for the current week (Monday to Sunday)
        if (journalDate < monday || journalDate > sunday) {
          return acc; // Skip tasks outside of this week
        }
      } else if (timeframe === "last7days") {
        // Filter tasks for the last 7 days
        if (journalDate < sevenDaysAgo || journalDate > today) {
          return acc; // Skip tasks outside of the last 7 days
        }
      }

      if (!acc[date]) {
        acc[date] = journal;
      }

      return acc;
    }, {} as { [key: string]: Journal });
  };

  useEffect(() => {
    if (journals) {
      setGroupedJournals(groupJournalsByDate(journals));
    }
  }, [journals]);
  return (
    <div className="flex flex-col gap-1">
      {journals && groupedJournals ? (
        Object.keys(groupedJournals)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
          .filter((date) => {
            if (!isAdmin) {
              const todayStart = new Date();
              todayStart.setHours(0, 0, 0, 0);
              const journalDate = new Date(date);
              journalDate.setHours(0, 0, 0, 0);

              return journalDate < todayStart;
            }
            return true;
          }).length > 0 ? (
          Object.keys(groupedJournals)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .filter((date) => {
              if (!isAdmin) {
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const journalDate = new Date(date);
                journalDate.setHours(0, 0, 0, 0);

                return journalDate < todayStart;
              }
              return true;
            })
            .map((date, index) => (
              <div key={index}>
                <div className="collapse collapse-arrow bg-black">
                  <input type="radio" name="my-accordion-1" />
                  <div className="collapse-title text-xl font-medium text-white">
                    {format(new Date(date), "EEEE, do MMM")}
                  </div>
                  <div className="collapse-content">
                    <textarea
                      disabled
                      className="p-4 max-md:h-44 rounded-2xl h-full resize-none bg-white/80 text-black w-full"
                    >
                      {groupedJournals[date].journal_entry}
                    </textarea>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <h1>No journals yet...</h1>
        )
      ) : (
        <h1>No journals yet...</h1>
      )}
    </div>
  );
};

export default JournalHistory;
