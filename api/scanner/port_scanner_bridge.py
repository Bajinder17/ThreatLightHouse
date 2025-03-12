"""
Bridge script to use port_scanner from Express.js
"""
import sys
import json
import uuid
from port_scanner import scan_ports

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Host is required"}))
        return

    host = sys.argv[1]
    port_range = sys.argv[2] if len(sys.argv) > 2 else '1-1000'
    
    # Scan the ports
    scan_result = scan_ports(host, port_range)
    
    # Add scan_id
    scan_id = str(uuid.uuid4())
    scan_result["scan_id"] = scan_id
    
    # Print result as JSON
    print(json.dumps(scan_result))

if __name__ == "__main__":
    main()
