import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, Edit, Trash2, Save } from "lucide-react";
import { academicPeriodOperations } from "@/lib/database";

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Semester {
  id: string;
  name: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}


export const AcademicSettings = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [saving, setSaving] = useState(false);

  // Academic Year form state
  const [yearForm, setYearForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isActive: false
  });

  // Semester form state
  const [semesterForm, setSemesterForm] = useState({
    name: "",
    academicYearId: "",
    startDate: "",
    endDate: "",
    isActive: false
  });

  // Load active academic period from backend for reality integration
  useEffect(() => {
    const loadActivePeriod = async () => {
      try {
        const active = await academicPeriodOperations.getActive();
        if (active && active.academic_year && active.semester) {
          // Ensure there is at least one academic year in the list marked as active
          const yearId = Date.now().toString();
          const activeYear: AcademicYear = {
            id: yearId,
            name: active.academic_year,
            startDate: "",
            endDate: "",
            isActive: true,
          };
          setAcademicYears([activeYear]);

          // Ensure there is at least one semester in the list marked as active
          const semId = (Date.now() + 1).toString();
          const activeSemester: Semester = {
            id: semId,
            name: `Semester ${active.semester}`,
            academicYearId: yearId,
            startDate: "",
            endDate: "",
            isActive: true,
          };
          setSemesters([activeSemester]);
        }
      } catch (error) {
        console.error("Error loading active academic period:", error);
      }
    };

    loadActivePeriod();
  }, []);

  const handleAddAcademicYear = () => {
    if (yearForm.name && yearForm.startDate && yearForm.endDate) {
      const newYear: AcademicYear = {
        id: Date.now().toString(),
        ...yearForm
      };
      setAcademicYears([...academicYears, newYear]);
      setYearForm({ name: "", startDate: "", endDate: "", isActive: false });
    }
  };

  const handleAddSemester = () => {
    if (semesterForm.name && semesterForm.academicYearId && semesterForm.startDate && semesterForm.endDate) {
      const newSemester: Semester = {
        id: Date.now().toString(),
        ...semesterForm
      };
      setSemesters([...semesters, newSemester]);
      setSemesterForm({ name: "", academicYearId: "", startDate: "", endDate: "", isActive: false });
    }
  };

  const getAcademicYearName = (yearId: string) => {
    return academicYears.find(y => y.id === yearId)?.name || "Unknown";
  };

  const setActiveAcademicYear = (yearId: string) => {
    setAcademicYears(academicYears.map(year => ({
      ...year,
      isActive: year.id === yearId
    })));
  };

  const setActiveSemester = (semesterId: string) => {
    setSemesters(semesters.map(semester => ({
      ...semester,
      isActive: semester.id === semesterId
    })));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      const activeYear = academicYears.find(y => y.isActive);
      const activeSemester = semesters.find(s => s.isActive);

      if (!activeYear || !activeSemester) {
        console.error("Active academic year or semester not selected");
        setSaving(false);
        return;
      }

      // Derive semester number (1 or 2) from the semester name
      const match = activeSemester.name.match(/(1|2)/);
      const semesterNumber = match ? parseInt(match[1], 10) : 1;

      await academicPeriodOperations.setActive(activeYear.name, semesterNumber);
    } catch (error) {
      console.error("Error saving academic settings:", error);
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Academic Settings</h1>
          <p className="text-muted-foreground">Manage academic years and semesters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Years Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Add Academic Year
              </CardTitle>
              <CardDescription>Create new academic year</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="yearName">Academic Year Name</Label>
                <Input
                  id="yearName"
                  value={yearForm.name}
                  onChange={(e) => setYearForm({...yearForm, name: e.target.value})}
                  placeholder="e.g., 2025/2026"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yearStart">Start Date</Label>
                  <Input
                    id="yearStart"
                    type="date"
                    value={yearForm.startDate}
                    onChange={(e) => setYearForm({...yearForm, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="yearEnd">End Date</Label>
                  <Input
                    id="yearEnd"
                    type="date"
                    value={yearForm.endDate}
                    onChange={(e) => setYearForm({...yearForm, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="yearActive"
                  checked={yearForm.isActive}
                  onChange={(e) => setYearForm({...yearForm, isActive: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="yearActive">Set as active academic year</Label>
              </div>
              <Button onClick={handleAddAcademicYear} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Academic Year
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Years ({academicYears.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {academicYears.map((year) => (
                  <div key={year.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{year.name}</h3>
                        {year.isActive && <Badge variant="default">Active</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {year.startDate} to {year.endDate}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!year.isActive && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveAcademicYear(year.id)}
                        >
                          Set Active
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Semesters Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Add Semester
              </CardTitle>
              <CardDescription>Create new semester for academic year</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="semesterName">Semester</Label>
                <Select
                  value={semesterForm.name}
                  onValueChange={(value) =>
                    setSemesterForm({
                      ...semesterForm,
                      name: value === "1" ? "Semester 1" : "Semester 2",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="semesterYear">Academic Year</Label>
                <Select value={semesterForm.academicYearId} onValueChange={(value) => setSemesterForm({...semesterForm, academicYearId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="semesterStart">Start Date</Label>
                  <Input
                    id="semesterStart"
                    type="date"
                    value={semesterForm.startDate}
                    onChange={(e) => setSemesterForm({...semesterForm, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="semesterEnd">End Date</Label>
                  <Input
                    id="semesterEnd"
                    type="date"
                    value={semesterForm.endDate}
                    onChange={(e) => setSemesterForm({...semesterForm, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="semesterActive"
                  checked={semesterForm.isActive}
                  onChange={(e) => setSemesterForm({...semesterForm, isActive: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="semesterActive">Set as active semester</Label>
              </div>
              <Button onClick={handleAddSemester} className="w-full" disabled={academicYears.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Add Semester
              </Button>
              {academicYears.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">Please add academic years first</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Semesters ({semesters.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {semesters.map((semester) => (
                  <div key={semester.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{semester.name}</h3>
                        {semester.isActive && <Badge variant="default">Active</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getAcademicYearName(semester.academicYearId)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {semester.startDate} to {semester.endDate}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!semester.isActive && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveSemester(semester.id)}
                        >
                          Set Active
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Setup Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup</CardTitle>
          <CardDescription>Automatically create standard academic structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              <span>Setup 2025/2026</span>
              <span className="text-xs text-muted-foreground">Auto create year & semesters</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Clock className="h-6 w-6 mb-2" />
              <span>Standard Semesters</span>
              <span className="text-xs text-muted-foreground">Create Sem 1 & Sem 2</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              <Save className="h-6 w-6 mb-2" />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
              <span className="text-xs text-muted-foreground">Apply configurations</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
