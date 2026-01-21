import re

# Regex Patterns for PII Detection

PATTERNS = {
    "EMAIL": re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
    # Fixed Phone Regex: Requires (+) for country code to avoid matching random 12-digit account numbers
    "PHONE": re.compile(r'\b(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'),
    "CREDIT_CARD": re.compile(r'\b(?:\d{4}[-\s]?){3}\d{4}\b'),
    # Simple heuristic for potential Indian names (First Last) - prone to false positives, needed for demo
    # In production, use Spacy or similar NLP
    "NAME_HEURISTIC": re.compile(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b'), 
    "ACCOUNT_NUM": re.compile(r'\b\d{9,18}\b'), # 9-18 digit account numbers
    "SENSITIVE": re.compile(r'(?i)\b(password|secret|key|token|pin)\b'), # Demo: Keywords to easily trigger masking
    "AMOUNT": re.compile(r'(?:Rs\.?|INR|₹)\s?(\d+(?:,\d+)*(?:\.\d{2})?)') # To preserve context but maybe mask large values if needed? 
    # Usually we WANT amounts for the finance bot, so we might NOT mask amounts unless specific
}

# Mapping schema for tokens
TOKEN_PREFIXES = {
    "EMAIL": "EMAIL_",
    "PHONE": "PHONE_",
    "CREDIT_CARD": "CC_",
    "NAME_HEURISTIC": "USER_",
    "ACCOUNT_NUM": "ACCT_",
    "SENSITIVE": "SECRET_"
}
