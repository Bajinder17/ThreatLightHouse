import os
import uuid
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import logging

# Import our scanning modules
from scanner.file_scanner import scan_file
from scanner.url_scanner import scan_url
from scanner.port_scanner import scan_ports
from database.supabase_client import create_report, get_reports, get_report_by_id

# Configure logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(name)s - %(levellevel)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32MB max file size

@app.route('/api/scan-file', methods=['POST'])
def api_scan_file():
    try:
        # Check if file exists in request
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        
        # If user does not select file, browser also
        # submits an empty part without filename
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        if file:
            # Generate unique filename
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            
            # Save file temporarily
            file.save(filepath)
            
            try:
                # Scan the file
                scan_result = scan_file(filepath)
                
                # Save the scan result to the database
                scan_id = str(uuid.uuid4())
                report_data = {
                    "type": "file",
                    "target": file.filename,
                    "status": "malicious" if scan_result.get("malicious") else "clean",
                    "details": scan_result,
                    "scan_id": scan_id
                }
                
                # Store in database
                create_report(report_data)
                
                # Add scan_id to the result
                scan_result["scan_id"] = scan_id
                
                return jsonify(scan_result)
            finally:
                # Clean up - remove the temporary file
                try:
                    os.remove(filepath)
                except Exception as e:
                    logger.error(f"Error removing temporary file: {e}")
                
    except Exception as e:
        logger.error(f"Error in file scanning endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/scan-url', methods=['POST'])
def api_scan_url():
    try:
        data = request.json
        if not data or 'url' not in data:
            return jsonify({"error": "URL is required"}), 400
        
        url = data['url']
        
        # Scan the URL
        scan_result = scan_url(url)
        
        # Save the scan result to the database
        scan_id = str(uuid.uuid4())
        report_data = {
            "type": "url",
            "target": url,
            "status": "malicious" if scan_result.get("malicious") else "clean",
            "details": scan_result,
            "scan_id": scan_id
        }
        
        # Store in database
        create_report(report_data)
        
        # Add scan_id to the result
        scan_result["scan_id"] = scan_id
        
        return jsonify(scan_result)
    
    except Exception as e:
        logger.error(f"Error in URL scanning endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/scan-ports', methods=['POST'])
def api_scan_ports():
    try:
        data = request.json
        if not data or 'host' not in data:
            return jsonify({"error": "Host is required"}), 400
        
        host = data['host']
        port_range = data.get('port_range', '1-1000')
        
        # Scan the ports
        scan_result = scan_ports(host, port_range)
        
        # Save the scan result to the database
        scan_id = str(uuid.uuid4())
        report_data = {
            "type": "port",
            "target": host,
            "status": "suspicious" if scan_result.get("open_ports") else "clean",
            "details": scan_result,
            "scan_id": scan_id
        }
        
        # Store in database
        create_report(report_data)
        
        # Add scan_id to the result
        scan_result["scan_id"] = scan_id
        
        return jsonify(scan_result)
    
    except Exception as e:
        logger.error(f"Error in port scanning endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/reports', methods=['GET'])
def api_get_reports():
    try:
        # Get filter parameters (optional)
        report_type = request.args.get('type')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Get reports from database
        reports = get_reports(report_type, start_date, end_date)
        
        return jsonify({"reports": reports})
    
    except Exception as e:
        logger.error(f"Error fetching reports: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
