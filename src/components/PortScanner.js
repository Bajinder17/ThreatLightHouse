import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, ProgressBar, Table } from 'react-bootstrap';
import API from '../utils/api';
import { getErrorMessage, logError } from '../utils/errorHandler';
import LoadingSpinner from './common/LoadingSpinner';

const PortScanner = () => {
  const [host, setHost] = useState('');
  const [portRange, setPortRange] = useState('1-1000');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleHostChange = (e) => {
    setHost(e.target.value);
    setError('');
  };

  const handlePortRangeChange = (e) => {
    setPortRange(e.target.value);
    setError('');
  };

  const validateInputs = () => {
    if (!host) {
      setError('Please enter a host to scan');
      return false;
    }

    const portRangePattern = /^(\d+)(?:-(\d+))?$/;
    const match = portRange.match(portRangePattern);
    
    if (!match) {
      setError('Invalid port range format. Use "start-end" or a single port number.');
      return false;
    }

    const start = parseInt(match[1]);
    const end = match[2] ? parseInt(match[2]) : start;

    if (start < 1 || end > 65535 || start > end) {
      setError('Ports must be between 1-65535 and start port must be less than or equal to end port');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateInputs()) {
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
          return prev + 5;
        });
      }, 500);
      
      const response = await API.scanPorts(host, portRange);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setScanResult(response.data);
      setIsLoading(false);
    } catch (err) {
      logError(err, 'PortScanner.handleSubmit');
      setError('Error scanning ports: ' + getErrorMessage(err));
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <Container className="scan-container">
      <h2 className="scan-heading">Port Scanner</h2>
      <p className="text-muted mb-4">
        Scan network ports to identify open services and potential security vulnerabilities.
      </p>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="hostInput" className="mb-3">
          <Form.Label>Host</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="example.com or 192.168.1.1" 
            value={host} 
            onChange={handleHostChange} 
          />
          <Form.Text className="text-muted">
            Enter a domain name or IP address
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="portRangeInput" className="mb-4">
          <Form.Label>Port Range</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="1-1000" 
            value={portRange} 
            onChange={handlePortRangeChange} 
          />
          <Form.Text className="text-muted">
            Enter a single port (e.g., 80) or a range (e.g., 1-1000)
          </Form.Text>
        </Form.Group>

        {isLoading ? (
          <div className="my-4">
            <p>Scanning ports... Please wait.</p>
            <ProgressBar animated now={progress} label={`${progress}%`} />
          </div>
        ) : (
          <Button type="submit" variant="primary" className="action-btn">
            Scan Ports
          </Button>
        )}
      </Form>

      {scanResult && !isLoading && (
        <Card className="result-card">
          <Card.Header as="h5">Scan Results</Card.Header>
          <Card.Body>
            <Card.Title>
              Port Scan Complete for {host}
            </Card.Title>
            
            <div className="mt-3">
              <p><strong>Host:</strong> {host}</p>
              <p><strong>Ports Scanned:</strong> {portRange}</p>
              <p><strong>Scan ID:</strong> {scanResult.scan_id}</p>
              <p><strong>Scan Date:</strong> {new Date().toLocaleString()}</p>
              <p><strong>Open Ports Found:</strong> {scanResult.open_ports?.length || 0}</p>
            </div>
            
            {scanResult.open_ports && scanResult.open_ports.length > 0 ? (
              <div className="mt-4">
                <h6>Open Ports:</h6>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Port</th>
                      <th>Service</th>
                      <th>State</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanResult.open_ports.map((port, index) => (
                      <tr key={index}>
                        <td>{port.port}</td>
                        <td>{port.service}</td>
                        <td>{port.state}</td>
                        <td className={port.risk === 'High' ? 'text-danger' : 
                          port.risk === 'Medium' ? 'text-warning' : 'text-success'}>
                          {port.risk}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <Alert variant="info" className="mt-3">
                No open ports were found in the specified range.
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default PortScanner;
