import httpx
import os 
from typing import Optional, List, Dict, Any

def tavily(  # <-- Function name MUST match the 'type' in the JSON
    query: str, 
    search_depth: str = "advanced",
    chunks_per_source: int = 3,
    topic: str = "general",
    days: int = 7,
    max_results: int = 5,
    include_answer: bool = True,
    time_range: Optional[str] = None,
    include_images: bool = True,
    include_domains: Optional[List[str]] = None,
    exclude_domains: Optional[List[str]] = None,
    include_raw_content: bool = False,
) -> Dict[str, Any]:
    """
    Tavily Search tool. Reads TAVILY_API_KEY from the environment.
    """
    
    api_key = os.environ.get("TAVILY_API_KEY") # <-- Reads from env
    if not api_key:
        return {"error": "TAVILY_API_KEY environment variable not set."}
    
    # ... (rest of the function is identical to tavily_search.py) ...
    try:
        url = "https://api.tavily.com/search"
        headers = { "content-type": "application/json", "accept": "application/json" }
        payload = {
            "api_key": api_key, "query": query, "search_depth": search_depth,
            "topic": topic, "max_results": max_results, "include_images": include_images,
            "include_answer": include_answer, "include_raw_content": include_raw_content,
        }
        if include_domains: payload["include_domains"] = include_domains
        if exclude_domains: payload["exclude_domains"] = exclude_domains
        if search_depth == "advanced" and chunks_per_source: payload["chunks_per_source"] = chunks_per_source
        if topic == "news" and days: payload["days"] = int(days)
        if time_range: payload["time_range"] = time_range

        with httpx.Client(timeout=90.0) as client:
            response = client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except httpx.TimeoutException:
        return {"error": "Request timed out (90s)."}
    except httpx.HTTPStatusError as exc:
        return {"error": f"HTTP error: {exc.response.status_code} - {exc.response.text}"}
    except httpx.RequestError as exc:
        return {"error": f"Request error: {exc}"}
    except ValueError as exc:
        return {"error": f"Invalid response format: {exc}"}