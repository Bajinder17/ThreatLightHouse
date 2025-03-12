import os
import json
import logging
from datetime import datetime
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables - use both .env file and system environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase configuration - prioritize system environment variables (for Heroku)
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.getenv("SUPABASE_KEY")

# Initialize Supabase client
supabase = None

def init_supabase():
    """Initialize Supabase client"""
    global supabase
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.warning("Supabase credentials not found. Using mock database.")
        return False
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialized")
        return True
    except Exception as e:
        logger.error(f"Error initializing Supabase client: {e}")
        return False

# Call init when module is imported
supabase_available = init_supabase()

# In-memory mock database for use when Supabase is not configured
mock_db = {
    "reports": []
}

def create_report(report_data):
    """Create a new report in the database"""
    try:
        if not report_data:
            logger.error("No report data provided")
            return None
        
        # Add timestamps
        now = datetime.now().isoformat()
        report_data["created_at"] = now
        report_data["updated_at"] = now
        
        # Generate an ID if not present
        if "id" not in report_data:
            import uuid
            report_data["id"] = str(uuid.uuid4())
        
        if supabase_available:
            # Store in Supabase
            logger.info(f"Storing report {report_data['id']} in Supabase")
            try:
                # Convert details to JSON string if needed
                if "details" in report_data and isinstance(report_data["details"], dict):
                    report_data["details"] = json.dumps(report_data["details"])
                
                result = supabase.table("reports").insert(report_data).execute()
                
                if result.data:
                    logger.info(f"Report stored successfully: {result.data[0]['id']}")
                    return result.data[0]
                else:
                    logger.error(f"Error storing report: {result.error}")
                    return None
            except Exception as e:
                logger.error(f"Error with Supabase: {e}")
                # Fall back to mock database
        
        # If Supabase not available or failed, use mock database
        logger.info(f"Storing report {report_data['id']} in mock database")
        mock_db["reports"].append(report_data)
        return report_data
    
    except Exception as e:
        logger.error(f"Error creating report: {e}")
        return None

def get_reports(report_type=None, start_date=None, end_date=None):
    """Get reports with optional filtering"""
    try:
        if supabase_available:
            # Get from Supabase
            logger.info("Fetching reports from Supabase")
            try:
                query = supabase.table("reports").select("*").order("created_at", desc=True)
                
                # Apply filters if provided
                if report_type and report_type != "all":
                    query = query.eq("type", report_type)
                
                if start_date:
                    query = query.gte("created_at", start_date)
                
                if end_date:
                    query = query.lte("created_at", end_date)
                
                result = query.execute()
                
                if result.data:
                    logger.info(f"Retrieved {len(result.data)} reports from Supabase")
                    
                    # Parse JSON details if needed
                    for report in result.data:
                        if "details" in report and isinstance(report["details"], str):
                            try:
                                report["details"] = json.loads(report["details"])
                            except:
                                pass
                    
                    return result.data
                else:
                    logger.warning("No reports found in Supabase")
                    return []
            except Exception as e:
                logger.error(f"Error with Supabase: {e}")
                # Fall back to mock database
        
        # If Supabase not available or failed, use mock database
        logger.info("Fetching reports from mock database")
        
        # Apply filters to mock data
        filtered_reports = mock_db["reports"]
        
        if report_type and report_type != "all":
            filtered_reports = [r for r in filtered_reports if r.get("type") == report_type]
        
        if start_date:
            filtered_reports = [r for r in filtered_reports if r.get("created_at", "") >= start_date]
        
        if end_date:
            filtered_reports = [r for r in filtered_reports if r.get("created_at", "") <= end_date]
        
        # Sort by created_at in descending order
        filtered_reports.sort(key=lambda r: r.get("created_at", ""), reverse=True)
        
        return filtered_reports
    
    except Exception as e:
        logger.error(f"Error getting reports: {e}")
        return []

def get_report_by_id(report_id):
    """Get a specific report by ID"""
    try:
        if not report_id:
            logger.error("No report ID provided")
            return None
        
        if supabase_available:
            # Get from Supabase
            logger.info(f"Fetching report {report_id} from Supabase")
            try:
                result = supabase.table("reports").select("*").eq("id", report_id).execute()
                
                if result.data and len(result.data) > 0:
                    report = result.data[0]
                    
                    # Parse JSON details if needed
                    if "details" in report and isinstance(report["details"], str):
                        try:
                            report["details"] = json.loads(report["details"])
                        except:
                            pass
                    
                    return report
                else:
                    logger.warning(f"Report {report_id} not found in Supabase")
                    return None
            except Exception as e:
                logger.error(f"Error with Supabase: {e}")
                # Fall back to mock database
        
        # If Supabase not available or failed, use mock database
        logger.info(f"Fetching report {report_id} from mock database")
        for report in mock_db["reports"]:
            if report.get("id") == report_id:
                return report
        
        return None
    
    except Exception as e:
        logger.error(f"Error getting report: {e}")
        return None

# Example schema for the reports table in Supabase:
"""
create table public.reports (
  id uuid not null default uuid_generate_v4(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  type text not null,
  target text not null,
  status text not null,
  details jsonb,
  scan_id text,
  
  primary key (id)
);

-- Set up Row Level Security (RLS)
alter table public.reports enable row level security;
"""
