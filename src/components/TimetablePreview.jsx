import React, { useMemo } from 'react';
import { allTimeSlots, timeToMinutes } from '../utils/timeUtils';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Import FaTrash

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const colorPalette = [
  "bg-blue-500", "bg-green-500", "bg-yellow-600",
  "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-red-500"
];

const TimetablePreview = ({ schedules, onEdit, onDelete }) => { // Accept onDelete

  const positionedSchedules = useMemo(() => {
    const startMinutes = timeToMinutes('7:00 AM');
    return schedules.map((schedule, index) => {
      if (!schedule.startTime || !schedule.duration) return null;
      
      const scheduleStartMinutes = timeToMinutes(schedule.startTime);
      const visualDuration = Math.max(schedule.duration, 30);
      const scheduleEndMinutes = scheduleStartMinutes + visualDuration;
      const gridRowStart = ((scheduleStartMinutes - startMinutes) / 30) + 2;
      const gridRowEnd = ((scheduleEndMinutes - startMinutes) / 30) + 2;
      const gridColumnStart = daysOfWeek.indexOf(schedule.day) + 2;
      
      if (gridColumnStart < 2) return null;

      return {
        ...schedule,
        gridRow: `${gridRowStart} / ${gridRowEnd}`,
        gridColumn: `${gridColumnStart}`,
        bgColor: colorPalette[index % colorPalette.length],
      };
    }).filter(Boolean);
  }, [schedules]);

  return (
    <div className="w-full h-full overflow-auto border border-border rounded-lg bg-background">
      <div 
        className="grid relative min-w-[800px]" 
        style={{
          gridTemplateColumns: 'auto repeat(6, 1fr)',
          gridTemplateRows: `auto repeat(${allTimeSlots.length}, 2rem)`,
        }}
      >
        {/* Headers and Time slots (unchanged) */}
        <div className="sticky top-0 left-0 z-30 p-2 font-semibold text-center border-b border-r bg-muted text-muted-foreground">Time</div>
        {daysOfWeek.map((day, index) => (
          <div key={day} className="sticky top-0 z-20 p-2 font-semibold text-center border-b border-r bg-muted text-muted-foreground" style={{ gridColumn: index + 2 }}>{day}</div>
        ))}
        {allTimeSlots.map((slot, index) => (
          <div key={slot} className="sticky left-0 z-20 flex items-center justify-center h-8 p-2 text-xs font-mono text-center border-b border-r bg-muted/50 text-muted-foreground" style={{ gridRow: index + 2 }}>{slot}</div>
        ))}
        {daysOfWeek.map((day, dayIndex) => 
          allTimeSlots.map((slot, slotIndex) => (
            <div key={`${day}-${slot}`} className="border-b border-r border-border/50" style={{ gridRow: slotIndex + 2, gridColumn: dayIndex + 2, }}></div>
          ))
        )}

        {/* Positioned schedule blocks */}
        {positionedSchedules.map(schedule => (
          <div
            key={schedule.id}
            className={`relative z-10 m-0.5 p-1.5 text-white rounded-md shadow-md overflow-hidden flex flex-col justify-center ${schedule.bgColor}`}
            style={{ gridRow: schedule.gridRow, gridColumn: schedule.gridColumn, }}
          >
            <div className="pr-8"> {/* Increased padding for more button space */}
              <p className="text-xs font-bold truncate">{schedule.subject}</p>
              <p className="text-[10px] truncate">{schedule.faculty}</p>
              <p className="text-[10px] truncate">{schedule.startTime} - {schedule.endTime}</p>
              <p className="text-[10px] truncate">{schedule.section} @ {schedule.room}</p>
            </div>
            
            {/* --- ACTION BUTTONS CONTAINER --- */}
            <div className="absolute top-1 right-1 flex flex-col gap-y-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(schedule)}
                  className="flex items-center justify-center w-5 h-5 rounded-full bg-black/20 hover:bg-black/40 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Edit schedule"
                >
                  <FaEdit size={10} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    // Add a confirmation dialog before deleting
                    if (window.confirm("Are you sure you want to delete this schedule?")) {
                      onDelete(schedule.id);
                    }
                  }}
                  className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600/50 hover:bg-red-600/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Delete schedule"
                >
                  <FaTrash size={10} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetablePreview;