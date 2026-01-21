from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from .core.masking import engine as masking_engine
from .core.gemini_client import gemini_client
from .core.pdf_parser import extract_text_from_pdf
from .core.finance import finance_engine
from .core.vault import vault
import uvicorn
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    mode: str = "coach" # coach or roast
    api_key: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    original_prompt: str
    masked_prompt: str
    logs: list[str]
    mode: str

@app.get("/")
def read_root():
    return {"status": "PennyWise Backend Active"}

import io

# ...

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    print(f"DEBUG: Received file upload: {file.filename}, type: {file.content_type}")
    if file.content_type != "application/pdf":
         raise HTTPException(status_code=400, detail="Only PDF files are supported for now.")
    
    content = await file.read()
    
    # Extract text using helper
    raw_text = extract_text_from_pdf(content)
    
    if not raw_text.strip():
        # Fallback for scanned PDFs or empty files (Mocking data for demo continuity if real extraction fails)
        print("DEBUG: Empty text extracted. Using mock data for demo.")
        raw_text = "Bank Statement for USER_A. Spending: Netflix $15, Gym $50, Food $200. Balance $5000."
    
    masked_text, logs = masking_engine.mask(raw_text)
    
    chart_data = None
    
    system_prompt = (
        "You are a financial analyst. Analyze this bank statement text. "
        "1. Provide a textual summary of spending habits and advice.\n"
        "2. EXTREMELY IMPORTANT: You must ALSO output a valid JSON block at the very end of your response inside [[JSON: ... ]] markers.\n"
        "The JSON must have this structure: \n"
        "{ \"breakdown\": [{\"name\": \"Food\", \"value\": 100}, ...], \"safe_to_spend\": 5000, \"total_expenses\": 10000, \"current_balance\": 50000 }\n"
        "Estimate the values based on the text provided. If valid data is missing, make reasonable estimates for a demo.\n"
        "CRITICAL: For 'safe_to_spend', if you cannot find an opening balance, ASSUME a starting balance of 50000. Do not return negative values."
    )
    
    try:
        analysis = await gemini_client.generate_response(masked_text, system_instruction=system_prompt)
        
        # Extract JSON from response
        import re
        import json
        
        json_match = re.search(r'\[\[JSON:\s*(\{.*?\})\s*\]\]', analysis, re.DOTALL)
        if json_match:
            try:
                json_str = json_match.group(1)
                chart_data = json.loads(json_str)
                
                # --- SYNC BALANCE WITH ENGINE ---
                if "current_balance" in chart_data:
                    finance_engine.current_balance = float(chart_data["current_balance"])
                    print(f"DEBUG: FinanceEngine balance updated to {finance_engine.current_balance}")
                # --------------------------------

                # Remove the JSON block from the textual analysis
                analysis = analysis.replace(json_match.group(0), "").strip()
            except Exception as parse_error:
                print(f"Error parsing JSON: {parse_error}")
        else:
            print("No JSON block found in AI response.")
        
    except Exception as e:
        print(f"ERROR in Gemini Analysis: {e}")
        analysis = f"Analysis failed: {str(e)}"
        chart_data = None

    # Unmask the text portion of the analysis for the user
    # (The JSON block is hidden/removed by frontend anyway, but unmasking is good practice)
    final_message = masking_engine.unmask(analysis)

    preview = masked_text[:500] + ("..." if len(masked_text) > 500 else "")
    
    # Save event to Vault
    vault.add_event("system", f"Encrypted and Processed File: {file.filename}")

    return {
        "filename": file.filename,
        "extracted_text_preview": preview,
        "full_masked_text_length": len(masked_text),
        "logs": logs,
        "message": final_message, 
        "chart_data": chart_data 
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    # 0. Configure API Key
    if request.api_key:
        gemini_client.configure(request.api_key)

    # 1. Masking
    masked_text, logs = masking_engine.mask(request.message)

    # 2. Financial Ecosystem Injection (The "Skills")
    fin_context = finance_engine.get_financial_context()
    sub_report = finance_engine.get_subscription_report()
    invest_opts = finance_engine.get_investment_options()
    loan_offers = finance_engine.get_loan_offers()
    sch_opps = finance_engine.get_scholarship_opportunities()
    
    full_context = f"{fin_context}\n\n{sub_report}\n\n{invest_opts}\n\n{loan_offers}\n\n{sch_opps}"

    # 3. System Prompt
    base_prompt = ""
    if request.mode == "roast":
        base_prompt = "You are PennyWise, a savage, roasting financial assistant. Roast use of money. Use Gen-Z slang."
    else:
        base_prompt = "You are PennyWise, a supportive financial coach. Be strict about affordability."

    system_prompt = (
        f"{base_prompt}\n\n"
        f"--- LIVE FINANCIAL DATA ---\n"
        f"{full_context}\n"
        f"--- INSTRUCTIONS ---\n"
        f"1. SOLVENCY: If user wants to buy something, checks Cost vs Safe-to-Spend. If Cost > Safe-to-Spend, say 'REJECTED'.\n"
        f"2. SUBSCRIPTIONS: If user asks about 'leaks', 'subscriptions', or 'extra cash', list the UNUSED_LEAK items from report.\n"
        f"3. INVESTMENTS: If user asks about 'investing' or 'growth', use the INVESTMENT OPTIONS data. Suggest a mix based on risk.\n"
        f"4. LOANS: If user asks about 'loans', 'borrowing', or 'credit', compare the LOAN OFFERS provided. Suggest SBI for education. WARN about interest rates.\n"
        f"5. SCHOLARSHIPS: If user asks about 'tuition', 'college costs', or 'student loans', ALWAYS suggest checking the SCHOLARSHIP OPPORTUNITIES first before taking debt.\n"
        f"6. PRIVACY: You only see tokens (USER_A). Do not mention that you see tokens, just answer naturally.\n"
    )

    # 4. AI Generation
    ai_raw_response = await gemini_client.generate_response(masked_text, system_instruction=system_prompt)

    # 5. Unmasking
    final_response = masking_engine.unmask(ai_raw_response)

    return ChatResponse(
        response=final_response,
        original_prompt=request.message,
        masked_prompt=masked_text,
        logs=logs,
        mode=request.mode
    )

@app.get("/vault/history")
def get_vault_history():
    return vault.get_history()

@app.get("/finance/summary")
def get_finance_summary():
    return finance_engine.get_summary()

class TransactionRequest(BaseModel):
    description: str
    amount: float
    type: str # IN or OUT

@app.get("/ledger")
def get_ledger():
    return finance_engine.get_ledger()

@app.post("/ledger/reset")
def reset_ledger():
    return finance_engine.clear_ledger()

@app.post("/ledger/add")
def add_transaction(item: TransactionRequest):
    return finance_engine.add_transaction(item.description, item.amount, item.type)

from .core.market import market_engine

# ...

@app.get("/market")
def get_market_overview():
    return market_engine.get_market_data()

@app.get("/market/{symbol}")
def get_ticker_details(symbol: str):
    return market_engine.get_ticker_details(symbol)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
