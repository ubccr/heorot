import React from "react";

const ProgressBar = () => {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-600">
      <div className="absolute h-2 animate-loading rounded-full bg-blue-600 dark:bg-neutral-300"></div>
    </div>
  );
};

export default ProgressBar;
