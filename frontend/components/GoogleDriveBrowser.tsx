'use client';

import React, { useState, useCallback } from 'react';

interface GoogleFile {
  id: string;
  name: string;
  mimeType: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

interface GoogleDriveBrowserProps {
  onFilesSelected: (files: File[]) => void;
}

export default function GoogleDriveBrowser({ onFilesSelected }: GoogleDriveBrowserProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState<GoogleFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<GoogleFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localFiles, setLocalFiles] = useState<File[]>([]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    setLocalFiles(prev => [...prev, ...uploadedFiles]);
    onFilesSelected([...localFiles, ...uploadedFiles]);
  }, [localFiles, onFilesSelected]);

  const removeLocalFile = useCallback((index: number) => {
    const newFiles = localFiles.filter((_, i) => i !== index);
    setLocalFiles(newFiles);
    onFilesSelected(newFiles);
  }, [localFiles, onFilesSelected]);

  const toggleFileSelection = (file: GoogleFile) => {
    if (selectedFiles.find(f => f.id === file.id)) {
      setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  // For now, we'll use local file upload
  // Google Drive integration can be added later with OAuth

  return (
    <div className="google-drive-browser">
      <h2>Select Winning Ads</h2>

      <div className="upload-section">
        <p>Upload your best-performing ad creatives</p>

        <div className="file-upload-area">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            id="file-upload"
            className="file-input"
          />
          <label htmlFor="file-upload" className="file-label">
            <span>Click to upload or drag and drop</span>
            <span className="file-types">PNG, JPG, GIF, MP4 up to 50MB</span>
          </label>
        </div>

        {localFiles.length > 0 && (
          <div className="uploaded-files">
            <h3>Uploaded Files ({localFiles.length})</h3>
            <div className="file-grid">
              {localFiles.map((file, index) => (
                <div key={index} className="file-card">
                  {file.type.startsWith('image/') && (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="file-preview"
                    />
                  )}
                  {file.type.startsWith('video/') && (
                    <div className="video-placeholder">Video</div>
                  )}
                  <p className="file-name">{file.name}</p>
                  <button
                    onClick={() => removeLocalFile(index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .google-drive-browser {
          padding: 20px;
        }

        h2 {
          margin-bottom: 20px;
          color: #333;
        }

        .upload-section p {
          color: #666;
          margin-bottom: 15px;
        }

        .file-upload-area {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .file-upload-area:hover {
          border-color: #0066FF;
        }

        .file-input {
          display: none;
        }

        .file-label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
        }

        .file-types {
          font-size: 12px;
          color: #999;
        }

        .uploaded-files {
          margin-top: 30px;
        }

        .uploaded-files h3 {
          margin-bottom: 15px;
          color: #333;
        }

        .file-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
        }

        .file-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
        }

        .file-preview {
          width: 100%;
          height: 100px;
          object-fit: cover;
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .video-placeholder {
          width: 100%;
          height: 100px;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          margin-bottom: 8px;
          color: #666;
        }

        .file-name {
          font-size: 12px;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 8px;
        }

        .remove-btn {
          background: #ff4444;
          color: white;
          border: none;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }

        .remove-btn:hover {
          background: #cc0000;
        }
      `}</style>
    </div>
  );
}
