import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import { logError } from '../utils/errorHandler';

const Home = () => {
  const [scanStats, setScanStats] = useState({
    fileScanCount: 0,
    urlScanCount: 0,
    portScanCount: 0,
    threatsDetected: 0
  });
  
  // Use useCallback to memoize the fetchScanStats function so it can be used as a dependency
  const fetchScanStats = useCallback(async () => {
    try {
      const response = await API.getReports();
      const reports = response.data.reports || [];
      
      const stats = reports.reduce((acc, report) => {
        switch(report.type) {
          case 'file':
            acc.fileScanCount++;
            break;
          case 'url':
            acc.urlScanCount++;
            break;
          case 'port':
            acc.portScanCount++;
            break;
          default:
            break;
        }
        
        if (report.status === 'malicious' || report.status === 'suspicious') {
          acc.threatsDetected++;
        }
        
        return acc;
      }, {
        fileScanCount: 0,
        urlScanCount: 0,
        portScanCount: 0,
        threatsDetected: 0
      });
      
      setScanStats(stats);
    } catch (err) {
      logError(err, 'Home.fetchScanStats');
    }
  }, []);

  // Set up a refresh interval for the stats
  useEffect(() => {
    fetchScanStats(); // Initial fetch
    
    // Set up polling to refresh stats every 30 seconds
    const intervalId = setInterval(() => {
      fetchScanStats();
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchScanStats]);

  // Add a custom event listener to refresh stats when a scan is completed
  useEffect(() => {
    // Define the event handler
    const handleScanComplete = () => {
      fetchScanStats();
    };
    
    // Add event listener
    window.addEventListener('scan-complete', handleScanComplete);
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('scan-complete', handleScanComplete);
    };
  }, [fetchScanStats]);

  return (
    <>
      <section className="hero-section">
        <div className="hero-pattern"></div>
        <Container>
          <Row className="align-items-center">
            <Col lg={7} className="pe-lg-5">
              <h1>Secure Your Digital World</h1>
              <p className="lead">
                Advanced threat detection powered by AI and machine learning to protect 
                your files, websites and network from emerging cyber threats.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Button 
                  as={Link} 
                  to="/file-scan" 
                  size="lg" 
                  className="btn-glow"
                >
                  Start Scanning
                </Button>
                {/* Reports button has been removed */}
              </div>
            </Col>
            <Col lg={5} className="mt-5 mt-lg-0 text-center">
              <div className="hero-animation">
                🔐
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="features-section">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Advanced Security Features</h2>
            <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '700px' }}>
              ThreatLightHouse provides comprehensive security solutions to protect your digital assets.
            </p>
          </div>

          <Row className="g-4">
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon-container">
                    <div className="feature-icon">📄</div>
                  </div>
                  <h5>File Scanner</h5>
                  <p>
                    Upload and scan files to detect malware, viruses, and other threats using 
                    advanced scanning technology.
                  </p>
                  <Button as={Link} to="/file-scan" variant="outline-primary" className="mt-3">
                    Scan Files
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon-container">
                    <div className="feature-icon">🔗</div>
                  </div>
                  <h5>URL Scanner</h5>
                  <p>
                    Check if websites are malicious, phishing sites, or contain malware 
                    before visiting them.
                  </p>
                  <Button as={Link} to="/url-scan" variant="outline-primary" className="mt-3">
                    Scan URLs
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon-container">
                    <div className="feature-icon">🔌</div>
                  </div>
                  <h5>Port Scanner</h5>
                  <p>
                    Scan network ports to identify open services and potential security 
                    vulnerabilities.
                  </p>
                  <Button as={Link} to="/port-scan" variant="outline-primary" className="mt-3">
                    Scan Ports
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="stats-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={5} className="mb-4 mb-lg-0">
              <h2 className="fw-bold mb-4 fs-1">Real-time Security Insights</h2>
              <p className="lead mb-4">
                Stay informed with advanced analytics and comprehensive threat detection
                to maintain robust security posture.
              </p>
              <div className="d-flex flex-wrap gap-3">
                {/* Reports button has been replaced with multiple scan buttons */}
                <Button as={Link} to="/file-scan" variant="primary" size="lg">
                  Scan Files
                </Button>
                <Button as={Link} to="/url-scan" variant="outline-primary" size="lg">
                  Scan URLs
                </Button>
              </div>
            </Col>
            <Col lg={7}>
              <div className="stats-card p-4">
                <h4 className="mb-4 fw-bold">Security Statistics</h4>
                <div className="stats-grid">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                      <span>File Scans</span>
                      <span className="badge badge-primary rounded-pill">{scanStats.fileScanCount}</span>
                    </li>
                    <li className="list-group-item">
                      <span>URL Scans</span>
                      <span className="badge badge-primary rounded-pill">{scanStats.urlScanCount}</span>
                    </li>
                    <li className="list-group-item">
                      <span>Port Scans</span>
                      <span className="badge badge-primary rounded-pill">{scanStats.portScanCount}</span>
                    </li>
                    <li className="list-group-item">
                      <span>Threats Detected</span>
                      <span className="badge badge-danger rounded-pill">{scanStats.threatsDetected}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;
