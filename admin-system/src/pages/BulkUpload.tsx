import { useState, useEffect } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Download, 
  Users, 
  GraduationCap, 
  CheckCircle, 
  XCircle,
  FileText,
  AlertCircle
} from "lucide-react";
import { courseOperations, initializeDatabase } from "@/lib/database";

interface Course {
  id: string;
  name: string;
  code: string;
}

interface UploadResult {
  successful: Array<{ row: number; data: any }>;
  failed: Array<{ row: number; data: any; error: string }>;
}

export const BulkUpload = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        await initializeDatabase();
        const coursesData = await courseOperations.getAllCourses();
        setCourses(coursesData || []);
      } catch (error) {
        console.error('Error loading courses:', error);
        toast.error("Failed to load courses");
      }
    };
    loadCourses();
  }, []);

  // Generate CSV template for students
  const downloadStudentTemplate = () => {
    const template = [
      ['name', 'email', 'phone', 'registrationNumber', 'academicYear', 'courseId', 'currentSemester', 'yearOfStudy', 'academicLevel', 'password'],
      ['John Doe', 'john.doe@example.com', '+255712345678', 'CS001/2024', '2024', '1', '1', '1', 'bachelor', 'student123'],
      ['Jane Smith', 'jane.smith@example.com', '+255723456789', 'CS002/2024', '2024', '1', '1', '2', 'bachelor', 'student123']
    ];
    
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'students_template.csv';
    link.click();
    toast.success("Student template downloaded");
  };

  // Generate CSV template for lecturers
  const downloadLecturerTemplate = () => {
    const template = [
      ['name', 'email', 'phone', 'employeeId', 'specialization', 'password'],
      ['Dr. John Smith', 'dr.john@example.com', '+255712345678', 'EMP001', 'Computer Science', 'lecturer123'],
      ['Prof. Jane Doe', 'prof.jane@example.com', '+255723456789', 'EMP002', 'Mathematics', 'lecturer123']
    ];
    
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lecturers_template.csv';
    link.click();
    toast.success("Lecturer template downloaded");
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error("Please select a CSV file");
        return;
      }
      setSelectedFile(file);
      setUploadResult(null);
      toast.success(`File selected: ${file.name}`);
    }
  };

  // Upload students
  const uploadStudents = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const students = results.data.map((row: any) => ({
            name: row.name?.trim(),
            email: row.email?.trim(),
            phone: row.phone?.trim() || null,
            registrationNumber: row.registrationNumber?.trim() || null,
            academicYear: row.academicYear?.trim() || new Date().getFullYear().toString(),
            courseId: parseInt(row.courseId) || null,
            currentSemester: parseInt(row.currentSemester) || 1,
            yearOfStudy: parseInt(row.yearOfStudy) || 1,
            academicLevel: row.academicLevel?.trim() || 'bachelor',
            password: row.password?.trim() || 'student123'
          }));

          setUploadProgress(30);

          const response = await fetch('https://must-lms-backend.onrender.com/api/students/bulk-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ students })
          });

          setUploadProgress(70);

          const result = await response.json();

          setUploadProgress(100);

          if (result.success) {
            setUploadResult(result.data);
            toast.success(result.message);
          } else {
            toast.error(result.error || "Upload failed");
          }
        } catch (error) {
          console.error('Error uploading students:', error);
          toast.error("Failed to upload students");
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        toast.error("Failed to parse CSV file");
        setUploading(false);
      }
    });
  };

  // Upload lecturers
  const uploadLecturers = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const lecturers = results.data.map((row: any) => ({
            name: row.name?.trim(),
            email: row.email?.trim(),
            phone: row.phone?.trim() || null,
            employeeId: row.employeeId?.trim(),
            specialization: row.specialization?.trim() || null,
            password: row.password?.trim() || 'lecturer123'
          }));

          setUploadProgress(30);

          const response = await fetch('https://must-lms-backend.onrender.com/api/lecturers/bulk-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lecturers })
          });

          setUploadProgress(70);

          const result = await response.json();

          setUploadProgress(100);

          if (result.success) {
            setUploadResult(result.data);
            toast.success(result.message);
          } else {
            toast.error(result.error || "Upload failed");
          }
        } catch (error) {
          console.error('Error uploading lecturers:', error);
          toast.error("Failed to upload lecturers");
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        toast.error("Failed to parse CSV file");
        setUploading(false);
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Upload</h1>
          <p className="text-muted-foreground">Upload multiple students or lecturers using CSV files</p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          <FileText className="mr-2 h-4 w-4" />
          CSV Format
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="lecturers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lecturers
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Upload Students
              </CardTitle>
              <CardDescription>
                Upload multiple students at once using a CSV file. Download the template to see the required format.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Download */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Download CSV Template</p>
                    <p className="text-sm text-muted-foreground">
                      Get the correct format for student data
                    </p>
                  </div>
                </div>
                <Button onClick={downloadStudentTemplate} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="student-csv">Select CSV File</Label>
                <Input
                  id="student-csv"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Upload Button */}
              <Button 
                onClick={uploadStudents} 
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Students
                  </>
                )}
              </Button>

              {/* Upload Results */}
              {uploadResult && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Upload Results</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="text-2xl font-bold text-green-600">
                              {uploadResult.successful.length}
                            </p>
                            <p className="text-sm text-green-700">Successful</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <XCircle className="h-8 w-8 text-red-600" />
                          <div>
                            <p className="text-2xl font-bold text-red-600">
                              {uploadResult.failed.length}
                            </p>
                            <p className="text-sm text-red-700">Failed</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Failed Records */}
                  {uploadResult.failed.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Failed Records
                      </h4>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {uploadResult.failed.map((item, index) => (
                          <div key={index} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                            <p className="font-medium">Row {item.row}: {item.data.name || 'Unknown'}</p>
                            <p className="text-red-600">{item.error}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>CSV Format Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your CSV file should include the following columns:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>name</strong> (required): Full name of the student</li>
                <li><strong>email</strong> (required): Email address</li>
                <li><strong>phone</strong> (optional): Phone number</li>
                <li><strong>registrationNumber</strong> (optional): Registration number</li>
                <li><strong>academicYear</strong> (optional): Academic year (defaults to current year)</li>
                <li><strong>courseId</strong> (required): Course ID number</li>
                <li><strong>currentSemester</strong> (optional): Current semester (defaults to 1)</li>
                <li><strong>yearOfStudy</strong> (optional): Year of study 1-6 (defaults to 1)</li>
                <li><strong>academicLevel</strong> (optional): certificate/diploma/bachelor/masters/phd (defaults to 'bachelor')</li>
                <li><strong>password</strong> (optional): Password (defaults to 'student123')</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lecturers Tab */}
        <TabsContent value="lecturers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Upload Lecturers
              </CardTitle>
              <CardDescription>
                Upload multiple lecturers at once using a CSV file. Download the template to see the required format.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Download */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Download CSV Template</p>
                    <p className="text-sm text-muted-foreground">
                      Get the correct format for lecturer data
                    </p>
                  </div>
                </div>
                <Button onClick={downloadLecturerTemplate} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="lecturer-csv">Select CSV File</Label>
                <Input
                  id="lecturer-csv"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Upload Button */}
              <Button 
                onClick={uploadLecturers} 
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Lecturers
                  </>
                )}
              </Button>

              {/* Upload Results */}
              {uploadResult && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Upload Results</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="text-2xl font-bold text-green-600">
                              {uploadResult.successful.length}
                            </p>
                            <p className="text-sm text-green-700">Successful</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <XCircle className="h-8 w-8 text-red-600" />
                          <div>
                            <p className="text-2xl font-bold text-red-600">
                              {uploadResult.failed.length}
                            </p>
                            <p className="text-sm text-red-700">Failed</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Failed Records */}
                  {uploadResult.failed.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Failed Records
                      </h4>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {uploadResult.failed.map((item, index) => (
                          <div key={index} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                            <p className="font-medium">Row {item.row}: {item.data.name || 'Unknown'}</p>
                            <p className="text-red-600">{item.error}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>CSV Format Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your CSV file should include the following columns:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>name</strong> (required): Full name of the lecturer</li>
                <li><strong>email</strong> (required): Email address</li>
                <li><strong>phone</strong> (optional): Phone number</li>
                <li><strong>employeeId</strong> (required): Employee ID</li>
                <li><strong>specialization</strong> (optional): Area of specialization</li>
                <li><strong>password</strong> (optional): Password (defaults to 'lecturer123')</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
