"""
Bridge script to use file_scanner from Express.js
"""
import sys
import json
import uuid
import os
from file_scanner import scan_file

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "File path is required"}))
        return

    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(json.dumps({"error": "File not found"}))
        return
    
    # Scan the file
    scan_result = scan_file(file_path)
    
    # Add scan_id
    scan_id = str(uuid.uuid4())
    scan_result["scan_id"] = scan_id
    
    # Print result as JSON
    print(json.dumps(scan_result))

if __name__ == "__main__":
    main()
