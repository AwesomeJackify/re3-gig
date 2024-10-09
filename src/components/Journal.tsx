import React from "react";

const Journal = () => {
  return (
    <div className="bg-gray-200 h-full w-full p-8 flex flex-col gap-8 rounded-2xl">
      <h1 className="text-4xl font-bold text-primary">My Journal</h1>
      <textarea
        name="journal"
        id="journal"
        placeholder="Today I..."
        className="p-4 max-md:h-44 rounded-2xl h-full resize-none bg-white text-black"
      ></textarea>
      <button className="w-fit btn btn-primary self-end btn-sm">Save</button>
    </div>
  );
};

export default Journal;
