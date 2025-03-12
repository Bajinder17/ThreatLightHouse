import os
import logging
import requests
import time
import urllib.parse
from dotenv import load_dotenv
from virustotal_python import Virustotal

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API Keys
VIRUSTOTAL_API_KEY = os.getenv('VIRUSTOTAL_API_KEY', '')

def scan_url_with_virustotal(url):
    """Scan a URL using the VirusTotal API"""
    try:
        if not VIRUSTOTAL_API_KEY:
            logger.warning("VirusTotal API key not found")
            return {
                "malicious": False,
                "message": "VirusTotal API key not configured",
                "categories": [],
                "risk_level": "unknown"
            }
            
        # Initialize VirusTotal client
        vt = Virustotal(API_KEY=VIRUSTOTAL_API_KEY)
        
        # URL ID for VirusTotal is the base64 representation of the URL
        url_id = urllib.parse.quote(url, safe='')
        
        # First try to get existing report
        try:
            result = vt.request(f"urls/{url_id}")
            if result.get('data'):
                logger.info("URL report found in VirusTotal")
                return process_vt_url_results(result, url)
        except Exception as e:
            logger.info(f"No existing report found, will submit URL: {e}")
            
        # Submit URL for scanning
        params = {'url': url}
        result = vt.request("urls", params=params, method="POST")
        
        # Get scan ID from submission response
        if 'data' in result and 'id' in result['data']:
            analysis_id = result['data']['id']
            
            # Poll for analysis results
            max_attempts = 5
            attempts = 0
            while attempts < max_attempts:
                attempts += 1
                time.sleep(3)  # Wait between polling attempts
                
                try:
                    # Get analysis results using the URL ID
                    url_id = urllib.parse.quote(url, safe='')
                    result = vt.request(f"urls/{url_id}")
                    
                    if 'data' in result and 'attributes' in result['data']:
                        logger.info("Analysis completed")
                        return process_vt_url_results(result, url)
                except Exception as e:
                    logger.error(f"Error polling for results: {e}")
                
                logger.info(f"Analysis in progress, attempt {attempts}/{max_attempts}")
            
            # If we reached here, analysis didn't complete in time
            return {
                "malicious": False,
                "message": "Analysis timeout - please try again later",
                "scan_id": analysis_id,
                "categories": [],
                "risk_level": "unknown"
            }
        else:
            logger.error("No analysis ID in response")
            return {
                "malicious": False,
                "message": "Error submitting URL for analysis",
                "categories": [],
                "risk_level": "unknown"
            }
    
    except Exception as e:
        logger.error(f"Error in VirusTotal URL scan: {e}")
        return {
            "malicious": False,
            "message": f"Error scanning with VirusTotal: {str(e)}",
            "categories": [],
            "risk_level": "unknown"
        }

def process_vt_url_results(result, url):
    """Process and format VirusTotal URL scan results"""
    try:
        if 'data' in result and 'attributes' in result['data']:
            attributes = result['data']['attributes']
            last_analysis_stats = attributes.get('last_analysis_stats', {})
            
            # Check if any engines detected the URL as malicious
            malicious_count = last_analysis_stats.get('malicious', 0)
            suspicious_count = last_analysis_stats.get('suspicious', 0)
            malicious = (malicious_count + suspicious_count) > 0
            
            # Determine risk level
            risk_level = "low"
            if malicious_count > 3:
                risk_level = "high"
            elif malicious_count > 0 or suspicious_count > 0:
                risk_level = "medium"
            
            # Extract categories
            categories = []
            last_analysis_results = attributes.get('last_analysis_results', {})
            
            for engine_name, engine_result in last_analysis_results.items():
                if engine_result.get('category') in ['malicious', 'suspicious']:
                    category = engine_result.get('result', '').lower()
                    if category and category not in categories:
                        categories.append(f"{engine_name}: {category}")
            
            return {
                "malicious": malicious,
                "url": url,
                "categories": categories,
                "risk_level": risk_level,
                "total_engines": sum(last_analysis_stats.values()),
                "detection_stats": {
                    "malicious": malicious_count,
                    "suspicious": suspicious_count,
                    "harmless": last_analysis_stats.get('harmless', 0)
                }
            }
    
    except Exception as e:
        logger.error(f"Error processing VirusTotal URL results: {e}")
    
    # Default response if processing fails
    return {
        "malicious": False,
        "url": url,
        "categories": [],
        "risk_level": "unknown",
        "message": "Error processing scan results"
    }

def scan_url(url):
    """Main function to scan a URL"""
    logger.info(f"Scanning URL: {url}")
    
    # Basic validation
    if not url.startswith(('http://', 'https://')):
        return {
            "malicious": False,
            "error": "Invalid URL format. Must start with http:// or https://",
            "categories": [],
            "risk_level": "unknown"
        }
    
    # If VirusTotal API key is available, use it
    if VIRUSTOTAL_API_KEY:
        logger.info("Using VirusTotal for URL scanning")
        return scan_url_with_virustotal(url)
    else:
        # Simple fallback scan
        logger.warning("VirusTotal API key not found, using fallback scanner")
        return {
            "malicious": False,
            "message": "Basic scan completed (VirusTotal API key not configured)",
            "categories": [],
            "risk_level": "low"
        }

# For testing purposes
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        result = scan_url(sys.argv[1])
        print(json.dumps(result, indent=2))
    else:
        print("Please provide a URL to scan")
