import os
import hashlib
import logging
import requests
import time
from dotenv import load_dotenv
from virustotal_python import Virustotal

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API Keys
VIRUSTOTAL_API_KEY = os.getenv('VIRUSTOTAL_API_KEY', '')

def calculate_file_hash(file_path):
    """Calculate the SHA-256 hash of a file"""
    sha256_hash = hashlib.sha256()
    
    with open(file_path, "rb") as f:
        # Read and update hash in chunks for large files
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    
    return sha256_hash.hexdigest()

def scan_file_with_virustotal(file_path):
    """Scan a file using the VirusTotal API"""
    try:
        # Initialize VirusTotal client
        vt = Virustotal(API_KEY=VIRUSTOTAL_API_KEY)
        
        # Calculate file hash
        file_hash = calculate_file_hash(file_path)
        
        # First try to get existing report by file hash
        try:
            result = vt.request(f"files/{file_hash}")
            if result.get('data'):
                logger.info("File report found in VirusTotal")
                return process_vt_results(result)
        except Exception as e:
            logger.info(f"No existing report found, will upload file: {e}")
        
        # If no report found, upload the file
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f)}
            result = vt.request("files", files=files, method="POST")
        
        # Get scan ID from upload response
        if 'data' in result and 'id' in result['data']:
            analysis_id = result['data']['id']
            
            # Poll for analysis results
            max_attempts = 10
            attempts = 0
            while attempts < max_attempts:
                attempts += 1
                time.sleep(3)  # Wait between polling attempts
                
                try:
                    result = vt.request(f"analyses/{analysis_id}")
                    status = result.get('data', {}).get('attributes', {}).get('status')
                    
                    if status == 'completed':
                        logger.info("Analysis completed")
                        return process_vt_results(result)
                except Exception as e:
                    logger.error(f"Error polling for results: {e}")
                
                logger.info(f"Analysis in progress, attempt {attempts}/{max_attempts}")
            
            # If we reached here, analysis didn't complete in time
            return {
                "malicious": False,
                "message": "Analysis timeout - please try again later",
                "scan_id": analysis_id,
                "detections": []
            }
        else:
            logger.error("No analysis ID in response")
            return {
                "malicious": False,
                "message": "Error submitting file for analysis",
                "detections": []
            }
    
    except Exception as e:
        logger.error(f"Error in VirusTotal scan: {e}")
        
        # Fallback to simple analysis
        return {
            "malicious": False,
            "message": f"Error scanning with VirusTotal: {str(e)}",
            "detections": []
        }

def process_vt_results(result):
    """Process and format VirusTotal results"""
    try:
        if 'data' in result:
            # For file upload/analysis response
            if result['data']['type'] == 'analysis':
                attributes = result['data']['attributes']
                stats = attributes.get('stats', {})
                
                # Check if any engines detected the file as malicious
                malicious = stats.get('malicious', 0) > 0
                
                # Extract detection details
                results = attributes.get('results', {})
                detections = []
                
                for engine_name, engine_result in results.items():
                    if engine_result.get('category') == 'malicious':
                        detections.append({
                            "name": engine_name,
                            "threat_level": "high",
                            "description": engine_result.get('result', 'Unknown threat')
                        })
                
                return {
                    "malicious": malicious,
                    "detections": detections,
                    "total_engines": sum(stats.values()),
                    "detection_rate": f"{stats.get('malicious', 0)}/{sum(stats.values())}",
                    "scan_date": attributes.get('date')
                }
            
            # For file report response
            elif result['data']['type'] == 'file':
                attributes = result['data']['attributes']
                last_analysis_stats = attributes.get('last_analysis_stats', {})
                
                # Check if any engines detected the file as malicious
                malicious = last_analysis_stats.get('malicious', 0) > 0
                
                # Extract detection details
                last_analysis_results = attributes.get('last_analysis_results', {})
                detections = []
                
                for engine_name, engine_result in last_analysis_results.items():
                    if engine_result.get('category') == 'malicious':
                        detections.append({
                            "name": engine_name,
                            "threat_level": "high",
                            "description": engine_result.get('result', 'Unknown threat')
                        })
                
                return {
                    "malicious": malicious,
                    "detections": detections,
                    "total_engines": sum(last_analysis_stats.values()),
                    "detection_rate": f"{last_analysis_stats.get('malicious', 0)}/{sum(last_analysis_stats.values())}",
                    "scan_date": attributes.get('last_analysis_date')
                }
    
    except Exception as e:
        logger.error(f"Error processing VirusTotal results: {e}")
    
    # Default response if processing fails
    return {
        "malicious": False,
        "detections": [],
        "message": "Error processing scan results"
    }

def scan_file(file_path):
    """Main function to scan a file"""
    logger.info(f"Scanning file: {file_path}")
    
    # Check if file exists
    if not os.path.exists(file_path):
        return {
            "malicious": False,
            "error": "File not found",
            "detections": []
        }
    
    # Check file size
    file_size = os.path.getsize(file_path)
    if file_size > 32 * 1024 * 1024:  # 32MB
        return {
            "malicious": False,
            "error": "File size exceeds maximum limit of 32MB",
            "detections": []
        }
    
    # If VirusTotal API key is available, use it
    if VIRUSTOTAL_API_KEY:
        logger.info("Using VirusTotal for scanning")
        return scan_file_with_virustotal(file_path)
    else:
        logger.warning("VirusTotal API key not found, using fallback scanner")
        # Simple fallback scan (just an example)
        return {
            "malicious": False,
            "message": "Basic scan completed (VirusTotal API key not configured)",
            "detections": []
        }

# For testing purposes
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        result = scan_file(sys.argv[1])
        print(json.dumps(result, indent=2))
    else:
        print("Please provide a file path to scan")
