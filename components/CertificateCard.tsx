import React, { useState } from 'react';
import { WorkshopCertificate } from '../types/workshop';
import workshopService from '../api/workshopApiLayer';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Download, 
  Share2, 
  Award, 
  Calendar, 
  User, 
  Clock, 
  Hash,
  ExternalLink,
  Copy
} from 'lucide-react';

interface CertificateCardProps {
  certificate: WorkshopCertificate;
  onDownload?: (certificateId: string) => void;
  onShare?: (certificate: WorkshopCertificate) => void;
  size?: 'sm' | 'md' | 'lg';
  // Optional enrollment data for completion info
  enrollmentData?: {
    completedAt?: string;
    rating?: number;
    feedback?: string;
  };
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onDownload,
  onShare,
  size = 'md',
  enrollmentData,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;

    setDownloading(true);
    setDownloadError(null);

    try {
      if (onDownload) {
        onDownload(certificate.id);
      } else {
        // Default download behavior
        const blob = await workshopService.downloadCertificate(certificate.id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${certificate.workshopTitle.replace(/[^a-z0-9]/gi, '_')}_certificate.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      setDownloadError('Failed to download certificate');
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (sharing) return;

    setSharing(true);
    setShareSuccess(false);

    try {
      if (onShare) {
        onShare(certificate);
      } else {
        // Default share behavior - copy verification link
        const verificationUrl = `${window.location.origin}/certificates/verify/${certificate.verificationCode}`;
        
        if (
          navigator.share &&
          typeof navigator.canShare === "function" &&
          navigator.canShare({ url: verificationUrl })
        ) {
          // Use native share API if available
          await navigator.share({
            title: `Certificate for ${certificate.workshopTitle}`,
            text: `Check out my certificate for completing "${certificate.workshopTitle}"`,
            url: verificationUrl,
          });
        } else {
          // Fallback to clipboard
          await navigator.clipboard.writeText(verificationUrl);
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 3000);
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      // Fallback to clipboard even if share fails
      try {
        const verificationUrl = `${window.location.origin}/certificates/verify/${certificate.verificationCode}`;
        await navigator.clipboard.writeText(verificationUrl);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    } finally {
      setSharing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpired = (): boolean => {
    if (!certificate.validUntil) return false;
    return new Date(certificate.validUntil) < new Date();
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-4';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  const getCardClasses = () => {
    const baseClasses = "bg-white rounded-lg border hover:shadow-lg transition-all duration-200";
    const sizeClasses = getSizeClasses();
    
    if (isExpired()) {
      return `${baseClasses} ${sizeClasses} border-red-200 bg-red-50`;
    }
    
    return `${baseClasses} ${sizeClasses} border-emerald-200 bg-gradient-to-br from-white to-emerald-50`;
  };

  return (
    <Card className={getCardClasses()}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-3 rounded-lg ${isExpired() ? 'bg-red-100' : 'bg-emerald-100'}`}>
              <Award className={`w-6 h-6 ${isExpired() ? 'text-red-600' : 'text-emerald-600'}`} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-slate-900 mb-1">
                {certificate.workshopTitle}
              </CardTitle>
              <p className="text-sm text-slate-600">Certificate of Completion</p>
              <p className="text-xs text-slate-500 mt-1">
                Issued by {certificate.organizationName}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            {isExpired() ? (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            ) : certificate.isVerified ? (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-xs">
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                Pending Verification
              </Badge>
            )}
            
            {certificate.shareableUrl && (
              <Badge variant="outline" className="text-xs">
                <ExternalLink className="w-3 h-3 mr-1" />
                Shareable
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Certificate Details */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-slate-600">
            <User className="w-4 h-4 mr-2 text-slate-400" />
            <span>Awarded to: </span>
            <span className="font-medium ml-1 text-slate-900">{certificate.userName}</span>
          </div>

          {/* Use completedAt from enrollmentData if available, otherwise use issuedAt */}
          {enrollmentData?.completedAt && (
            <div className="flex items-center text-sm text-slate-600">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              <span>Completed: </span>
              <span className="font-medium ml-1 text-slate-900">
                {formatDate(enrollmentData.completedAt)}
              </span>
            </div>
          )}

          <div className="flex items-center text-sm text-slate-600">
            <Clock className="w-4 h-4 mr-2 text-slate-400" />
            <span>Issued: </span>
            <span className="font-medium ml-1 text-slate-900">
              {formatDate(certificate.issuedAt instanceof Date ? certificate.issuedAt.toISOString() : certificate.issuedAt)}
            </span>
          </div>

          <div className="flex items-center text-sm text-slate-600">
            <Hash className="w-4 h-4 mr-2 text-slate-400" />
            <span>Certificate #: </span>
            <span className="font-mono font-medium ml-1 text-slate-900 text-xs">
              {certificate.certificateNumber}
            </span>
          </div>

          <div className="flex items-center text-sm text-slate-600">
            <Hash className="w-4 h-4 mr-2 text-slate-400" />
            <span>Verification Code: </span>
            <span className="font-mono font-medium ml-1 text-slate-900 text-xs">
              {certificate.verificationCode}
            </span>
          </div>

          {certificate.validUntil && (
            <div className="flex items-center text-sm text-slate-600">
              <Clock className="w-4 h-4 mr-2 text-slate-400" />
              <span>Valid until: </span>
              <span className={`font-medium ml-1 ${isExpired() ? 'text-red-600' : 'text-slate-900'}`}>
                {formatDate(certificate.validUntil instanceof Date ? certificate.validUntil.toISOString() : certificate.validUntil)}
              </span>
            </div>
          )}

          {certificate.verifiedAt && (
            <div className="flex items-center text-sm text-slate-600">
              <Award className="w-4 h-4 mr-2 text-slate-400" />
              <span>Verified: </span>
              <span className="font-medium ml-1 text-slate-900">
                {formatDate(certificate.verifiedAt instanceof Date ? certificate.verifiedAt.toISOString() : certificate.verifiedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Issuer Information */}
        <div className="pt-3 border-t border-slate-200">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Issued By</h4>
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span>Instructor: {certificate.issuerName}</span>
              {certificate.organizationLogo && (
                <img 
                  src={certificate.organizationLogo} 
                  alt={certificate.organizationName}
                  className="h-6 w-auto"
                />
              )}
            </div>
            {certificate.issuerTitle && (
              <div>Title: {certificate.issuerTitle}</div>
            )}
            <div>Organization: {certificate.organizationName}</div>
          </div>
        </div>

        {/* Skills and Competencies */}
        {certificate.skillsAcquired && certificate.skillsAcquired.length > 0 && (
          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Skills Acquired</h4>
            <div className="flex flex-wrap gap-1">
              {certificate.skillsAcquired.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
            {certificate.competencyLevel && (
              <div className="mt-2 text-xs text-slate-600">
                Competency Level: 
                <Badge variant="secondary" className="ml-1 text-xs capitalize">
                  {certificate.competencyLevel}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Rating and Feedback (if available from enrollment data) */}
        {enrollmentData?.rating && (
          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Workshop Rating</h4>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={`text-sm ${
                      index < enrollmentData.rating! ? 'text-yellow-400' : 'text-slate-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-slate-600">
                {enrollmentData.rating}/5
              </span>
            </div>
            {enrollmentData.feedback && (
              <p className="text-xs text-slate-600 mt-1 italic">
                "{enrollmentData.feedback}"
              </p>
            )}
          </div>
        )}

        {/* Error Display */}
        {downloadError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{downloadError}</p>
          </div>
        )}

        {/* Success Message */}
        {shareSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
            <p className="text-emerald-600 text-sm flex items-center">
              <Copy className="w-4 h-4 mr-2" />
              Verification link copied to clipboard!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <Button
            onClick={handleDownload}
            disabled={downloading || !certificate.pdfUrl}
            className="flex-1"
            variant={isExpired() ? "outline" : "default"}
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {certificate.pdfUrl ? 'Download PDF' : 'PDF Unavailable'}
              </>
            )}
          </Button>

          <Button
            onClick={handleShare}
            disabled={sharing}
            variant="outline"
            className="flex-1"
          >
            {sharing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </>
            )}
          </Button>
        </div>

        {/* Verification Link */}
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Verify certificate authenticity:</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto p-1"
              onClick={() => {
                const verificationUrl = `${window.location.origin}/certificates/verify/${certificate.verificationCode}`;
                window.open(verificationUrl, '_blank');
              }}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Verify
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateCard;