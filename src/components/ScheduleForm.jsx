import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// Import our new Combobox
import Combobox from "@/components/ComboBox"; 
import { timeToMinutes, minutesToTime, allTimeSlots } from '../utils/timeUtils';
import {
  CalendarDays,
  Building,
  BookOpen,
  Users,
  User,
  Clock,
  Timer,
  Hourglass,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const ScheduleForm = ({
  rooms,
  days,
  subjects,
  sections,
  faculty,
  onAddSchedule,
  schedules,
  editingSchedule,
  selectedProgram,
  selectedSemester,
  selectedYearLevel,
}) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');
  const [facultyMember, setFacultyMember] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [endTime, setEndTime] = useState('');

  // --- Effects (no changes needed here) ---
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (editingSchedule) {
      setSubject(editingSchedule.subject);
      setSection(editingSchedule.section);
      setFacultyMember(editingSchedule.faculty);
      setStartTime(editingSchedule.startTime);
      setDuration(editingSchedule.duration);
      setSelectedRoom(editingSchedule.room);
      setSelectedDay(editingSchedule.day);
      setMessage('');
    } else {
      setSubject('');
      setSection('');
      setFacultyMember('');
      setStartTime('');
      setDuration(60);
      setSelectedRoom('');
      setSelectedDay('');
      setMessage('');
    }
  }, [editingSchedule]);

  useEffect(() => {
    if (startTime && duration) {
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = startMinutes + parseInt(duration, 10);
      setEndTime(minutesToTime(endMinutes));
    } else {
      setEndTime('');
    }
  }, [startTime, duration]);

  // --- Conflict Check (no changes needed here) ---
  const checkConflict = useCallback(
    (newSchedule) => {
      const newStartMinutes = timeToMinutes(newSchedule.startTime);
      const newEndMinutes = newStartMinutes + parseInt(newSchedule.duration, 10);

      for (const existing of schedules) {
        if (editingSchedule && existing.id === editingSchedule.id) continue;

        const existingStart = timeToMinutes(existing.startTime);
        const existingEnd = existingStart + existing.duration;
        const hasOverlap = newStartMinutes < existingEnd && newEndMinutes > existingStart;

        if (existing.day === newSchedule.day && hasOverlap) {
          if (existing.room === newSchedule.room)
            return `Room Conflict: ${existing.room} is already occupied.`;
          if (existing.section === newSchedule.section)
            return `Section Conflict: ${existing.section} has another class.`;
          if (existing.faculty === newSchedule.faculty)
            return `Faculty Conflict: ${existing.faculty} has another class.`;
        }
      }
      return null;
    },
    [schedules, editingSchedule]
  );

  // --- Handle Submit (no changes needed here) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !section || !facultyMember || !startTime || !duration || !selectedRoom || !selectedDay) {
      setMessageType('error');
      setMessage('Please fill in all required fields.');
      return;
    }

    const newSchedule = {
      id: editingSchedule ? editingSchedule.id : Date.now().toString(),
      subject,
      section,
      faculty: facultyMember,
      startTime,
      duration: parseInt(duration, 10),
      endTime,
      room: selectedRoom,
      day: selectedDay,
      program: selectedProgram,
      semester: selectedSemester,
      yearLevel: selectedYearLevel,
    };

    const conflict = checkConflict(newSchedule);
    if (conflict) {
      setMessageType('error');
      setMessage(conflict);
      return;
    }

    onAddSchedule(newSchedule);
    setMessageType('success');
    setMessage(`Schedule has been ${editingSchedule ? 'updated' : 'added'} successfully.`);
  };

  // --- Data Transformation for Combobox ---
  const toOptions = (arr) => arr.map(item => ({ value: item, label: item }));
  
  const dayOptions = toOptions(days);
  const roomOptions = toOptions(rooms);
  const subjectOptions = toOptions(subjects);
  const sectionOptions = toOptions(sections);
  const facultyOptions = toOptions(faculty);
  const timeOptions = toOptions(allTimeSlots.slice(0, -1));
  const durationOptions = Array.from({ length: 11 }, (_, i) => {
    const min = 30 * (i + 1);
    return { value: String(min), label: `${min} mins` };
  });

  const FormLabel = ({ icon, children }) => (
    <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      {icon}
      {children}
    </Label>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <FormLabel icon={<CalendarDays className="w-4 h-4 text-muted-foreground"/>}>Day</FormLabel>
          <Combobox
            options={dayOptions}
            value={selectedDay}
            onSelect={setSelectedDay}
            placeholder="Select Day"
            searchPlaceholder="Search day..."
          />
        </div>
        <div className="space-y-2">
          <FormLabel icon={<Building className="w-4 h-4 text-muted-foreground"/>}>Room</FormLabel>
          <Combobox
            options={roomOptions}
            value={selectedRoom}
            onSelect={setSelectedRoom}
            placeholder="Select Room"
            searchPlaceholder="Search room..."
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <FormLabel icon={<BookOpen className="w-4 h-4 text-muted-foreground"/>}>Subject</FormLabel>
        <Combobox
          options={subjectOptions}
          value={subject}
          onSelect={setSubject}
          placeholder="Select Subject"
          searchPlaceholder="Search subject..."
          emptyMessage="No subject found."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <FormLabel icon={<Users className="w-4 h-4 text-muted-foreground"/>}>Section</FormLabel>
          <Combobox
            options={sectionOptions}
            value={section}
            onSelect={setSection}
            placeholder="Select Section"
            searchPlaceholder="Search section..."
            emptyMessage="No section found."
          />
        </div>
        <div className="space-y-2">
          <FormLabel icon={<User className="w-4 h-4 text-muted-foreground"/>}>Faculty</FormLabel>
          <Combobox
            options={facultyOptions}
            value={facultyMember}
            onSelect={setFacultyMember}
            placeholder="Select Faculty"
            searchPlaceholder="Search faculty..."
            emptyMessage="No faculty found."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <FormLabel icon={<Clock className="w-4 h-4 text-muted-foreground"/>}>Start Time</FormLabel>
          <Combobox
            options={timeOptions}
            value={startTime}
            onSelect={setStartTime}
            placeholder="Select Time"
            searchPlaceholder="Search time..."
          />
        </div>
        <div className="space-y-2">
          <FormLabel icon={<Timer className="w-4 h-4 text-muted-foreground"/>}>Duration</FormLabel>
          <Combobox
            options={durationOptions}
            value={String(duration)}
            onSelect={(val) => setDuration(Number(val))}
            placeholder="Select"
            searchPlaceholder="Search duration..."
          />
        </div>
        <div className="space-y-2">
          <FormLabel icon={<Hourglass className="w-4 h-4 text-muted-foreground"/>}>End Time</FormLabel>
          <Input type="text" value={endTime} readOnly className="bg-muted focus:ring-0"/>
        </div>
      </div>

      <div className="pt-2 space-y-4">
        {message && (
          <div
            className={`flex items-center gap-3 rounded-lg p-3 text-sm ${
              messageType === 'error'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {messageType === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
            <span>{message}</span>
          </div>
        )}
        <div className="flex justify-end">
          <Button type="submit">
            {editingSchedule ? "Update Schedule" : "Add Schedule"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ScheduleForm;