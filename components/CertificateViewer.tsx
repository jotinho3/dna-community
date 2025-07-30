import React, { useState, useEffect } from 'react';
import { WorkshopCertificate } from '../types/workshop';
import workshopService from '../api/workshopApiLayer';

interface CertificateViewerProps {
  certificateId?: string;
  verificationCode?: string;
  onClose?: () => void;
}

const CertificateViewer: React.FC<CertificateViewerProps> = ({
  certificateId,
  verificationCode,
  onClose,
}) => {
  const [certificate, setCertificate] = useState<WorkshopCertificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (certificateId || verificationCode) {
      fetchCertificate();
    }
  }, [certificateId, verificationCode]);

  const fetchCertificate = async () => {
    setLoading(true);
    setError(null);

    try {
      let data: WorkshopCertificate;
      
      if (verificationCode) {
        const response = await workshopService.verifyCertificate(verificationCode);
        if (!response.isValid || !response.certificate) {
          throw new Error(response.error || 'Certificate not found or invalid');
        }
        data = response.certificate;
      } else if (certificateId) {
        data = await workshopService.getCertificate(certificateId);
      } else {
        throw new Error('No certificate ID or verification code provided');
      }

      setCertificate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate) return;

    setDownloading(true);
    try {
      const blob = await workshopService.downloadCertificate(certificate.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificate.workshopTitle.replace(/[^a-z0-9]/gi, '_')}_certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (!certificate) return;

    const verificationUrl = `${window.location.origin}/certificates/verify/${certificate.verificationCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Certificate: ${certificate.workshopTitle}`,
        text: `Check out this workshop certificate for ${certificate.workshopTitle}!`,
        url: verificationUrl,
      });
    } else {
      navigator.clipboard.writeText(verificationUrl);
      alert('Certificate verification link copied to clipboard!');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpired = () => {
    if (!certificate?.validUntil) return false;
    return new Date(certificate.validUntil) < new Date();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="bg-red-50 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Certificate Not Found</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={fetchCertificate}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!certificate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Certificate Details</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Certificate Content */}
        <div className="p-8">
          {/* Certificate Preview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8 mb-8 text-center border-2 border-blue-200">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="mb-6">
                <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate of Completion</h1>
                <p className="text-gray-600">DNA Community Workshop Program</p>
              </div>

              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-2">This certifies that</p>
                <p className="text-2xl font-bold text-blue-600 mb-2">{certificate.userName}</p>
                <p className="text-lg text-gray-700 mb-2">has successfully completed</p>
                <p className="text-xl font-semibold text-gray-900">{certificate.workshopTitle}</p>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-4">
                <div>
                  <p>Completed: {formatDate(certificate.completedAt)}</p>
                  <p>Issued: {formatDate(certificate.issuedAt)}</p>
                </div>
                <div className="text-right">
                  <p>Certificate ID:</p>
                  <p className="font-mono">{certificate.verificationCode}</p>
                </div>
              </div>

              {isExpired() && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm font-medium">
                    ⚠️ This certificate has expired on {formatDate(certificate.validUntil!)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Certificate Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-700">Workshop</dt>
                  <dd className="text-sm text-gray-900">{certificate.workshopTitle}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Recipient</dt>
                  <dd className="text-sm text-gray-900">{certificate.userName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Completion Date</dt>
                  <dd className="text-sm text-gray-900">{formatDate(certificate.completedAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Issue Date</dt>
                  <dd className="text-sm text-gray-900">{formatDate(certificate.issuedAt)}</dd>
                </div>
                {certificate.validUntil && (
                  <div>
                    <dt className="text-sm font-medium text-gray-700">Valid Until</dt>
                    <dd className="text-sm text-gray-900">{formatDate(certificate.validUntil)}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-700">Verification Code</dt>
                  <dd className="text-sm text-gray-900 font-mono">{certificate.verificationCode}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Status</dt>
                  <dd className="text-sm">
                    {isExpired() ? (
                      <span className="text-red-600 font-medium">Expired</span>
                    ) : (
                      <span className="text-green-600 font-medium">Valid</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Verification URL</dt>
                  <dd className="text-sm text-blue-600 break-all">
                    {window.location.origin}/certificates/verify/{certificate.verificationCode}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share Certificate
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateViewer;