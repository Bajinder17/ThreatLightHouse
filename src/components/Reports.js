import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Alert, Card, Form, Row, Col } from 'react-bootstrap';
import API from '../utils/api';
import { getErrorMessage, logError } from '../utils/errorHandler';
import LoadingSpinner from './common/LoadingSpinner';
import config from '../utils/config';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Prepare filters
      const filters = {};
      if (filter !== 'all') filters.type = filter;
      if (dateRange.start) filters.start_date = dateRange.start;
      if (dateRange.end) filters.end_date = dateRange.end;
      
      const response = await API.getReports(filters);
      setReports(response.data.reports);
      setError('');
    } catch (err) {
      logError(err, 'Reports.fetchReports');
      setError('Error fetching reports: ' + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const applyFilters = () => {
    fetchReports();
  };
  
  const getReportTypeIcon = (type) => {
    switch(type) {
      case 'file': return '📄';
      case 'url': return '🔗';
      case 'port': return '🔌';
      default: return '📊';
    }
  };

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'clean': 
        return <span className="badge bg-success">Clean</span>;
      case 'malicious': 
        return <span className="badge bg-danger">Malicious</span>;
      case 'suspicious': 
        return <span className="badge bg-warning text-dark">Suspicious</span>;
      default: 
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  return (
    <Container className="scan-container">
      <h2 className="scan-heading">Scan Reports</h2>
      <p className="text-muted mb-4">
        View your previous scan reports.
      </p>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Filter Reports</Card.Title>
          <Form>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Report Type</Form.Label>
                  <Form.Select value={filter} onChange={handleFilterChange}>
                    <option value="all">All Types</option>
                    <option value="file">File Scans</option>
                    <option value="url">URL Scans</option>
                    <option value="port">Port Scans</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>From Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="start" 
                    value={dateRange.start}
                    onChange={handleDateChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>To Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="end" 
                    value={dateRange.end}
                    onChange={handleDateChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" onClick={applyFilters}>
              Apply Filters
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <LoadingSpinner message="Loading reports..." />
      ) : reports.length === 0 ? (
        <Alert variant="info">No reports found. Try scanning some files, URLs, or ports first.</Alert>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Type</th>
              <th>Name/Target</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id}>
                <td>{getReportTypeIcon(report.type)} {report.type.charAt(0).toUpperCase() + report.type.slice(1)}</td>
                <td>{report.target}</td>
                <td>{new Date(report.created_at).toLocaleString()}</td>
                <td>{getStatusBadge(report.status)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Reports;
