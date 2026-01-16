import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Library, 
  BookOpen, 
  Search, 
  ExternalLink,
  BookMarked,
  FileText,
  GraduationCap,
  Globe,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export const LibraryPage = () => {
  const handleAccessLibrary = () => {
    // Open MUST Library in new tab
    window.open('https://catalog.must.ac.tz/', '_blank', 'noopener,noreferrer');
  };

  const libraryFeatures = [
    {
      icon: Search,
      title: "Search Catalog",
      description: "Search through thousands of books, journals, and digital resources"
    },
    {
      icon: BookMarked,
      title: "Reserve Books",
      description: "Reserve books online and pick them up at your convenience"
    },
    {
      icon: FileText,
      title: "Digital Resources",
      description: "Access e-books, research papers, and online journals"
    },
    {
      icon: GraduationCap,
      title: "Academic Support",
      description: "Find resources for your courses and research projects"
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MUST Library</h1>
          <p className="text-muted-foreground mt-1">
            Access the university library management system
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Library className="h-5 w-5 mr-2" />
          Online Access
        </Badge>
      </div>

      {/* Main Access Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Library className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">MUST Library Management System</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Your gateway to academic resources and research materials
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Access Button */}
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Ready to explore the library?</h3>
              <p className="text-muted-foreground">
                Click below to access the MUST Library catalog and resources
              </p>
            </div>
            
            <Button 
              onClick={handleAccessLibrary}
              size="lg"
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
            >
              <Globe className="h-5 w-5 mr-2" />
              Access MUST Library
              <ExternalLink className="h-5 w-5 ml-2" />
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Opens in a new tab: <span className="font-mono text-primary">catalog.must.ac.tz</span>
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
            {libraryFeatures.map((feature, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-white border hover:border-primary/50 transition-colors"
              >
                <div className="p-2 bg-primary/10 rounded-md">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Library Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Library Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Book Borrowing</p>
                <p className="text-sm text-muted-foreground">Borrow physical books for your studies</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Online Catalog</p>
                <p className="text-sm text-muted-foreground">Search and browse available resources</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Research Assistance</p>
                <p className="text-sm text-muted-foreground">Get help with your research projects</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Study Spaces</p>
                <p className="text-sm text-muted-foreground">Quiet areas for individual and group study</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <ArrowRight className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Use Your Student ID</p>
                <p className="text-sm text-muted-foreground">Login with your registration number</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Advanced Search</p>
                <p className="text-sm text-muted-foreground">Use filters to find specific resources quickly</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Check Availability</p>
                <p className="text-sm text-muted-foreground">See if books are available before visiting</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Renew Online</p>
                <p className="text-sm text-muted-foreground">Extend your borrowing period through the system</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Library className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-800 mb-3">
                If you have any questions about library services or need assistance accessing resources, 
                please contact the library staff or visit the library help desk.
              </p>
              <div className="space-y-1 text-sm text-blue-700">
                <p><span className="font-medium">Location:</span> MUST Main Campus Library Building</p>
                <p><span className="font-medium">Email:</span> library@must.ac.tz</p>
                <p><span className="font-medium">Phone:</span> +255 25 260 3511</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
