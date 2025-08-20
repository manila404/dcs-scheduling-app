import React, { useMemo } from 'react';
import { allTimeSlots, timeToMinutes } from '../utils/timeUtils';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// A color palette for the schedule blocks
const colorPalette = [
  "bg-blue-500", "bg-green-500", "bg-yellow-600",
  "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-red-500"
];

const TimetablePreview = ({ schedules }) => {

  const positionedSchedules = useMemo(() => {
    // This function calculates the grid position for each schedule
    const startMinutes = timeToMinutes('7:00 AM');
    return schedules.map((schedule, index) => {
      if (!schedule.startTime || !schedule.duration) {
        return null;
      }
      const scheduleStartMinutes = timeToMinutes(schedule.startTime);
      
      // Ensure a minimum duration of 60 minutes for VISUAL rendering
      const visualDuration = Math.max(schedule.duration, 60);
      const scheduleEndMinutes = scheduleStartMinutes + visualDuration;

      // +2 because grid rows/cols are 1-based and the first is for the header
      const gridRowStart = ((scheduleStartMinutes - startMinutes) / 30) + 2;
      const gridRowEnd = ((scheduleEndMinutes - startMinutes) / 30) + 2;
      const gridColumnStart = daysOfWeek.indexOf(schedule.day) + 2;
      
      if (gridColumnStart < 2) {
        return null;
      }

      return {
        ...schedule,
        gridRow: `${gridRowStart} / ${gridRowEnd}`,
        gridColumn: `${gridColumnStart}`,
        bgColor: colorPalette[index % colorPalette.length],
      };
    }).filter(Boolean);
  }, [schedules]);

  return (
    <div className="w-full h-[60vh] overflow-auto border border-border rounded-lg bg-background">
      <div 
        className="grid relative min-w-[800px]" 
        style={{
          // THE FIX: Unified grid definition
          gridTemplateColumns: 'auto repeat(6, 1fr)', // 'auto' for time column, 1fr for each day
          gridTemplateRows: `auto repeat(${allTimeSlots.length}, 2rem)`, // 'auto' for day header, 2rem for each time slot
        }}
      >
        {/* Top-left header cell - sticky in both directions */}
        <div className="sticky top-0 left-0 z-30 p-2 font-semibold text-center border-b border-r bg-muted text-muted-foreground">Time</div>

        {/* Day headers - sticky to the top */}
        {daysOfWeek.map((day, index) => (
          <div 
            key={day} 
            className="sticky top-0 z-20 p-2 font-semibold text-center border-b border-r bg-muted text-muted-foreground"
            style={{ gridColumn: index + 2 }}
          >
            {day}
          </div>
        ))}
        
        {/* Time slot labels - sticky to the left */}
        {allTimeSlots.map((slot, index) => (
          <div 
            key={slot} 
            className="sticky left-0 z-20 flex items-center justify-center h-8 p-2 text-xs font-mono text-center border-b border-r bg-muted/50 text-muted-foreground"
            style={{ gridRow: index + 2 }}
          >
            {slot}
          </div>
        ))}

        {/* Background Grid lines - simple divs placed in the grid to form the lines */}
        {daysOfWeek.map((day, dayIndex) => 
          allTimeSlots.map((slot, slotIndex) => (
            <div 
              key={`${day}-${slot}`} 
              className="border-b border-r border-border/50"
              style={{
                gridRow: slotIndex + 2,
                gridColumn: dayIndex + 2,
              }}
            ></div>
          ))
        )}

        {/* Positioned schedule blocks - placed on top of the grid lines */}
        {positionedSchedules.map(schedule => (
          <div
            key={schedule.id}
            className={`z-10 m-0.5 p-1 text-white rounded-md shadow-md overflow-hidden flex flex-col justify-center ${schedule.bgColor}`}
            style={{
              gridRow: schedule.gridRow,
              gridColumn: schedule.gridColumn,
            }}
          >
            <p className="text-xs font-bold truncate">{schedule.subject}</p>
            <p className="text-[10px] truncate">{schedule.faculty}</p>
            <p className="text-[10px] truncate">{schedule.startTime} - {schedule.endTime}</p>
            <p className="text-[10px] truncate">{schedule.section} @ {schedule.room}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetablePreview;