import httpx
import time
from typing import Dict, Any, Optional


def check_health(url: str, timeout: float = 10.0) -> Dict[str, Any]:
    """
    Perform a health check on the given URL.
    
    Args:
        url: The URL to check
        timeout: Request timeout in seconds (default: 10.0)
        
    Returns:
        A dictionary with the following keys:
        - status_code: HTTP status code or None if request failed
        - response_time: Response time in seconds
        - error: Error message if request failed, None otherwise
    """
    start_time = time.time()
    try:
        response = httpx.get(url, timeout=timeout)
        response_time = time.time() - start_time
        return {
            "status_code": response.status_code,
            "response_time": response_time,
            "error": None
        }
    except httpx.TimeoutException:
        response_time = time.time() - start_time
        return {
            "status_code": None,
            "response_time": response_time,
            "error": "Request timeout"
        }
    except httpx.RequestError as e:
        response_time = time.time() - start_time
        return {
            "status_code": None,
            "response_time": response_time,
            "error": str(e)
        }
    except Exception as e:
        response_time = time.time() - start_time
        return {
            "status_code": None,
            "response_time": response_time,
            "error": f"Unexpected error: {str(e)}"
        }


# Optional: A class-based service for more complex scenarios
class HealthCheckerService:
    def __init__(self, timeout: float = 10.0):
        self.timeout = timeout
    
    def check(self, url: str) -> Dict[str, Any]:
        return check_health(url, self.timeout)