import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, ProgressBar } from 'react-bootstrap';
import API from '../utils/api';
import { getErrorMessage, logError } from '../utils/errorHandler';

const FileScanner = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to scan');
      return;
    }

    try {
      setIsLoading(true);
      setProgress(10);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      const response = await API.scanFile(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setScanResult(response.data);
      setIsLoading(false);
    } catch (err) {
      logError(err, 'FileScanner.handleSubmit');
      setError('Error scanning file: ' + getErrorMessage(err));
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <Container className="scan-container">
      <h2 className="scan-heading">File Scanner</h2>
      <p className="text-muted mb-4">
        Upload a file to scan for viruses, malware, and other threats using our advanced scanning technology.
      </p>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="fileUpload" className="mb-3">
          <Form.Label>Choose File</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
          <Form.Text className="text-muted">
            Maximum file size: 32MB
          </Form.Text>
        </Form.Group>

        {isLoading ? (
          <div className="my-4">
            <p>Scanning file... Please wait.</p>
            <ProgressBar animated now={progress} label={`${progress}%`} />
          </div>
        ) : (
          <Button type="submit" variant="primary" className="action-btn">
            Scan File
          </Button>
        )}
      </Form>

      {scanResult && !isLoading && (
        <Card className="result-card">
          <Card.Header as="h5">Scan Results</Card.Header>
          <Card.Body>
            <Card.Title>
              {scanResult.malicious ? 
                <span className="text-danger">Threats Detected!</span> : 
                <span className="text-success">File is Clean</span>
              }
            </Card.Title>
            
            <div className="mt-3">
              <p><strong>File Name:</strong> {file.name}</p>
              <p><strong>File Type:</strong> {file.type || 'Unknown'}</p>
              <p><strong>File Size:</strong> {Math.round(file.size / 1024)} KB</p>
              <p><strong>Scan ID:</strong> {scanResult.scan_id}</p>
              <p><strong>Scan Date:</strong> {new Date().toLocaleString()}</p>
            </div>
            
            <div className="mt-4">
              <h6>Detection Details:</h6>
              <ul>
                {scanResult.detections?.map((detection, index) => (
                  <li key={index} className={detection.threat_level === 'high' ? 'text-danger' : ''}>
                    {detection.name}: {detection.description}
                  </li>
                ))}
                {scanResult.detections?.length === 0 && <li>No threats detected</li>}
              </ul>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default FileScanner;
