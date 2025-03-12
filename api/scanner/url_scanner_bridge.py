"""
Bridge script to use url_scanner from Express.js
"""
import sys
import json
import uuid
from url_scanner import scan_url

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "URL is required"}))
        return

    url = sys.argv[1]
    
    # Scan the URL
    scan_result = scan_url(url)
    
    # Add scan_id
    scan_id = str(uuid.uuid4())
    scan_result["scan_id"] = scan_id
    
    # Print result as JSON
    print(json.dumps(scan_result))

if __name__ == "__main__":
    main()
