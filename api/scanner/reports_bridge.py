"""
Bridge script to access reports from Express.js
"""
import sys
import json
import uuid
from database.supabase_client import get_reports, get_report_by_id

def main():
    # Check if report_id is provided for single report retrieval
    if len(sys.argv) > 1 and sys.argv[1] != 'all':
        report_id = sys.argv[1]
        report = get_report_by_id(report_id)
        if report:
            print(json.dumps({"report": report}))
        else:
            print(json.dumps({"error": "Report not found"}))
        return
        
    # Handle filters
    report_type = sys.argv[2] if len(sys.argv) > 2 else None
    start_date = sys.argv[3] if len(sys.argv) > 3 else None
    end_date = sys.argv[4] if len(sys.argv) > 4 else None
    
    # Get reports
    reports = get_reports(report_type, start_date, end_date)
    
    # Print result as JSON
    print(json.dumps({"reports": reports}))

if __name__ == "__main__":
    main()
