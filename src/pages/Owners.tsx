import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PdfViewerDialog from "@/components/PdfViewerDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, FileText, Download, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Owners = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // PDF Viewer state
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const openViewer = (src: string, title: string) => {
    setPdfSrc(src);
    setPdfTitle(title);
    setPdfOpen(true);
  };

  useEffect(() => {
    checkOwnerAccess();
  }, []);

  const checkOwnerAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Check if user has owner access
      const { data, error } = await supabase
        .from('owners_access')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking owner access:', error);
        setIsAuthenticated(false);
      } else if (data) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    toast({
      title: "Logged Out",
      description: "You've been logged out of the Owners Portal",
    });
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="text-white text-xl">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  // Access denied view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4 py-20">
          <Card className="w-full max-w-md bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-white">Access Denied</CardTitle>
              <CardDescription className="text-white/70">
                You don't have permission to access the owners portal. Please contact an administrator to request access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-white/60 text-center">
                  You must be logged in and have owner privileges to view this page.
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="flex-1"
                  >
                    Back to Home
                  </Button>
                  <Button 
                    onClick={() => navigate("/auth")}
                    className="flex-1"
                  >
                    Login
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Owners portal view (authenticated)
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-black via-gray-900 to-black px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Authenticated</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Owners Portal
            </h1>
            <p className="text-xl text-white/70 mb-6">
              Access exclusive resources and documentation
            </p>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* JotForm Card */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-primary" />
                  Owner Portal Form
                </CardTitle>
                <CardDescription className="text-white/70">
                  Access the main owners portal form
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => window.open("https://form.jotform.com/252743400922047", "_blank")}
                >
                  Open Portal Form
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Standard Operating Procedures */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Standard Operating Procedures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Equipment Maintenance SOP */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Equipment Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a 
                    href="/documents/Equipment_Maintenance_SOP.pdf" 
                    download
                    className="block"
                  >
                    <Button variant="secondary" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Daily Operations SOP */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Daily Operations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a 
                    href="/documents/Daily_Operations_SOP.pdf" 
                    download
                    className="block"
                  >
                    <Button variant="secondary" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Front Desk Guide SOP */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Front Desk Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a 
                    href="/documents/Front_Desk_Guide_Sop.pdf" 
                    download
                    className="block"
                  >
                    <Button variant="secondary" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Client Experience SOP */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Client Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a 
                    href="/documents/Client_Experience_SOP.pdf" 
                    download
                    className="block"
                  >
                    <Button variant="secondary" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Membership and Sales SOP */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Membership & Sales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a 
                    href="/documents/Membership_and_Sales_SOP.pdf" 
                    download
                    className="block"
                  >
                    <Button variant="secondary" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Electrical Specs */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Equipment/Electrical Specs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a 
                    href="/documents/Electrical_specs_Updated.pdf" 
                    download
                    className="block"
                  >
                    <Button variant="secondary" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Software/Misc */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Software/Misc
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a 
                    href="/documents/RRW_Setup_Checklist.pdf" 
                    download
                    className="block"
                  >
                    <Button variant="secondary" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Education SOP */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a 
                    href="/documents/Education_SOP.pdf" 
                    download
                    className="block"
                  >
                    <Button variant="secondary" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Instagram Marketing */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Instagram Marketing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a 
                    href="/documents/Instagram_Marketing.pdf" 
                    download
                    className="block"
                  >
                    <Button variant="secondary" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Google / Apple Business Setup */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Google / Apple Business Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a 
                    href="/documents/Google_Apple_Setup.pdf" 
                    download
                    className="block"
                  >
                    <Button variant="secondary" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <PdfViewerDialog open={pdfOpen} onOpenChange={setPdfOpen} file={pdfSrc ?? ""} title={pdfTitle} />
      </main>
      <Footer />
    </div>
  );
};

export default Owners;
