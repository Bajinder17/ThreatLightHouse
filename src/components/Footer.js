import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <Container>
        <Row className="py-3">
          <Col lg={8} className="d-flex align-items-center">
            <div>
              <h5>ThreatLightHouse</h5>
              <p className="mb-0">Advanced threat detection platform for identifying security risks in files, URLs, and network infrastructure.</p>
            </div>
          </Col>
          <Col lg={4} className="d-flex align-items-center justify-content-lg-end mt-3 mt-lg-0">
            <ul className="list-unstyled d-flex flex-wrap mb-0 gap-4">
              <li><Link to="/file-scan">File Scanner</Link></li>
              <li><Link to="/url-scan">URL Scanner</Link></li>
              <li><Link to="/port-scan">Port Scanner</Link></li>
            </ul>
          </Col>
        </Row>
        <Row className="mt-2 pt-2 border-top border-secondary">
          <Col className="text-center">
            <p className="small mb-0">© {new Date().getFullYear()} ThreatLightHouse. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
