import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  UserCheck, 
  Search, 
  UserX, 
  Users, 
  Award,
  CheckCircle,
  XCircle,
  Calendar,
  BookOpen
} from "lucide-react";

interface Student {
  id: number;
  name: string;
  registration_number: string;
  email: string;
  phone: string;
  academic_year: string;
  current_semester: number;
  year_of_study: number;
  academic_level: string;
  is_cr: boolean;
  cr_activated_at: string;
  cr_activated_by: string;
  course_name: string;
  course_code: string;
  course_id: number;
}

export const ClassRepresentativeManagement = () => {
  const [crs, setCrs] = useState<Student[]>([]);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Load all CRs on mount
  useEffect(() => {
    loadCRs();
  }, []);

  const loadCRs = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://must-lms-backend.onrender.com/api/class-representatives');
      const result = await response.json();
      
      if (result.success) {
        setCrs(result.data || []);
      } else {
        toast.error('Failed to load Class Representatives');
      }
    } catch (error) {
      console.error('Error loading CRs:', error);
      toast.error('Failed to load Class Representatives');
    } finally {
      setLoading(false);
    }
  };

  const searchStudents = async () => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      toast.error('Please enter at least 2 characters to search');
      return;
    }

    try {
      setSearching(true);
      const response = await fetch(
        `https://must-lms-backend.onrender.com/api/students/search-for-cr?search=${encodeURIComponent(searchTerm)}`
      );
      const result = await response.json();
      
      if (result.success) {
        setSearchResults(result.data || []);
        if (result.data.length === 0) {
          toast.info('No students found matching your search');
        }
      } else {
        toast.error('Search failed');
      }
    } catch (error) {
      console.error('Error searching students:', error);
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const activateCR = async (student: Student) => {
    if (!confirm(`Activate ${student.name} (${student.registration_number}) as Class Representative?`)) {
      return;
    }

    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const response = await fetch('https://must-lms-backend.onrender.com/api/class-representatives/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          activatedBy: currentUser.username || 'Admin'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Student activated as CR successfully!');
        await loadCRs();
        setSearchResults(prev => prev.filter(s => s.id !== student.id));
      } else {
        toast.error(result.error || 'Failed to activate CR');
      }
    } catch (error) {
      console.error('Error activating CR:', error);
      toast.error('Failed to activate CR');
    } finally {
      setLoading(false);
    }
  };

  const deactivateCR = async (student: Student) => {
    if (!confirm(`Remove CR status from ${student.name} (${student.registration_number})?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('https://must-lms-backend.onrender.com/api/class-representatives/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'CR status removed successfully!');
        await loadCRs();
      } else {
        toast.error(result.error || 'Failed to deactivate CR');
      }
    } catch (error) {
      console.error('Error deactivating CR:', error);
      toast.error('Failed to deactivate CR');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Class Representative Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage Class Representatives (CRs) for courses
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Award className="h-5 w-5 mr-2" />
          {crs.length} Active CRs
        </Badge>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Students to Assign as CR
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchStudents()}
              className="flex-1"
            />
            <Button 
              onClick={searchStudents} 
              disabled={searching || !searchTerm.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="font-semibold text-sm text-muted-foreground">
                Search Results ({searchResults.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((student) => (
                  <Card key={student.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{student.name}</h4>
                          <Badge variant="secondary">{student.registration_number}</Badge>
                          {student.is_cr && (
                            <Badge variant="default" className="bg-green-600">
                              <Award className="h-3 w-3 mr-1" />
                              Already CR
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {student.course_name} ({student.course_code})
                            </span>
                            <span>Year {student.year_of_study}</span>
                            <span className="capitalize">{student.academic_level}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span>{student.email}</span>
                            <span>{student.phone}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => activateCR(student)}
                        disabled={loading || student.is_cr}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        {student.is_cr ? 'Already CR' : 'Activate as CR'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active CRs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Class Representatives ({crs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && crs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading Class Representatives...
            </div>
          ) : crs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No Class Representatives assigned yet</p>
              <p className="text-sm mt-2">Search for students above to assign them as CRs</p>
            </div>
          ) : (
            <div className="space-y-3">
              {crs.map((cr) => (
                <Card key={cr.id} className="p-4 border-l-4 border-l-green-600">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-lg">{cr.name}</h4>
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Class Representative
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Registration:</span>
                            <Badge variant="secondary">{cr.registration_number}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>{cr.course_name} ({cr.course_code})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Year {cr.year_of_study}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground capitalize">{cr.academic_level}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-muted-foreground">
                            <span className="font-medium">Email:</span> {cr.email}
                          </div>
                          <div className="text-muted-foreground">
                            <span className="font-medium">Phone:</span> {cr.phone}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Activated: {formatDate(cr.cr_activated_at)}</span>
                          </div>
                          {cr.cr_activated_by && (
                            <div className="text-muted-foreground text-xs">
                              By: {cr.cr_activated_by}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => deactivateCR(cr)}
                      disabled={loading}
                      variant="destructive"
                      size="sm"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Remove CR
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
              <Award className="h-5 w-5" />
              About Class Representatives
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
              <li>CRs can create General Discussions for their programs</li>
              <li>CR information is displayed on program cards in the Lecturer Portal</li>
              <li>Students can see their CR status in their profile</li>
              <li>Only one CR should be assigned per course/year combination</li>
              <li>CRs help facilitate communication between students and lecturers</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
