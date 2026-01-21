import random
from datetime import datetime, timedelta

class MarketEngine:
    def __init__(self):
        self.tickers = [
            {"symbol": "NIFTY", "name": "Nifty 50", "price": 21456.70, "change": 120.50, "pct": 0.56, "color": "#10b981"},
            {"symbol": "SENSEX", "name": "BSE Sensex", "price": 71200.45, "change": 350.20, "pct": 0.49, "color": "#10b981"},
            {"symbol": "BANKNIFTY", "name": "Bank Nifty", "price": 47800.10, "change": -110.00, "pct": -0.23, "color": "#ef4444"},
            
            # Tech
            {"symbol": "TCS", "name": "Tata CS", "price": 3890.50, "change": 45.00, "pct": 1.17, "color": "#10b981"},
            {"symbol": "INFY", "name": "Infosys", "price": 1540.00, "change": -25.00, "pct": -1.60, "color": "#ef4444"},
            {"symbol": "HCLTECH", "name": "HCL Tech", "price": 1450.20, "change": 12.00, "pct": 0.83, "color": "#10b981"},
            {"symbol": "WIPRO", "name": "Wipro Ltd", "price": 460.50, "change": -2.50, "pct": -0.54, "color": "#ef4444"},
            
            # Banks/Finance
            {"symbol": "HDFCBANK", "name": "HDFC Bank", "price": 1680.00, "change": 2.00, "pct": 0.12, "color": "#10b981"},
            {"symbol": "ICICIBANK", "name": "ICICI Bank", "price": 995.00, "change": 5.00, "pct": 0.50, "color": "#10b981"},
            {"symbol": "SBIN", "name": "State Bank", "price": 640.00, "change": -8.00, "pct": -1.23, "color": "#ef4444"},
            {"symbol": "BAJFINANCE", "name": "Bajaj Fin", "price": 7200.00, "change": 150.00, "pct": 2.13, "color": "#10b981"},
            
            # Auto & Energy
            {"symbol": "RELIANCE", "name": "Reliance Ind.", "price": 2580.00, "change": -15.00, "pct": -0.58, "color": "#ef4444"},
            {"symbol": "TATAMOTORS", "name": "Tata Motors", "price": 780.00, "change": 14.00, "pct": 1.83, "color": "#10b981"},
            {"symbol": "M&M", "name": "Mahindra", "price": 1720.00, "change": 22.00, "pct": 1.30, "color": "#10b981"},
            {"symbol": "MARUTI", "name": "Maruti Suzuki", "price": 10200.00, "change": -50.00, "pct": -0.49, "color": "#ef4444"},
            
            # Consumer & Others
            {"symbol": "ITC", "name": "ITC Ltd", "price": 450.00, "change": 1.00, "pct": 0.22, "color": "#10b981"},
            {"symbol": "HINDUNILVR", "name": "HUL", "price": 2600.00, "change": -10.00, "pct": -0.38, "color": "#ef4444"},
            {"symbol": "ZOMATO", "name": "Zomato", "price": 135.00, "change": 4.00, "pct": 3.05, "color": "#10b981"},
            {"symbol": "PAYTM", "name": "Paytm", "price": 650.00, "change": -20.00, "pct": -2.99, "color": "#ef4444"},

            # US Markets
            {"symbol": "AAPL", "name": "Apple Inc.", "price": 193.50, "change": 1.50, "pct": 0.78, "color": "#10b981"},
            {"symbol": "NVDA", "name": "Nvidia Corp", "price": 488.90, "change": 12.40, "pct": 2.60, "color": "#10b981"},
            {"symbol": "TSLA", "name": "Tesla Inc", "price": 248.00, "change": -5.50, "pct": -2.17, "color": "#ef4444"},
            {"symbol": "MSFT", "name": "Microsoft", "price": 375.00, "change": 2.00, "pct": 0.54, "color": "#10b981"},
            {"symbol": "GOOGL", "name": "Alphabet (Google)", "price": 140.00, "change": 0.80, "pct": 0.57, "color": "#10b981"},
        ]
        
        self.news_db = [
            {"source": "Economic Times", "headline": "Nifty hits fresh all-time high led by IT stocks", "time": "2h ago"},
            {"source": "Bloomberg", "headline": "Global markets rally as inflation cools down", "time": "4h ago"},
            {"source": "Mint", "headline": "Reliance announces new green energy initiative", "time": "6h ago"},
            {"source": "Yahoo Finance", "headline": "Apple Vision Pro expected to boost Q1 revenue", "time": "1d ago"},
            {"source": "CNBC", "headline": "Why Tech Stocks are becoming a safe haven", "time": "1d ago"},
        ]

    def get_market_data(self):
        # Simulator: Randomly jitter the prices to make it feel "Live"
        for t in self.tickers:
            jitter = random.uniform(-0.5, 0.5)
            t["price"] += jitter
            t["price"] = round(t["price"], 2)
            
            # Update Change % logic roughly
            t["change"] = round(t["change"] + jitter, 2)
            t["pct"] = round((t["change"] / t["price"]) * 100, 2)
            t["color"] = "#10b981" if t["change"] >= 0 else "#ef4444"

        return {
            "tickers": self.tickers,
            "news": self.news_db
        }

    def get_ticker_details(self, symbol: str):
        # Generate a fake intraday chart
        chart_data = []
        base_price = next((t["price"] for t in self.tickers if t["symbol"] == symbol), 1000)
        
        current = base_price * 0.98 # Start slightly lower/higher
        for i in range(50): # 50 points
            current = current + random.uniform(-current*0.01, current*0.01)
            chart_data.append({"time": f"{9+int(i/6)}:{i%6}0", "price": round(current, 2)})
            
        ticker_info = next((t for t in self.tickers if t["symbol"] == symbol), None)
            
        return {
            "symbol": symbol,
            "info": ticker_info,
            "chart": chart_data,
            "about": f"{symbol} is a leading company in its sector. This is a mock description for PennyWise demo.",
            "key_stats": {
                "Open": round(base_price * 0.99, 2),
                "High": round(base_price * 1.02, 2),
                "Low": round(base_price * 0.98, 2),
                "Vol": "1.2M",
                "P/E": "24.5",
                "Mkt Cap": "12.4T"
            }
        }

market_engine = MarketEngine()
