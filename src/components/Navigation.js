import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <Navbar bg="light" variant="light" expand="lg" className="py-2">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <div className="brand-icon">🔍</div>
          <span className="brand-text">ThreatLightHouse</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className={isActive('/') ? 'active' : ''}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/file-scan" className={isActive('/file-scan') ? 'active' : ''}>
              File Scan
            </Nav.Link>
            <Nav.Link as={Link} to="/url-scan" className={isActive('/url-scan') ? 'active' : ''}>
              URL Scan
            </Nav.Link>
            <Nav.Link as={Link} to="/port-scan" className={isActive('/port-scan') ? 'active' : ''}>
              Port Scan
            </Nav.Link>
            {/* Reports tab has been hidden */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
