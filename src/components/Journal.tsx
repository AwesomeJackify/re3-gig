import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  userId: string | undefined;
}

const Journal = ({ userId }: Props) => {
  const [textArea, setTextArea] = useState("");
  const [journal, setJournal] = useState<Journal>();
  const [isSaving, setIsSaving] = useState(false);
  const [showNotSaved, setShowNotSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Get today's date and set the time to 12:00 AM
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0); // 12:00 AM

      // Get today's date and set the time to 11:59 PM
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999); // 11:59 PM

      // Fetch data from Supabase where the entry timestamp is between startOfDay and endOfDay
      const { data, error } = await supabase
        .from("journals")
        .select()
        .eq("user_id", userId)
        .gte("created_at", startOfDay.toISOString()) // created_at >= 12:00 AM today
        .lte("created_at", endOfDay.toISOString()); // created_at <= 11:59 PM today

      if (error) {
        console.error("Error fetching journal data:", error);
        return;
      }

      // If there are multiple journal entries for today, delete all but the latest one
      if (data && data.length > 1) {
        // Sort the entries by `created_at` (assuming it's the timestamp column)
        const sortedEntries = data.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // The latest entry is the first one in the sorted array
        setJournal(sortedEntries[0]);
        setTextArea(sortedEntries[0].journal_entry);

        // Delete the other entries (all but the first one)
        const oldEntries = sortedEntries.slice(1);
        const oldEntryIds = oldEntries.map((entry) => entry.id);

        const { error: deleteError } = await supabase
          .from("journals")
          .delete()
          .in("id", oldEntryIds);

        if (deleteError) {
          console.error("Error deleting old journal entries:", deleteError);
        }
      } else if (data && data.length === 1) {
        // If only one entry exists, just set it
        setJournal(data[0]);
        setTextArea(data[0].journal_entry);
      }
    };

    fetchData();
  }, [userId]);

  const handleBlur = () => {
    if (textArea != journal?.journal_entry) {
      setShowNotSaved(true);
    } else {
      setShowNotSaved(false);
    }
  };

  const handleSubmit = async () => {
    if (journal) {
      setIsSaving(true);
      const { data, error } = await supabase
        .from("journals")
        .update({
          journal_entry: textArea,
        })
        .eq("id", journal.id);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSaving(false);
      setShowNotSaved(false);
    } else {
      const { error } = await supabase.from("journals").insert({
        user_id: userId,
        journal_entry: textArea,
      });
      setShowNotSaved(false);
    }
  };

  return (
    <div className="bg-gray-200 h-full w-full p-8 flex flex-col gap-8 rounded-2xl">
      <h1 className="text-4xl font-bold text-primary">My Journal</h1>
      <textarea
        name="journal"
        id="journal"
        placeholder="Today I..."
        value={textArea}
        className="p-4 max-md:h-44 rounded-2xl h-full resize-none bg-white text-black"
        onChange={(e) => setTextArea(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevents adding a new line
            handleSubmit(); // Trigger save
          }
        }}
      ></textarea>
      <div className="flex ml-auto gap-2 justify-between w-full">
        <div>
          {showNotSaved && (
            <span className="text-sm font-light">
              Your journal is not saved!
            </span>
          )}
        </div>
        <button
          className="w-fit btn btn-primary self-end btn-sm"
          onClick={handleSubmit}
          type="submit"
        >
          {isSaving ? (
            <span className="loading loading-spinner loading-md text-white"></span>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  );
};

export default Journal;
