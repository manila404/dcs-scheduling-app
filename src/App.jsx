import React, { useEffect, useMemo, useState } from "react";
import ScheduleForm from "./components/ScheduleForm";
import TimeSlotGrid from "./components/TimeSlotGrid";
import SchedulePreviewModal from "./components/SchedulePreviewModal";
import ExportMenu from "./components/ExportMenu";
import ExportFilterModal from "./components/ExportFilterModal";
import RoomCombobox from "./components/RoomCombobox";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
import { Button } from "./components/ui/button";
import SpecificPreviewModal from "./components/SpecificPreviewModal";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";

import {
  initialRooms, initialDays, initialSubjects,
} from "./data/initialData";

import { db } from "../src/firebase";
import {
  collection, getDocs, setDoc, doc, deleteDoc,
} from "firebase/firestore";

import { PlusCircle } from "lucide-react";

// HELPER FUNCTION - This contains the proven logic
const groupSchedulesBy = (schedules, key) => {
  if (!key) return schedules;
  const grouped = {};
  for (const sched of schedules) {
    const groupKey = sched[key] || "Uncategorized";
    if (!grouped[groupKey]) grouped[groupKey] = [];
    grouped[groupKey].push(sched);
  }
  const sortedGroupEntries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  return sortedGroupEntries.flatMap(([group, items]) => [
      { id: `group-${group}`, groupLabel: group, isGroup: true },
      ...items,
    ]);
};


const App = () => {
  const [schedules, setSchedules] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [sections, setSections] = useState({});

  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedDay, setSelectedDay] = useState(initialDays[0]);
  const [selectedRoom, setSelectedRoom] = useState(initialRooms[0]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [selectedProgram, setSelectedProgram] = useState("IT");
  const [selectedSemester, setSelectedSemester] = useState("1st Semester");
  const [selectedYearLevel, setSelectedYearLevel] = useState("1st Year");
  
  // State for the original LIST preview modal
  const [listPreviewModalOpen, setListPreviewModalOpen] = useState(false);
  const [listPreviewFilterBy, setListPreviewFilterBy] = useState(null);

  // State for the NEW TIMETABLE preview modal
  const [specificPreviewState, setSpecificPreviewState] = useState({ isOpen: false, type: null });

  const [exportModalState, setExportModalState] = useState({ isOpen: false, type: null });

  const schedulesCollection = collection(db, "schedules");
  const facultyCollection = collection(db, "faculty");
  const sectionsCollection = collection(db, "sections");

  useEffect(() => {
    const fetchSchedules = async () => {
      const querySnapshot = await getDocs(schedulesCollection);
      const data = querySnapshot.docs.map((doc) => doc.data());
      setSchedules(data);
    };
    const fetchFaculty = async () => {
      const querySnapshot = await getDocs(facultyCollection);
      const data = querySnapshot.docs.map((doc) => doc.data().name);
      setFaculty(data);
    };
    const fetchSections = async () => {
      const querySnapshot = await getDocs(sectionsCollection);
      const sectionsData = querySnapshot.docs.map((doc) => doc.data());
      const transformedSections = sectionsData.reduce((acc, section) => {
        const { program, yearLevel, sectionNames } = section;
        if (!acc[program]) acc[program] = {};
        acc[program][yearLevel] = sectionNames;
        return acc;
      }, {});
      setSections(transformedSections);
    };
    fetchSchedules();
    fetchFaculty();
    fetchSections();
  }, []);

  const addOrUpdateSchedule = async (newSchedule) => {
    setSchedules((prev) => {
      const exists = prev.some((s) => s.id === newSchedule.id);
      return exists
        ? prev.map((s) => (s.id === newSchedule.id ? newSchedule : s))
        : [newSchedule, ...prev];
    });
    setEditingSchedule(null);
    await setDoc(doc(db, "schedules", newSchedule.id.toString()), newSchedule);
    setIsFormOpen(false);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    await deleteDoc(doc(db, "schedules", id.toString()));
  };
  
  const handleFormOpenChange = (open) => {
    setIsFormOpen(open);
    if (!open) setEditingSchedule(null);
  };

  const isMidyear = selectedSemester === "Midyear";
  const filteredSubjects = isMidyear
    ? initialSubjects?.[selectedProgram]?.[selectedSemester] || []
    : initialSubjects?.[selectedProgram]?.[selectedSemester]?.[0]?.[
    selectedYearLevel
    ] || [];

  const filteredSections = isMidyear
    ? Object.values(sections[selectedProgram] || {}).flat()
    : sections?.[selectedProgram]?.[selectedYearLevel] || [];

  const filteredForListPreview = () => {
    // Use the new helper function
    return groupSchedulesBy(schedules, listPreviewFilterBy);
  };

  const handleOpenListPreview = (filter) => {
    setListPreviewFilterBy(filter);
    setListPreviewModalOpen(true);
  };

  const recentSchedules = useMemo(() => {
    return [...schedules]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }, [schedules]);

  const uniqueOccupiedRooms = useMemo(() => [...new Set(schedules.map(s => s.room).filter(Boolean))].sort(), [schedules]);
  const uniqueOccupiedFaculty = useMemo(() => [...new Set(schedules.map(s => s.faculty).filter(Boolean))].sort(), [schedules]);
  const uniqueOccupiedSections = useMemo(() => [...new Set(schedules.map(s => s.section).filter(Boolean))].sort(), [schedules]);

  const getOptionsForModal = (type) => {
    switch (type) {
      case 'room': return uniqueOccupiedRooms;
      case 'faculty': return uniqueOccupiedFaculty;
      case 'section': return uniqueOccupiedSections;
      default: return [];
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4">
                <img
                  width="50"
                  height="50"
                  src="/cvsu_logo.png"
                  alt="CVSU DCS"
                />
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    DCS Faculty Room Scheduling
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Cavite State University - Department of Computer Studies
                  </p>
                </div>
              </div>
              <ModeToggle />
            </div>
          </div>
        </nav>

        <main className="p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-screen-2xl mx-auto">
          <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Schedule Filters</CardTitle>
                <CardDescription>
                  Select program, semester, and year to view available options.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">
                      Program
                    </label>
                    <Select
                      value={selectedProgram}
                      onValueChange={setSelectedProgram}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(initialSubjects).map((prog) => (
                          <SelectItem key={prog} value={prog}>
                            {prog}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">
                      Semester
                    </label>
                    <Select
                      value={selectedSemester}
                      onValueChange={setSelectedSemester}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(initialSubjects[selectedProgram]).map(
                          (sem) => (
                            <SelectItem key={sem} value={sem}>
                              {sem}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">
                      Year Level
                    </label>
                    <Select
                      value={selectedYearLevel}
                      onValueChange={setSelectedYearLevel}
                      disabled={isMidyear}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sections[selectedProgram] && Object.keys(sections[selectedProgram]).map(
                          (year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recently Added</CardTitle>
                <CardDescription>The last 5 schedules created.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSchedules.length > 0 ? (
                  <div className="space-y-3">
                    {recentSchedules.map((sched) => (
                      <div
                        key={sched.id}
                        className="text-sm p-3 border rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold leading-tight">{sched.subject}</p>
                            <p className="text-xs text-muted-foreground">{sched.faculty}</p>
                          </div>
                          <Badge variant="outline">{sched.room}</Badge>
                        </div>
                        <div className="text-xs font-medium text-muted-foreground pt-2 mt-2 border-t">
                          {sched.day}, {sched.startTime} - {sched.endTime}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-4">
                    No schedules have been added yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-8">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Time Slots</CardTitle>
                  <CardDescription>
                    Select a day to view the schedule.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <ExportMenu
                    schedules={schedules}
                    onOpenModal={(type) => setExportModalState({ isOpen: true, type })}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Preview</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleOpenListPreview(null)}>
                        All (List View)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSpecificPreviewState({ isOpen: true, type: 'room' })}>
                        By Room (Timetable)...
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSpecificPreviewState({ isOpen: true, type: 'faculty' })}>
                        By Faculty (Timetable)...
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSpecificPreviewState({ isOpen: true, type: 'section' })}>
                        By Section (Timetable)...
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Dialog open={isFormOpen} onOpenChange={handleFormOpenChange}>
                    <DialogTrigger asChild>
                      <Button className="text-white">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Schedule
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingSchedule
                            ? "Edit Schedule"
                            : "Add New Schedule"}
                        </DialogTitle>
                      </DialogHeader>
                      <ScheduleForm
                        rooms={initialRooms}
                        days={initialDays}
                        subjects={filteredSubjects}
                        sections={filteredSections}
                        faculty={faculty}
                        schedules={schedules}
                        onAddSchedule={addOrUpdateSchedule}
                        editingSchedule={editingSchedule}
                        selectedProgram={selectedProgram}
                        selectedSemester={selectedSemester}
                        selectedYearLevel={selectedYearLevel}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 my-4">
                  <RoomCombobox
                    rooms={initialRooms}
                    selectedRoom={selectedRoom}
                    onSelectRoom={setSelectedRoom}
                  />

                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {initialDays.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <TimeSlotGrid
                  selectedDay={selectedDay}
                  selectedRoom={selectedRoom}
                  schedules={schedules.filter(
                    (s) => s.room === selectedRoom && s.day === selectedDay
                  )}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </CardContent>
            </Card>
          </div>
        </main>

        <SchedulePreviewModal
          isOpen={listPreviewModalOpen}
          onClose={() => setListPreviewModalOpen(false)}
          schedules={filteredForListPreview()}
          filterBy={listPreviewFilterBy}
          title={
            listPreviewFilterBy
              ? `Preview by ${listPreviewFilterBy.charAt(0).toUpperCase() +
              listPreviewFilterBy.slice(1)
              }`
              : "All Schedule Preview"
          }
        />

        <SpecificPreviewModal
          isOpen={specificPreviewState.isOpen}
          onClose={() => setSpecificPreviewState({ isOpen: false, type: null })}
          type={specificPreviewState.type}
          options={getOptionsForModal(specificPreviewState.type)}
          schedules={schedules}
        />

        <ExportFilterModal
          isOpen={exportModalState.isOpen}
          onClose={() => setExportModalState({ isOpen: false, type: null })}
          type={exportModalState.type}
          options={getOptionsForModal(exportModalState.type)}
          schedules={schedules}
          groupSchedulesBy={groupSchedulesBy}
        />

        <Toaster richColors />
      </div>
    </ThemeProvider>
  );
};

export default App;