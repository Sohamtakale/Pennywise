from datetime import datetime, timedelta

class FinanceEngine:
    def __init__(self):
        # Initial balance set to 0 as requested by user
        self.current_balance = 0.00
        # Mock Data (In real app, this comes from the local SQLite Vault)
        self.avg_monthly_spend = 35000.00
        self.upcoming_bills = [
            {"name": "Rent", "amount": 25000.00, "due_date": "2024-01-05"},
            {"name": "Electricity", "amount": 2400.00, "due_date": "2024-01-10"},
            {"name": "Wifi", "amount": 1200.00, "due_date": "2024-01-07"},
        ]
        self.subscriptions = [
            {"name": "Netflix Premium", "amount": 649.00, "last_used": "2023-10-15", "status": "UNUSED_LEAK"},
            {"name": "Adobe Creative Cloud", "amount": 4230.00, "last_used": "2023-12-20", "status": "ACTIVE"},
            {"name": "Gym Membership", "amount": 2000.00, "last_used": "2023-01-10", "status": "UNUSED_LEAK"},
            {"name": "Spotify", "amount": 119.00, "last_used": "2023-12-25", "status": "ACTIVE"},
        ]
        self.scholarships = [
            {"name": "Merit Scholarship 2024", "amount": 15000.00, "criteria": "GPA > 3.5"},
            {"name": "State Education Grant", "amount": 12000.00, "criteria": "Resident"},
            {"name": "Tech Future Fund", "amount": 8000.00, "criteria": "CS Major"},
        ]
        self.ledger_history = [] # List of {date, description, amount, type: IN/OUT}

    def add_transaction(self, description: str, amount: float, type: str):
        """Adds a clean transaction to the ledger and updates balance."""
        entry = {
            "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "description": description,
            "amount": amount,
            "type": type # 'IN' or 'OUT'
        }
        self.ledger_history.append(entry)
        
        if type == "IN":
            self.current_balance += amount
        elif type == "OUT":
            self.current_balance -= amount
            
        return entry

    def get_ledger(self):
        return {
            "balance": self.current_balance,
            "history": self.ledger_history[::-1] # Newest first
        }

    def clear_ledger(self):
        """Resets the ledger transaction history and balance."""
        self.ledger_history = []
        self.current_balance = 0.00
        return {"status": "cleared", "message": "Ledger history and balance reset."}

    def get_financial_context(self) -> str:
        """Returns a string summary of financial health for the AI."""
        total_bills = sum(bill["amount"] for bill in self.upcoming_bills)
        safe_to_spend = self.current_balance - total_bills
        
        bills_summary = ", ".join([f"{b['name']} (Rs {b['amount']})" for b in self.upcoming_bills])
        
        return (
            f"DATABANK:\n"
            f"- Current Balance: Rs {self.current_balance}\n"
            f"- Upcoming Bills (Must Pay): {bills_summary} Total: Rs {total_bills}\n"
            f"- Safe-to-Spend (Free Cash): Rs {safe_to_spend}\n"
            f"- Rule: REJECT any purchase > Safe-to-Spend. ALERT if purchase eats into Bill money."
        )

    def get_subscription_report(self) -> str:
        leaks = [s for s in self.subscriptions if s["status"] == "UNUSED_LEAK"]
        total_leak = sum(s["amount"] for s in leaks)
        
        report = "SUBSCRIPTION DETECTIVE REPORT:\n"
        if leaks:
             report += f"ALERT: Found {len(leaks)} unused subscriptions wasting Rs {total_leak}/month!\n"
             for leak in leaks:
                 report += f"- {leak['name']} (Rs {leak['amount']}) - Last used: {leak['last_used']}\n"
        else:
             report += "No leaks found directly.\n"
             
        return report

    def get_scholarship_opportunities(self) -> str:
        """Returns relevant scholarships to suggest instead of loans."""
        # Simple logic: Just return all for the prototype, assuming user matches profile
        report = "ETHICAL GUARDIAN (SCHOLARSHIPS):\n"
        for sch in self.scholarships:
            report += f"- {sch['name']}: Rs {sch['amount']} (Criteria: {sch['criteria']})\n"
        return report

    def get_investment_options(self) -> str:
        """Returns investment suggestions (Mock)."""
        return (
            "INVESTMENT OPTIONS (RISK-ADJUSTED):\n"
            "- Low Risk: Nifty 50 Index Fund (12% avg return)\n"
            "- Medium Risk: Bluechip Tech Stocks (TCS, Infosys) (15-18% potential)\n"
            "- High Risk: Small Cap Discovery Fund (25%+ potential, high volatility)\n"
            "Reference available cash: Rs {safe_to_spend}"
        )

    def get_loan_offers(self) -> str:
        """Returns mock loan comparisons."""
        return (
            "LOAN COMPARISON:\n"
            "- HDFC Personal Loan: 10.5% Interest, Tenure 1-5 Years (Best for Salary Account)\n"
            "- ICICI Instant Loan: 11.2% Interest, Pre-approved limit Rs 5L\n"
            "- SBI Education Loan: 8.5% Interest (Subsidized)\n"
            "ADVICE: Always check processing fees (approx 1-2%)."
        )

    def get_summary(self) -> dict:
        total_bills = sum(bill["amount"] for bill in self.upcoming_bills)
        total_subs = sum(sub["amount"] for sub in self.subscriptions)
        # Assuming avg spend includes bills/subs, let's just make a simple breakdown for the chart
        # Balance = 85k
        # Bills = 28.6k
        # Subs = 7k
        # Remaining = Balance - Bills - Subs
        safe_to_spend = self.current_balance - total_bills - total_subs
        
        return {
            "current_balance": self.current_balance,
            "breakdown": [
                {"name": "Bills", "value": total_bills},
                {"name": "Subscriptions", "value": total_subs},
                {"name": "Safe-to-Spend", "value": safe_to_spend}
            ],
            "safe_to_spend": safe_to_spend
        }

finance_engine = FinanceEngine()
