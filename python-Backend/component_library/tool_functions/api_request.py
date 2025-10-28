import httpx
from typing import Optional, Dict, Any

def api_request(
    method: str,
    url: str,
    headers: Optional[Dict[str, str]] = None,
    params: Optional[Dict[str, Any]] = None,
    data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Performs an HTTP request.

    Args:
        method (str): The HTTP method (e.g., "GET", "POST", "PUT", "DELETE", "PATCH").
        url (str): The URL for the request.
        headers (Optional[Dict[str, str]]): A dictionary of headers to send.
        params (Optional[Dict[str, Any]]): A dictionary of query parameters.
        data (Optional[Dict[str, Any]]): The JSON body for "POST", "PUT", "PATCH" requests.

    Returns:
        Dict[str, Any]: The JSON response from the API, or a dictionary with an "error" key.
    """
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.request(
                method=method.upper(),
                url=url,
                headers=headers,
                params=params,
                json=data  # 'json' kwarg handles serializing 'data' and setting content-type
            )
        
        # Raise an exception for bad HTTP status codes
        response.raise_for_status()
        
        # Try to return JSON, fall back to raw text if it's not JSON
        try:
            return response.json()
        except Exception:
            return {"content": response.text}

    except httpx.TimeoutException:
        return {"error": "Request timed out (30s)."}
    except httpx.HTTPStatusError as exc:
        return {"error": f"HTTP error: {exc.response.status_code} - {exc.response.text}"}
    except httpx.RequestError as exc:
        return {"error": f"Request error: {exc}"}
    except Exception as exc:
        return {"error": f"An unexpected error occurred: {str(exc)}"}