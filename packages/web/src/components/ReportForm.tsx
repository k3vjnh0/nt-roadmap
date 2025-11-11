import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { IncidentType, UserReport } from '../types';
import { INCIDENT_LABELS } from '../utils/helpers';
import { reportService } from '../services/api';

export function ReportForm() {
  const { showReportForm, toggleReportForm, userLocation, fetchIncidents } = useAppStore();
  const [type, setType] = useState<IncidentType>(IncidentType.OTHER);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!showReportForm) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userLocation) {
      alert('Location is required. Please enable location services.');
      return;
    }

    if (!description.trim()) {
      alert('Please provide a description.');
      return;
    }

    setIsSubmitting(true);

    const report: UserReport = {
      type,
      location: userLocation,
      description: description.trim(),
    };

    try {
      const result = await reportService.submitReport(report);
      if (result) {
        setSuccess(true);
        setDescription('');
        setType(IncidentType.OTHER);
        
        // Refresh incidents to show the new report
        await fetchIncidents();

        setTimeout(() => {
          setSuccess(false);
          toggleReportForm();
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={toggleReportForm}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Report an Incident</h3>
          <button
            onClick={toggleReportForm}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Demo Notice */}
        <div className="px-4 pt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-800">
              ℹ️ <strong>Demo Feature:</strong> User reports are not stored permanently. This app displays real incidents from NT Road Report API.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incident Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as IncidentType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              disabled={isSubmitting}
            >
              {Object.entries(INCIDENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Please describe what you observed..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              disabled={isSubmitting}
              required
            />
          </div>

          {userLocation && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-600">
                Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">Report submitted successfully!</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={toggleReportForm}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !userLocation}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
