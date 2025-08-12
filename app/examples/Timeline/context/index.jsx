import React, { createContext, useContext } from "react";

// The Timeline main context
const Timeline = createContext();

// Timeline context provider
function TimelineProvider({ children, value }) {
  return <Timeline.Provider value={value}>{children}</Timeline.Provider>;
}

// Timeline custom hook for using context
function useTimeline() {
  return useContext(Timeline);
}

// Default export for the context
const TimelineContext = {
  TimelineProvider,
  useTimeline,
};

export { TimelineProvider, useTimeline };
export default TimelineContext;
