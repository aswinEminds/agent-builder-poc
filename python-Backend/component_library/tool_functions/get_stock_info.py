import yfinance as yf
from typing import Dict, Any

def get_stock_info(ticker_symbol: str) -> Dict[str, Any]:
    """
    Gets financial information for a given stock ticker symbol using Yahoo Finance.

    Args:
        ticker_symbol (str): The stock ticker symbol (e.g., "AAPL", "MSFT").

    Returns:
        Dict[str, Any]: A dictionary containing the stock's info, or an error.
    """
    try:
        ticker = yf.Ticker(ticker_symbol)
        info = ticker.info

        if not info or info.get('regularMarketPrice') is None:
            return {"error": f"Could not find valid data for ticker symbol: {ticker_symbol}"}

        # Filter for some of the most useful fields
        # The LLM can parse this to get what it needs
        useful_info = {
            "symbol": info.get("symbol"),
            "longName": info.get("longName"),
            "currency": info.get("currency"),
            "regularMarketPrice": info.get("regularMarketPrice"),
            "regularMarketOpen": info.get("regularMarketOpen"),
            "regularMarketDayHigh": info.get("regularMarketDayHigh"),
            "regularMarketDayLow": info.get("regularMarketDayLow"),
            "regularMarketPreviousClose": info.get("regularMarketPreviousClose"),
            "marketCap": info.get("marketCap"),
            "forwardPE": info.get("forwardPE"),
            "dividendYield": info.get("dividendYield"),
            "shortSummary": info.get("longBusinessSummary", "No summary available.")[:500]
        }
        
        return useful_info
    except Exception as e:
        return {"error": f"An error occurred while fetching data for {ticker_symbol}: {str(e)}"}