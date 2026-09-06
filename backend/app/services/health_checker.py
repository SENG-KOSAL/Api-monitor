import base64
import httpx
import time
from typing import Dict, Any, Optional


MAX_BODY_LENGTH = 5000


def _truncate_body(text: Optional[str]) -> Optional[str]:
    if text is None:
        return None
    if len(text) > MAX_BODY_LENGTH:
        return text[:MAX_BODY_LENGTH]
    return text


def build_auth_headers(
    auth_type: Optional[str] = None,
    auth_token: Optional[str] = None,
    auth_username: Optional[str] = None,
    auth_password: Optional[str] = None,
) -> Dict[str, str]:
    """
    Construct HTTP headers for authentication.
    """
    if auth_type == "bearer" and auth_token and auth_token.strip():
        return {"Authorization": f"Bearer {auth_token.strip()}"}
    if (
        auth_type == "basic"
        and auth_username is not None
        and auth_password is not None
        and auth_username.strip()
        and auth_password.strip()
    ):
        credentials = f"{auth_username.strip()}:{auth_password.strip()}"
        encoded = base64.b64encode(credentials.encode("utf-8")).decode("ascii")
        return {"Authorization": f"Basic {encoded}"}
    return {}


def check_health(url: str, timeout: float = 10.0, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    Perform a health check on the given URL.
    
    Args:
        url: The URL to check
        timeout: Request timeout in seconds (default: 10.0)
        headers: Optional HTTP headers (e.g. for authentication)
        
    Returns:
        A dictionary with the following keys:
        - status_code: HTTP status code or None if request failed
        - reason_phrase: HTTP reason phrase (e.g. "Unauthorized") or None
        - response_time: Response time in seconds
        - error: Error message if request failed, None otherwise
        - headers: Response headers as a dict, or None if request failed
        - body: Response body text (truncated), or None if request failed
    """
    start_time = time.time()
    try:
        response = httpx.get(url, timeout=timeout, headers=headers)
        response_time = time.time() - start_time
        return {
            "status_code": response.status_code,
            "reason_phrase": response.reason_phrase,
            "response_time": response_time,
            "error": None,
            "headers": dict(response.headers),
            "body": _truncate_body(response.text),
        }
    except httpx.TimeoutException:
        response_time = time.time() - start_time
        return {
            "status_code": None,
            "reason_phrase": None,
            "response_time": response_time,
            "error": "Request timeout",
            "headers": None,
            "body": None,
        }
    except httpx.RequestError as e:
        response_time = time.time() - start_time
        return {
            "status_code": None,
            "reason_phrase": None,
            "response_time": response_time,
            "error": str(e),
            "headers": None,
            "body": None,
        }
    except Exception as e:
        response_time = time.time() - start_time
        return {
            "status_code": None,
            "reason_phrase": None,
            "response_time": response_time,
            "error": f"Unexpected error: {str(e)}",
            "headers": None,
            "body": None,
        }


# Optional: A class-based service for more complex scenarios
class HealthCheckerService:
    def __init__(self, timeout: float = 10.0):
        self.timeout = timeout
    
    def check(self, url: str, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        return check_health(url, self.timeout, headers=headers)