import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, Edit, Trash2, Save, MapPin, Building } from "lucide-react";

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

interface Venue {
  id: string;
  name: string;
  shortName: string;
  capacity: number;
  type: string;
  building: string;
  floor: string;
  description: string;
}

export const AcademicSettings = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

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

  // Venue form state
  const [venueForm, setVenueForm] = useState({
    name: "",
    shortName: "",
    capacity: 0,
    type: "",
    building: "",
    floor: "",
    description: ""
  });

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

  const handleAddVenue = () => {
    if (venueForm.name && venueForm.shortName && venueForm.type && venueForm.building) {
      const newVenue: Venue = {
        id: Date.now().toString(),
        ...venueForm
      };
      setVenues([...venues, newVenue]);
      setVenueForm({
        name: "",
        shortName: "",
        capacity: 0,
        type: "",
        building: "",
        floor: "",
        description: ""
      });
    }
  };

  const handleDeleteVenue = (venueId: string) => {
    setVenues(venues.filter(venue => venue.id !== venueId));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Academic Settings</h1>
          <p className="text-muted-foreground">Manage academic years, semesters, and venues</p>
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
                <Label htmlFor="semesterName">Semester Name</Label>
                <Input
                  id="semesterName"
                  value={semesterForm.name}
                  onChange={(e) => setSemesterForm({...semesterForm, name: e.target.value})}
                  placeholder="e.g., Semester 1"
                />
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

        {/* Venues Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Add Venue
              </CardTitle>
              <CardDescription>Register new classroom or venue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="venueName">Full Name</Label>
                  <Input
                    id="venueName"
                    value={venueForm.name}
                    onChange={(e) => setVenueForm({...venueForm, name: e.target.value})}
                    placeholder="e.g., Computer Laboratory 1"
                  />
                </div>
                <div>
                  <Label htmlFor="venueShortName">Short Name</Label>
                  <Input
                    id="venueShortName"
                    value={venueForm.shortName}
                    onChange={(e) => setVenueForm({...venueForm, shortName: e.target.value})}
                    placeholder="e.g., Comp Lab 1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="venueType">Venue Type</Label>
                  <Select value={venueForm.type} onValueChange={(value) => setVenueForm({...venueForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classroom">Classroom</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="lecture_hall">Lecture Hall</SelectItem>
                      <SelectItem value="seminar_room">Seminar Room</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="auditorium">Auditorium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="venueCapacity">Capacity</Label>
                  <Input
                    id="venueCapacity"
                    type="number"
                    value={venueForm.capacity}
                    onChange={(e) => setVenueForm({...venueForm, capacity: parseInt(e.target.value) || 0})}
                    placeholder="e.g., 50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="venueBuilding">Building</Label>
                  <Input
                    id="venueBuilding"
                    value={venueForm.building}
                    onChange={(e) => setVenueForm({...venueForm, building: e.target.value})}
                    placeholder="e.g., Main Building"
                  />
                </div>
                <div>
                  <Label htmlFor="venueFloor">Floor</Label>
                  <Input
                    id="venueFloor"
                    value={venueForm.floor}
                    onChange={(e) => setVenueForm({...venueForm, floor: e.target.value})}
                    placeholder="e.g., Ground Floor"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="venueDescription">Description</Label>
                <Input
                  id="venueDescription"
                  value={venueForm.description}
                  onChange={(e) => setVenueForm({...venueForm, description: e.target.value})}
                  placeholder="Additional details about the venue"
                />
              </div>

              <Button onClick={handleAddVenue} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Venue
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Registered Venues ({venues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {venues.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No venues registered yet</p>
                ) : (
                  venues.map((venue) => (
                    <div key={venue.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{venue.name}</h3>
                          <Badge variant="secondary">{venue.shortName}</Badge>
                          <Badge variant="outline">{venue.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {venue.building} • {venue.floor} • Capacity: {venue.capacity}
                        </p>
                        {venue.description && (
                          <p className="text-xs text-muted-foreground mt-1">{venue.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteVenue(venue.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
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
            <Button variant="outline" className="h-20 flex flex-col">
              <Save className="h-6 w-6 mb-2" />
              <span>Save Settings</span>
              <span className="text-xs text-muted-foreground">Apply configurations</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
