"""
PDF Report Generator for ThreatLightHouse

This module generates PDF reports for different scan types:
- File scans
- URL scans
- Port scans

Dependencies:
- reportlab: Main PDF generation library
- Pillow: Required by reportlab for image processing

If you encounter dependency conflicts, try these solutions:
1. Use a virtual environment: python -m venv venv
2. Install specific versions: pip install reportlab==3.6.12 Pillow==9.5.0
3. If xhtml2pdf is needed: pip install xhtml2pdf==0.2.8

Note: This implementation uses reportlab directly to avoid dependency conflicts.
"""

import os
import tempfile
import logging
from datetime import datetime
import json
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_pdf_report(report_data):
    """
    Generate a PDF report from the scan data using ReportLab
    
    Args:
        report_data (dict): The report data containing all scan information
    
    Returns:
        bytes: The PDF report as bytes
    """
    try:
        # Create a temporary file
        pdf_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        pdf_path = pdf_file.name
        pdf_file.close()
        
        # Get report type
        report_type = report_data.get("type")
        
        # Create PDF content based on report type
        if report_type == "file":
            create_file_scan_pdf(pdf_path, report_data)
        elif report_type == "url":
            create_url_scan_pdf(pdf_path, report_data)
        elif report_type == "port":
            create_port_scan_pdf(pdf_path, report_data)
        else:
            logger.error(f"Unknown report type: {report_type}")
            return None
        
        # Read the PDF file
        with open(pdf_path, "rb") as file:
            pdf_content = file.read()
            
        # Clean up temporary file
        try:
            os.remove(pdf_path)
        except:
            pass
            
        return pdf_content
        
    except Exception as e:
        logger.error(f"Error generating PDF: {e}")
        return None

def create_file_scan_pdf(pdf_path, report_data):
    """Create PDF for file scan report"""
    try:
        # Extract data
        target = report_data.get("target", "Unknown file")
        status = report_data.get("status", "unknown")
        scan_date = format_date(report_data.get("created_at"))
        scan_id = report_data.get("scan_id", "N/A")
        
        # Get details from the report
        details = report_data.get("details", {})
        if isinstance(details, str):
            try:
                details = json.loads(details)
            except:
                details = {}
        
        detections = details.get("detections", [])
        detection_count = len(detections)
        detection_rate = details.get("detection_rate", "0/0")
        
        # Create the PDF
        doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []
        
        # Add title
        title_style = styles["Title"]
        elements.append(Paragraph("ThreatLightHouse", title_style))
        elements.append(Paragraph("File Scan Report", styles["Heading1"]))
        elements.append(Spacer(1, 0.25*inch))
        
        # Add summary table
        summary_data = [
            ["File Name", target],
            ["Scan Date", scan_date],
            ["Scan ID", scan_id],
            ["Status", status.upper()],
            ["Detection Rate", detection_rate]
        ]
        
        summary_table = Table(summary_data, colWidths=[2*inch, 4*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(summary_table)
        elements.append(Spacer(1, 0.25*inch))
        
        # Add detection details section
        elements.append(Paragraph("Detection Details", styles["Heading2"]))
        elements.append(Spacer(1, 0.1*inch))
        
        if detection_count > 0:
            # Headers
            detection_data = [["Engine", "Threat Level", "Description"]]
            
            # Add each detection
            for detection in detections:
                detection_data.append([
                    detection.get('name', 'Unknown'),
                    detection.get('threat_level', 'Unknown'),
                    detection.get('description', 'No description')
                ])
            
            detection_table = Table(detection_data, colWidths=[1.5*inch, 1.5*inch, 3*inch])
            detection_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 6),
            ]))
            
            elements.append(detection_table)
        else:
            elements.append(Paragraph("No threats detected.", styles["Normal"]))
            
        # Add footer
        elements.append(Spacer(1, 1*inch))
        footer_text = f"Generated by ThreatLightHouse on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        elements.append(Paragraph(footer_text, styles["Italic"]))
        elements.append(Paragraph("This report is for informational purposes only.", styles["Italic"]))
        
        # Build the PDF
        doc.build(elements)
        return True
        
    except Exception as e:
        logger.error(f"Error creating file scan PDF: {e}")
        return False

def create_url_scan_pdf(pdf_path, report_data):
    """Create PDF for URL scan report"""
    try:
        # Extract data
        target = report_data.get("target", "Unknown URL")
        status = report_data.get("status", "unknown")
        scan_date = format_date(report_data.get("created_at"))
        scan_id = report_data.get("scan_id", "N/A")
        
        # Get details from the report
        details = report_data.get("details", {})
        if isinstance(details, str):
            try:
                details = json.loads(details)
            except:
                details = {}
                
        risk_level = details.get("risk_level", "unknown")
        categories = details.get("categories", [])
        detection_stats = details.get("detection_stats", {})
        
        # Create the PDF
        doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []
        
        # Add title
        title_style = styles["Title"]
        elements.append(Paragraph("ThreatLightHouse", title_style))
        elements.append(Paragraph("URL Scan Report", styles["Heading1"]))
        elements.append(Spacer(1, 0.25*inch))
        
        # Add summary table
        summary_data = [
            ["URL", target],
            ["Scan Date", scan_date],
            ["Scan ID", scan_id],
            ["Status", status.upper()],
            ["Risk Level", risk_level.upper()]
        ]
        
        summary_table = Table(summary_data, colWidths=[2*inch, 4*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(summary_table)
        elements.append(Spacer(1, 0.25*inch))
        
        # Add detection statistics
        elements.append(Paragraph("Detection Statistics", styles["Heading2"]))
        elements.append(Spacer(1, 0.1*inch))
        
        stats_data = [
            ["Malicious", str(detection_stats.get('malicious', 0))],
            ["Suspicious", str(detection_stats.get('suspicious', 0))],
            ["Harmless", str(detection_stats.get('harmless', 0))]
        ]
        
        stats_table = Table(stats_data, colWidths=[2*inch, 4*inch])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(stats_table)
        elements.append(Spacer(1, 0.25*inch))
        
        # Add categories
        elements.append(Paragraph("Categories", styles["Heading2"]))
        elements.append(Spacer(1, 0.1*inch))
        
        if categories:
            categories_data = [[category] for category in categories]
            categories_table = Table(categories_data, colWidths=[6*inch])
            categories_table.setStyle(TableStyle([
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('PADDING', (0, 0), (-1, -1), 6),
            ]))
            
            elements.append(categories_table)
        else:
            elements.append(Paragraph("No suspicious categories detected.", styles["Normal"]))
        
        # Add footer
        elements.append(Spacer(1, 1*inch))
        footer_text = f"Generated by ThreatLightHouse on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        elements.append(Paragraph(footer_text, styles["Italic"]))
        elements.append(Paragraph("This report is for informational purposes only.", styles["Italic"]))
        
        # Build the PDF
        doc.build(elements)
        return True
        
    except Exception as e:
        logger.error(f"Error creating URL scan PDF: {e}")
        return False

def create_port_scan_pdf(pdf_path, report_data):
    """Create PDF for port scan report"""
    try:
        # Extract data
        target = report_data.get("target", "Unknown host")
        status = report_data.get("status", "unknown")
        scan_date = format_date(report_data.get("created_at"))
        scan_id = report_data.get("scan_id", "N/A")
        
        # Get details from the report
        details = report_data.get("details", {})
        if isinstance(details, str):
            try:
                details = json.loads(details)
            except:
                details = {}
                
        host = details.get("host", target)
        ports_scanned = details.get("ports_scanned", "N/A")
        open_ports = details.get("open_ports", [])
        open_ports_count = len(open_ports)
        
        # Create the PDF
        doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []
        
        # Add title
        title_style = styles["Title"]
        elements.append(Paragraph("ThreatLightHouse", title_style))
        elements.append(Paragraph("Port Scan Report", styles["Heading1"]))
        elements.append(Spacer(1, 0.25*inch))
        
        # Add summary table
        summary_data = [
            ["Host", host],
            ["Scan Date", scan_date],
            ["Scan ID", scan_id],
            ["Status", status.upper()],
            ["Ports Scanned", ports_scanned],
            ["Open Ports Found", str(open_ports_count)]
        ]
        
        summary_table = Table(summary_data, colWidths=[2*inch, 4*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(summary_table)
        elements.append(Spacer(1, 0.25*inch))
        
        # Add open ports
        elements.append(Paragraph("Open Ports", styles["Heading2"]))
        elements.append(Spacer(1, 0.1*inch))
        
        if open_ports_count > 0:
            # Headers
            ports_data = [["Port", "Service", "State", "Risk"]]
            
            # Add each port
            for port in open_ports:
                ports_data.append([
                    str(port.get('port', 'N/A')),
                    port.get('service', 'unknown'),
                    port.get('state', 'unknown'),
                    port.get('risk', 'Low')
                ])
            
            ports_table = Table(ports_data, colWidths=[1*inch, 2*inch, 1*inch, 2*inch])
            ports_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 6),
            ]))
            
            elements.append(ports_table)
        else:
            elements.append(Paragraph("No open ports were found in the specified range.", styles["Normal"]))
            
        # Add footer
        elements.append(Spacer(1, 1*inch))
        footer_text = f"Generated by ThreatLightHouse on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        elements.append(Paragraph(footer_text, styles["Italic"]))
        elements.append(Paragraph("This report is for informational purposes only.", styles["Italic"]))
        
        # Build the PDF
        doc.build(elements)
        return True
        
    except Exception as e:
        logger.error(f"Error creating port scan PDF: {e}")
        return False

def format_date(date_str):
    """Format date string to a readable format"""
    try:
        if not date_str:
            return "N/A"
        
        # Try parsing ISO format
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return dt.strftime("%Y-%m-%d %H:%M:%S UTC")
    except:
        # If parsing fails, return original string
        return date_str
