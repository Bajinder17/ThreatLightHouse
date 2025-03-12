"""
Direct Output Generator for ThreatLightHouse

This module provides an even simpler direct report generation approach
that avoids file system interactions and returns bytes directly.
"""
import json
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_report_bytes(report_data):
    try:
        from report_generator.simple_report import generate_text_report
        content = generate_text_report(report_data).encode('utf-8')
        return content, "text/plain", "txt"
    except Exception as e:
        logger.error(f"Error generating direct report: {e}")
        report_type = report_data.get("type", "unknown")
        target = report_data.get("target", "Unknown")
        scan_id = report_data.get("scan_id", "N/A")
        
        fallback_content = f"""
THREATLIGHTHOUSE SCAN REPORT
============================
Type: {report_type}
Target: {target}
Scan ID: {scan_id}
Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

This is a fallback report format. The full report could not be generated.
        """.encode('utf-8')
        
        return fallback_content, "text/plain", "txt"
