import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, ProgressBar } from 'react-bootstrap';
import API from '../utils/api';
import { getErrorMessage, logError } from '../utils/errorHandler';
import LoadingSpinner from './common/LoadingSpinner';

const UrlScanner = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL to scan');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      setError('Please enter a valid URL');
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
      
      const response = await API.scanUrl(url);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setScanResult(response.data);
      setIsLoading(false);
    } catch (err) {
      logError(err, 'UrlScanner.handleSubmit');
      setError('Error scanning URL: ' + getErrorMessage(err));
      setIsLoading(false);
      setProgress(0);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  return (
    <Container className="scan-container">
      <h2 className="scan-heading">URL Scanner</h2>
      <p className="text-muted mb-4">
        Check if a website is malicious, a phishing site, or contains malware before visiting.
      </p>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="urlInput" className="mb-3">
          <Form.Label>Enter URL</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="https://example.com" 
            value={url} 
            onChange={handleUrlChange} 
          />
          <Form.Text className="text-muted">
            Enter the full URL including https:// or http://
          </Form.Text>
        </Form.Group>

        {isLoading ? (
          <div className="my-4">
            <p>Scanning URL... Please wait.</p>
            <ProgressBar animated now={progress} label={`${progress}%`} />
          </div>
        ) : (
          <Button type="submit" variant="primary" className="action-btn">
            Scan URL
          </Button>
        )}
      </Form>

      {scanResult && !isLoading && (
        <Card className="result-card">
          <Card.Header as="h5">Scan Results</Card.Header>
          <Card.Body>
            <Card.Title>
              {scanResult.malicious ? 
                <span className="text-danger">Malicious URL Detected!</span> : 
                <span className="text-success">URL is Safe</span>
              }
            </Card.Title>
            
            <div className="mt-3">
              <p><strong>URL:</strong> {url}</p>
              <p><strong>Risk Level:</strong> <span className={`text-${getRiskColor(scanResult.risk_level)}`}>{scanResult.risk_level || 'Low'}</span></p>
              <p><strong>Scan ID:</strong> {scanResult.scan_id}</p>
              <p><strong>Scan Date:</strong> {new Date().toLocaleString()}</p>
            </div>
            
            <div className="mt-4">
              <h6>Detection Details:</h6>
              <ul>
                {scanResult.categories?.map((category, index) => (
                  <li key={index}>{category}</li>
                ))}
                {(!scanResult.categories || scanResult.categories.length === 0) && <li>No suspicious categories detected</li>}
              </ul>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default UrlScanner;
