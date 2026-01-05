import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileCheck, Upload, Clock, Check, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KycDocument {
  id: string;
  country: string;
  documentType: string;
  fileName: string;
  uploadedAt: Date;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

export default function KycDocumentsPage() {
  const { toast } = useToast();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    country: "",
    documentType: "",
  });

  const documents: KycDocument[] = [
    { id: "1", country: "United States", documentType: "Government ID", fileName: "passport.pdf", uploadedAt: new Date(Date.now() - 86400000), status: "approved" },
    { id: "2", country: "United States", documentType: "Proof of Address", fileName: "utility_bill.pdf", uploadedAt: new Date(Date.now() - 86400000), status: "approved" },
    { id: "3", country: "Germany", documentType: "Government ID", fileName: "id_card.pdf", uploadedAt: new Date(Date.now() - 3600000), status: "pending" },
  ];

  const handleUpload = () => {
    toast({ title: "Document Uploaded", description: "Your document has been submitted for review" });
    setShowUploadDialog(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <Check className="h-4 w-4 text-primary" />;
      case "rejected": return <X className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "approved": return "default";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">KYC Documents</h1>
          <p className="text-muted-foreground">Manage your verification documents</p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-doc">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload KYC Document</DialogTitle>
              <DialogDescription>
                Upload verification documents for DID provisioning
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select 
                  value={uploadForm.country}
                  onValueChange={(v) => setUploadForm({...uploadForm, country: v})}
                >
                  <SelectTrigger data-testid="select-upload-country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="fr">France</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select
                  value={uploadForm.documentType}
                  onValueChange={(v) => setUploadForm({...uploadForm, documentType: v})}
                >
                  <SelectTrigger data-testid="select-doc-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Government ID</SelectItem>
                    <SelectItem value="address">Proof of Address</SelectItem>
                    <SelectItem value="business">Business Registration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>File</Label>
                <Input type="file" data-testid="input-file" />
                <p className="text-xs text-muted-foreground">PDF, JPG, or PNG (max 10MB)</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} data-testid="button-submit-upload">
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{documents.filter(d => d.status === "approved").length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-muted">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{documents.filter(d => d.status === "pending").length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-destructive/10">
                <X className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{documents.filter(d => d.status === "rejected").length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id} data-testid={`row-doc-${doc.id}`}>
                  <TableCell>{doc.country}</TableCell>
                  <TableCell>{doc.documentType}</TableCell>
                  <TableCell className="font-mono text-sm">{doc.fileName}</TableCell>
                  <TableCell className="text-sm">
                    {doc.uploadedAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <Badge variant={getStatusVariant(doc.status)}>
                        {doc.status}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            KYC Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>To provision DIDs in certain countries, you must submit verification documents:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Government-issued ID (passport, national ID, or driver's license)</li>
              <li>Proof of address dated within the last 3 months</li>
              <li>Business registration documents (for business accounts)</li>
            </ul>
            <p className="text-muted-foreground">Documents are typically reviewed within 24-48 hours.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
