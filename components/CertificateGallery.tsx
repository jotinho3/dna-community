// filepath: src/components/certificates/CertificateGallery.tsx
import React, { useState, useEffect } from 'react';
import { WorkshopCertificate } from '../types/workshop';
import workshopService from '../api/workshopApiLayer';
import CertificateCard from './CertificateCard';

interface CertificateGalleryProps {
  userId: string;
  onCertificateClick?: (certificate: WorkshopCertificate) => void;
}

const CertificateGallery: React.FC<CertificateGalleryProps> = ({
  userId,
  onCertificateClick,
}) => {
  const [certificates, setCertificates] = useState<WorkshopCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'workshop' | 'completion'>('recent');
  const [filterExpired, setFilterExpired] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, [userId]);

  const fetchCertificates = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await workshopService.getUserCertificates(userId);
      setCertificates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const getSortedAndFilteredCertificates = () => {
    let filtered = [...certificates];

    // Filter expired certificates if requested
    if (filterExpired) {
      filtered = filtered.filter(cert => {
        if (!cert.validUntil) return true;
        return new Date(cert.validUntil) >= new Date();
      });
    }

    // Sort certificates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'workshop':
          return a.workshopTitle.localeCompare(b.workshopTitle);
        case 'completion':
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        case 'recent':
        default:
          return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
      }
    });

    return filtered;
  };

  const handleDownloadAll = async () => {
    try {
      // Download all certificates as a zip file (if your backend supports it)
      // Or download them one by one
      for (const certificate of certificates) {
        const blob = await workshopService.downloadCertificate(certificate.id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${certificate.workshopTitle.replace(/[^a-z0-9]/gi, '_')}_certificate.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Add delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Failed to download certificates:', error);
    }
  };

  const handleShareCertificate = (certificate: WorkshopCertificate) => {
    const verificationUrl = `${window.location.origin}/certificates/verify/${certificate.verificationCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Certificate: ${certificate.workshopTitle}`,
        text: `Check out my workshop certificate for ${certificate.workshopTitle}!`,
        url: verificationUrl,
      });
    } else {
      navigator.clipboard.writeText(verificationUrl);
      // Show toast notification
      alert('Certificate verification link copied to clipboard!');
    }
  };

  const filteredCertificates = getSortedAndFilteredCertificates();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchCertificates}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Certificates</h2>
          <p className="text-gray-600 mt-1">
            {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned
          </p>
        </div>

        {certificates.length > 0 && (
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={handleDownloadAll}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Download All
            </button>
          </div>
        )}
      </div>

      {/* Filters and Sorting */}
      {certificates.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort by
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="workshop">Workshop Name</option>
                  <option value="completion">Completion Date</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="filterExpired"
                  checked={filterExpired}
                  onChange={(e) => setFilterExpired(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="filterExpired" className="ml-2 block text-sm text-gray-900">
                  Hide expired certificates
                </label>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredCertificates.length} of {certificates.length} certificates
            </div>
          </div>
        </div>
      )}

      {/* Certificates Grid */}
      {filteredCertificates.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {certificates.length === 0 ? 'No certificates yet' : 'No certificates match your filters'}
          </h3>
          <p className="text-gray-600">
            {certificates.length === 0 
              ? 'Complete workshops to earn certificates and showcase your achievements!'
              : 'Try adjusting your filters to see more certificates.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              onShare={handleShareCertificate}
              size="md"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificateGallery;