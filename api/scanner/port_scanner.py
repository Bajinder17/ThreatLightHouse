import os
import logging
import socket
import re
import nmap
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Common port service mappings
COMMON_PORTS = {
    21: {"service": "FTP", "risk": "Medium"},
    22: {"service": "SSH", "risk": "Low"},
    23: {"service": "Telnet", "risk": "High"},
    25: {"service": "SMTP", "risk": "Medium"},
    53: {"service": "DNS", "risk": "Low"},
    80: {"service": "HTTP", "risk": "Low"},
    110: {"service": "POP3", "risk": "Medium"},
    135: {"service": "MS-RPC", "risk": "High"},
    139: {"service": "NetBIOS", "risk": "High"},
    143: {"service": "IMAP", "risk": "Medium"},
    443: {"service": "HTTPS", "risk": "Low"},
    445: {"service": "SMB", "risk": "High"},
    1433: {"service": "MSSQL", "risk": "Medium"},
    1521: {"service": "Oracle", "risk": "Medium"},
    3306: {"service": "MySQL", "risk": "Medium"},
    3389: {"service": "RDP", "risk": "Medium"},
    5432: {"service": "PostgreSQL", "risk": "Medium"},
    5900: {"service": "VNC", "risk": "High"},
    8080: {"service": "HTTP-Proxy", "risk": "Medium"}
}

def parse_port_range(port_range):
    """Parse port range string into start and end values"""
    pattern = r'^(\d+)(?:-(\d+))?$'
    match = re.match(pattern, port_range)
    
    if not match:
        raise ValueError(f"Invalid port range format: {port_range}")
    
    start = int(match.group(1))
    end = int(match.group(2) or start)
    
    if start < 1 or end > 65535 or start > end:
        raise ValueError("Ports must be between 1-65535 and start must be less than or equal to end")
    
    return start, end

def scan_with_nmap(host, port_range):
    """Scan ports using Nmap"""
    try:
        # Parse port range
        start, end = parse_port_range(port_range)
        
        # Initialize nmap scanner
        nm = nmap.PortScanner()
        
        # Run the scan
        logger.info(f"Starting Nmap scan of {host} on ports {start}-{end}")
        nm.scan(host, f"{start}-{end}", arguments="-sV -T4")
        
        # Process results
        open_ports = []
        
        # Check if host was scanned successfully
        if host in nm.all_hosts():
            # Get all open ports
            for proto in nm[host].all_protocols():
                lport = sorted(nm[host][proto].keys())
                
                for port in lport:
                    port_info = nm[host][proto][port]
                    if port_info['state'] == 'open':
                        service_name = port_info.get('name', 'unknown')
                        product = port_info.get('product', '')
                        version = port_info.get('version', '')
                        
                        # Determine risk level based on common ports
                        risk = COMMON_PORTS.get(port, {}).get("risk", "Low")
                        
                        # Add service version info if available
                        service_with_version = service_name
                        if product:
                            service_with_version = f"{product} {version}".strip()
                        
                        open_ports.append({
                            "port": port,
                            "service": service_with_version,
                            "state": "Open",
                            "risk": risk
                        })
        
        return {
            "host": host,
            "scan_time": datetime.now().isoformat(),
            "open_ports": open_ports,
            "ports_scanned": f"{start}-{end}"
        }
    
    except Exception as e:
        logger.error(f"Error in Nmap scan: {e}")
        raise

def scan_with_socket(host, port_range):
    """Fallback scanner using sockets"""
    try:
        # Parse port range
        start, end = parse_port_range(port_range)
        
        # Validate range size for socket scanner
        if end - start > 1000:
            # Limit scan to first 1000 ports if range is too large
            end = start + 1000
            logger.warning(f"Port range too large for socket scanner. Limiting to {start}-{end}")
        
        # Resolve hostname to IP
        try:
            ip = socket.gethostbyname(host)
        except socket.gaierror:
            return {
                "error": f"Could not resolve hostname: {host}",
                "open_ports": []
            }
        
        logger.info(f"Starting socket scan of {host} ({ip}) on ports {start}-{end}")
        
        open_ports = []
        socket.setdefaulttimeout(1)  # 1 second timeout
        
        # Scan ports
        for port in range(start, end + 1):
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            try:
                result = s.connect_ex((ip, port))
                if result == 0:  # Port is open
                    # Get service name if possible
                    try:
                        service_name = socket.getservbyport(port)
                    except:
                        service_name = "unknown"
                    
                    # Determine risk level
                    risk = COMMON_PORTS.get(port, {}).get("risk", "Low")
                    
                    open_ports.append({
                        "port": port,
                        "service": service_name,
                        "state": "Open",
                        "risk": risk
                    })
            except:
                pass
            finally:
                s.close()
        
        return {
            "host": host,
            "scan_time": datetime.now().isoformat(),
            "open_ports": open_ports,
            "ports_scanned": f"{start}-{end}"
        }
    
    except Exception as e:
        logger.error(f"Error in socket scan: {e}")
        raise

def scan_ports(host, port_range='1-1000'):
    """Main function to scan ports"""
    logger.info(f"Scanning ports for host: {host}, range: {port_range}")
    
    try:
        # Try to use Nmap first
        try:
            import nmap
            return scan_with_nmap(host, port_range)
        except ImportError:
            logger.warning("Nmap module not available. Using fallback socket scanner.")
            return scan_with_socket(host, port_range)
    except Exception as e:
        logger.error(f"Error scanning ports: {e}")
        return {
            "host": host,
            "error": str(e),
            "open_ports": []
        }

# For testing purposes
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        host = sys.argv[1]
        port_range = sys.argv[2] if len(sys.argv) > 2 else '1-1000'
        result = scan_ports(host, port_range)
        print(json.dumps(result, indent=2))
    else:
        print("Please provide a host to scan")
