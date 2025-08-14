import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    } else {
      setSubject('');
      setSection('');
      setFacultyMember('');
      setStartTime('');
      setDuration(60);
      setSelectedRoom('');
      setSelectedDay('');
    }
    setMessage('');
    setIsSubmitted(false);
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
          if (newSchedule.room && existing.room === newSchedule.room)
            return `Room Conflict: ${existing.room} is already occupied.`;

          if (existing.section === newSchedule.section)
            return `Section Conflict: ${existing.section} has another class.`;

          if (newSchedule.faculty && existing.faculty === newSchedule.faculty)
            return `Faculty Conflict: ${existing.faculty} has another class.`;
        }
      }
      return null;
    },
    [schedules, editingSchedule]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!subject || !section || !startTime || !duration || !selectedDay) {
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
    setIsSubmitted(false);
  };

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

  const getComboboxClass = (fieldValue, isRequired = false) => {
    if (isRequired && isSubmitted && !fieldValue) {
      return 'border-destructive focus-visible:ring-destructive';
    }
    if (!fieldValue) {
      return 'text-muted-foreground/60 border-input/60';
    }
    return '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <FormLabel icon={<CalendarDays className="w-4 h-4 text-muted-foreground" />}>Day</FormLabel>
          <Combobox
            className={getComboboxClass(selectedDay, true)}
            options={dayOptions}
            value={selectedDay}
            onSelect={setSelectedDay}
            placeholder="Select Day"
            searchPlaceholder="Search day..."
          />
        </div>
        <div className="space-y-2">
          <FormLabel icon={<Building className="w-4 h-4 text-muted-foreground" />}>Room</FormLabel>
          <Combobox
            className={getComboboxClass(selectedRoom)}
            options={roomOptions}
            value={selectedRoom}
            onSelect={setSelectedRoom}
            placeholder="Select Room"
            searchPlaceholder="Search room..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <FormLabel icon={<BookOpen className="w-4 h-4 text-muted-foreground" />}>Subject</FormLabel>
        <Combobox
          className={getComboboxClass(subject, true)}
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
          <FormLabel icon={<Users className="w-4 h-4 text-muted-foreground" />}>Section</FormLabel>
          <Combobox
            className={getComboboxClass(section, true)}
            options={sectionOptions}
            value={section}
            onSelect={setSection}
            placeholder="Select Section"
            searchPlaceholder="Search section..."
            emptyMessage="No section found."
          />
        </div>
        <div className="space-y-2">
          <FormLabel icon={<User className="w-4 h-4 text-muted-foreground" />}>Faculty</FormLabel>
          <Combobox
            className={getComboboxClass(facultyMember)}
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
          <FormLabel icon={<Clock className="w-4 h-4 text-muted-foreground" />}>Start Time</FormLabel>
          <Combobox
            className={getComboboxClass(startTime, true)}
            options={timeOptions}
            value={startTime}
            onSelect={setStartTime}
            placeholder="Select Time"
            searchPlaceholder="Search time..."
          />
        </div>
        <div className="space-y-2">
          <FormLabel icon={<Timer className="w-4 h-4 text-muted-foreground" />}>Duration</FormLabel>
          <Combobox
            options={durationOptions}
            value={String(duration)}
            onSelect={(val) => setDuration(Number(val))}
            placeholder="Select"
            searchPlaceholder="Search duration..."
          />
        </div>
        <div className="space-y-2">
          <FormLabel icon={<Hourglass className="w-4 h-4 text-muted-foreground" />}>End Time</FormLabel>
          <Input type="text" value={endTime} readOnly className="bg-muted focus:ring-0" />
        </div>
      </div>

      <div className="pt-2 space-y-4">
        {message && (
          <div
            className={`flex items-center gap-3 rounded-lg p-3 text-sm ${messageType === 'error'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-green-500/10 text-green-500 dark:text-green-400'
              }`}
          >
            {messageType === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
            <span>{message}</span>
          </div>
        )}
        <div className="flex justify-end">
          <Button type="submit" className="text-white">
            {editingSchedule ? "Update Schedule" : "Add Schedule"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ScheduleForm;