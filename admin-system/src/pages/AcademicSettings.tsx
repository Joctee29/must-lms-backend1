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

  // Track selected active year and semester IDs for Select components
  const [selectedActiveYearId, setSelectedActiveYearId] = useState<string>("");
  const [selectedActiveSemesterId, setSelectedActiveSemesterId] = useState<string>("");
  const [selectedYearForDisplay, setSelectedYearForDisplay] = useState<string>(""); // Display selected year in dropdowns

  // Edit mode state
  const [editingYearId, setEditingYearId] = useState<string | null>(null);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);

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
          setSelectedActiveYearId(yearId); // Track selected year for Set Active button
          setSelectedYearForDisplay(active.academic_year); // Track for display in dropdowns

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
          setSelectedActiveSemesterId(semId); // Track selected semester for Set Active button
          
          // Also update the semester form to show semester number in dropdown
          setSemesterForm(prev => ({
            ...prev,
            name: `Semester ${active.semester}`,
            academicYearId: yearId
          }));
        }
      } catch (error) {
        console.error("Error loading active academic period:", error);
      }
    };

    loadActivePeriod();
  }, []);

  const handleAddAcademicYear = async () => {
    if (!yearForm.name || !yearForm.startDate || !yearForm.endDate) {
      alert("Please fill in all academic year fields (name, start date, end date)");
      return;
    }

    try {
      setSaving(true);
      
      const newYear: AcademicYear = {
        id: Date.now().toString(),
        ...yearForm,
        // Automatically mark first added year as active
        isActive: academicYears.length === 0 ? true : yearForm.isActive,
      };
      
      const updatedYears = [...academicYears, newYear];
      setAcademicYears(updatedYears);
      setSelectedYearForDisplay(newYear.name); // Update display selection
      
      // Auto-populate semester form with the newly added year
      setSemesterForm(prev => ({
        ...prev,
        academicYearId: newYear.id
      }));
      
      setYearForm({ name: "", startDate: "", endDate: "", isActive: false });

      // Only try to save to backend if there's also an active semester
      // Otherwise just add locally and wait for semester to be added
      const activeSemester = semesters.find(s => s.isActive);
      
      if (newYear.isActive && activeSemester) {
        const success = await handleSaveBoth(updatedYears, semesters);
        if (!success) {
          // Revert if save failed
          setAcademicYears(academicYears);
          setSelectedYearForDisplay("");
          alert("Failed to add academic year. Please try again.");
        } else {
          alert(`✅ Academic year "${newYear.name}" added and activated`);
        }
      } else {
        // Just add locally - will save when semester is added
        alert(`✅ Academic year "${newYear.name}" added.\n\nPlease add a semester to complete the setup.`);
      }
    } catch (error) {
      console.error("Error adding academic year:", error);
      alert(`❌ Error adding academic year: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSemester = async () => {
    if (!semesterForm.name || !semesterForm.academicYearId || !semesterForm.startDate || !semesterForm.endDate) {
      alert("Please fill in all semester fields (semester, academic year, start date, end date)");
      return;
    }

    try {
      setSaving(true);
      
      const newSemester: Semester = {
        id: Date.now().toString(),
        ...semesterForm,
        // Automatically mark first added semester as active
        isActive: semesters.length === 0 ? true : semesterForm.isActive,
      };
      
      const updatedSemesters = [...semesters, newSemester];
      setSemesters(updatedSemesters);
      setSemesterForm({ name: "", academicYearId: "", startDate: "", endDate: "", isActive: false });

      // Save to backend - ensure academic year is active too
      const activeYear = academicYears.find(y => y.isActive);
      if (!activeYear) {
        alert("Please select an active academic year first");
        // Revert
        setSemesters(semesters);
        return;
      }

      const success = await handleSaveBoth(academicYears, updatedSemesters);
      if (!success) {
        // Revert on failure
        setSemesters(semesters);
        alert("Failed to add semester. Please try again.");
      } else {
        alert(`✅ Semester "${newSemester.name}" added successfully`);
      }
    } catch (error) {
      console.error("Error adding semester:", error);
      alert(`❌ Error adding semester: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const getAcademicYearName = (yearId: string) => {
    return academicYears.find(y => y.id === yearId)?.name || "Unknown";
  };

  const handleEditYear = (year: AcademicYear) => {
    setEditingYearId(year.id);
    setEditingYear({ ...year });
  };

  const handleSaveEditYear = async () => {
    if (!editingYear || !editingYear.name || !editingYear.startDate || !editingYear.endDate) {
      alert("Please fill in all academic year fields");
      return;
    }

    try {
      setSaving(true);
      const updatedYears = academicYears.map(y => y.id === editingYearId ? editingYear : y);
      setAcademicYears(updatedYears);
      
      // If edited year is active, save to backend
      if (editingYear.isActive) {
        const success = await handleSaveBoth(updatedYears, semesters);
        if (!success) {
          setAcademicYears(academicYears);
          alert("Failed to save academic year changes. Please try again.");
        } else {
          alert(`✅ Academic year "${editingYear.name}" updated successfully`);
          setEditingYearId(null);
          setEditingYear(null);
        }
      } else {
        alert(`✅ Academic year "${editingYear.name}" updated`);
        setEditingYearId(null);
        setEditingYear(null);
      }
    } catch (error) {
      console.error("Error saving academic year:", error);
      alert(`❌ Error saving academic year: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteYear = async (yearId: string) => {
    const yearToDelete = academicYears.find(y => y.id === yearId);
    if (!yearToDelete) return;

    if (!window.confirm(`Are you sure you want to delete "${yearToDelete.name}"?`)) {
      return;
    }

    try {
      setSaving(true);
      const updatedYears = academicYears.filter(y => y.id !== yearId);
      const updatedSemesters = semesters.filter(s => s.academicYearId !== yearId);
      
      setAcademicYears(updatedYears);
      setSemesters(updatedSemesters);

      // If deleted year was active, need to save backend update
      if (yearToDelete.isActive && updatedYears.length > 0) {
        const newActiveYear = updatedYears[0];
        const newActiveSemester = updatedSemesters.find(s => s.academicYearId === newActiveYear.id) || updatedSemesters[0];
        
        if (newActiveSemester) {
          const yearsWithNewActive = updatedYears.map(y => ({ ...y, isActive: y.id === newActiveYear.id }));
          const semestersWithNewActive = updatedSemesters.map(s => ({ ...s, isActive: s.id === newActiveSemester.id }));
          await handleSaveBoth(yearsWithNewActive, semestersWithNewActive);
        }
      }

      alert(`✅ Academic year "${yearToDelete.name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting academic year:", error);
      alert(`❌ Error deleting academic year: ${error instanceof Error ? error.message : String(error)}`);
      setAcademicYears(academicYears);
      setSemesters(semesters);
    } finally {
      setSaving(false);
    }
  };

  const handleEditSemester = (semester: Semester) => {
    setEditingSemesterId(semester.id);
    setEditingSemester({ ...semester });
  };

  const handleSaveEditSemester = async () => {
    if (!editingSemester || !editingSemester.name || !editingSemester.academicYearId || !editingSemester.startDate || !editingSemester.endDate) {
      alert("Please fill in all semester fields");
      return;
    }

    try {
      setSaving(true);
      const updatedSemesters = semesters.map(s => s.id === editingSemesterId ? editingSemester : s);
      setSemesters(updatedSemesters);

      // If edited semester is active, save to backend
      if (editingSemester.isActive) {
        const success = await handleSaveBoth(academicYears, updatedSemesters);
        if (!success) {
          setSemesters(semesters);
          alert("Failed to save semester changes. Please try again.");
        } else {
          alert(`✅ Semester "${editingSemester.name}" updated successfully`);
          setEditingSemesterId(null);
          setEditingSemester(null);
        }
      } else {
        alert(`✅ Semester "${editingSemester.name}" updated`);
        setEditingSemesterId(null);
        setEditingSemester(null);
      }
    } catch (error) {
      console.error("Error saving semester:", error);
      alert(`❌ Error saving semester: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSemester = async (semesterId: string) => {
    const semesterToDelete = semesters.find(s => s.id === semesterId);
    if (!semesterToDelete) return;

    if (!window.confirm(`Are you sure you want to delete "${semesterToDelete.name}"?`)) {
      return;
    }

    try {
      setSaving(true);
      const updatedSemesters = semesters.filter(s => s.id !== semesterId);
      setSemesters(updatedSemesters);

      // If deleted semester was active, need to save backend update
      if (semesterToDelete.isActive && updatedSemesters.length > 0) {
        const newActiveSemester = updatedSemesters[0];
        const semestersWithNewActive = updatedSemesters.map(s => ({ ...s, isActive: s.id === newActiveSemester.id }));
        await handleSaveBoth(academicYears, semestersWithNewActive);
      }

      alert(`✅ Semester "${semesterToDelete.name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting semester:", error);
      alert(`❌ Error deleting semester: ${error instanceof Error ? error.message : String(error)}`);
      setSemesters(semesters);
    } finally {
      setSaving(false);
    }
  };

  const setActiveAcademicYear = async (yearId: string) => {
    // Update state immediately for UI feedback
    const updatedYears = academicYears.map(year => ({
      ...year,
      isActive: year.id === yearId
    }));
    setAcademicYears(updatedYears);
    
    // Then save to backend
    try {
      setSaving(true);
      const success = await handleSaveBoth(updatedYears, semesters);
      if (!success) {
        // Revert on failure
        setAcademicYears(academicYears);
      }
    } finally {
      setSaving(false);
    }
  };

  const setActiveSemester = async (semesterId: string) => {
    // Update state immediately for UI feedback
    const updatedSemesters = semesters.map(semester => ({
      ...semester,
      isActive: semester.id === semesterId
    }));
    setSemesters(updatedSemesters);
    
    // Then save to backend
    try {
      setSaving(true);
      const success = await handleSaveBoth(academicYears, updatedSemesters);
      if (!success) {
        // Revert on failure
        setSemesters(semesters);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await handleSaveBoth(academicYears, semesters);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBoth = async (yearsToSave: AcademicYear[], semestersToSave: Semester[]): Promise<boolean> => {
    try {
      // Get the active year and semester from the parameters
      const activeYear = yearsToSave.find(y => y.isActive);
      const activeSemester = semestersToSave.find(s => s.isActive);

      if (!activeYear) {
        console.error("❌ No active academic year selected.");
        alert("Please add and select an active academic year first");
        return false;
      }

      if (!activeSemester) {
        console.error("❌ No active semester selected.");
        alert("Please add and select an active semester first.\n\nAcademic year has been added locally. Add a semester to save to database.");
        return false;
      }

      const selectedYear = activeYear.name.trim();
      const selectedSemesterName = activeSemester.name.trim();

      // Derive semester number (1 or 2) from the semester name/value
      const match = selectedSemesterName.match(/(1|2)/);
      const semesterNumber = match ? parseInt(match[1], 10) : 1;

      console.log(`📤 Saving to backend: ${selectedYear} - Semester ${semesterNumber}`);
      
      // Make the API call and WAIT for response
      const result = await academicPeriodOperations.setActive(selectedYear, semesterNumber);
      
      // Verify response from backend
      // Note: apiCall() extracts the data, so result is the actual data object
      if (result && result.academic_year) {
        console.log(`✅ Academic period PERMANENTLY saved in database:`, result);
        console.log(`✅ Year: ${result.academic_year}, Semester: ${result.semester}, Active: ${result.is_active}`);
        alert(`✅ Academic settings saved!\nYear: ${result.academic_year}\nSemester: ${result.semester}`);
        return true;
      } else if (result && result.id) {
        // Handle case where we get an ID (period was created/updated)
        console.log(`✅ Academic period saved:`, result);
        const yearDisplay = result.academic_year || selectedYear;
        const semDisplay = result.semester || semesterNumber;
        alert(`✅ Academic settings saved!\nYear: ${yearDisplay}\nSemester: ${semDisplay}`);
        return true;
      } else {
        console.warn(`⚠️ Unexpected response from backend:`, result);
        console.error(`⚠️ Response structure:`, { hasAcademicYear: !!result?.academic_year, hasId: !!result?.id, result });
        alert("⚠️ Settings may not have saved properly. Check browser console for details.");
        return false;
      }
    } catch (error) {
      console.error("❌ Error saving academic settings:", error);
      alert(`❌ Error saving academic settings: ${error instanceof Error ? error.message : String(error)}`);
      return false;
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

      {/* Academic Years & Semesters Management Sections */}
      <div>
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
                      {editingYearId === year.id ? (
                        <>
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={handleSaveEditYear}
                            disabled={saving}
                          >
                            Save
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingYearId(null);
                              setEditingYear(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditYear(year)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteYear(year.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    {editingYearId === year.id && editingYear && (
                      <div className="w-full mt-4 p-4 border rounded-lg bg-muted/50 space-y-3">
                        <div>
                          <Label htmlFor="editYearName">Academic Year Name</Label>
                          <Input
                            id="editYearName"
                            value={editingYear.name}
                            onChange={(e) => setEditingYear({ ...editingYear, name: e.target.value })}
                            placeholder="e.g., 2025/2026"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="editYearStart">Start Date</Label>
                            <Input
                              id="editYearStart"
                              type="date"
                              value={editingYear.startDate}
                              onChange={(e) => setEditingYear({ ...editingYear, startDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="editYearEnd">End Date</Label>
                            <Input
                              id="editYearEnd"
                              type="date"
                              value={editingYear.endDate}
                              onChange={(e) => setEditingYear({ ...editingYear, endDate: e.target.value })}
                            />
                          </div>
                        </div>
                        {year.isActive && (
                          <p className="text-xs text-muted-foreground">✓ This is the active academic year</p>
                        )}
                      </div>
                    )}
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
                      {editingSemesterId === semester.id ? (
                        <>
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={handleSaveEditSemester}
                            disabled={saving}
                          >
                            Save
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingSemesterId(null);
                              setEditingSemester(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditSemester(semester)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteSemester(semester.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    {editingSemesterId === semester.id && editingSemester && (
                      <div className="w-full mt-4 p-4 border rounded-lg bg-muted/50 space-y-3">
                        <div>
                          <Label htmlFor="editSemesterName">Semester</Label>
                          <Select
                            value={editingSemester.name.match(/1|2/)?.[0] || "1"}
                            onValueChange={(value) => 
                              setEditingSemester({
                                ...editingSemester,
                                name: value === "1" ? "Semester 1" : "Semester 2"
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
                          <Label htmlFor="editSemesterYear">Academic Year</Label>
                          <Select
                            value={editingSemester.academicYearId}
                            onValueChange={(value) =>
                              setEditingSemester({ ...editingSemester, academicYearId: value })
                            }
                          >
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
                            <Label htmlFor="editSemesterStart">Start Date</Label>
                            <Input
                              id="editSemesterStart"
                              type="date"
                              value={editingSemester.startDate}
                              onChange={(e) => setEditingSemester({ ...editingSemester, startDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="editSemesterEnd">End Date</Label>
                            <Input
                              id="editSemesterEnd"
                              type="date"
                              value={editingSemester.endDate}
                              onChange={(e) => setEditingSemester({ ...editingSemester, endDate: e.target.value })}
                            />
                          </div>
                        </div>
                        {semester.isActive && (
                          <p className="text-xs text-muted-foreground">✓ This is the active semester</p>
                        )}
                      </div>
                    )}
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
