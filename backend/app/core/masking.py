from typing import Dict, Tuple, List
from .pii_patterns import PATTERNS, TOKEN_PREFIXES
import re

class MaskingEngine:
    def __init__(self):
        self.reset()

    def reset(self):
        """Reset the mapping for a new session or context."""
        self.mapping: Dict[str, str] = {} # Token -> Original
        self.reverse_mapping: Dict[str, str] = {} # Original -> Token
        self.counters: Dict[str, int] = {k: 0 for k in TOKEN_PREFIXES.keys()}

    def _get_token(self, pii_type: str, original_text: str) -> str:
        """Get or create a consistent token for a specific PII string."""
        if original_text in self.reverse_mapping:
            return self.reverse_mapping[original_text]

        # Generate new token
        self.counters[pii_type] += 1
        token = f"{TOKEN_PREFIXES[pii_type]}{chr(64 + self.counters[pii_type])}" # EMAIL_A, EMAIL_B...
        
        self.mapping[token] = original_text
        self.reverse_mapping[original_text] = token
        return token

    def mask(self, text: str) -> Tuple[str, List[str]]:
        """
        Scans text and replaces PII with tokens.
        Returns (masked_text, logs)
        """
        masked_text = text
        logs = []

        for pii_type, pattern in PATTERNS.items():
            if pii_type == "AMOUNT": continue # Don't mask amounts for finance bot
            
            matches = pattern.findall(masked_text)
            for match in matches:
                # match might be a tuple if regex has groups
                original = match[0] if isinstance(match, tuple) else match
                
                # Heuristic check: Skip common false positives for names
                if pii_type == "NAME_HEURISTIC":
                     if original.lower() in ["bank statement", "transaction id", "credit card"]:
                         continue

                token = self._get_token(pii_type, original)
                
                # Replace only this instance or all? 
                # Simple string replace can be dangerous if short strings. 
                # Using regex sub is safer to respect word boundaries if possible, 
                # but for this demo simple replacement of the exact match is okay ensuring we don't double mask.
                if original in masked_text:
                    masked_text = masked_text.replace(original, token)
                    logs.append(f"PII Detected: '{original}' -> {token}")

        return masked_text, logs

    def unmask(self, text: str) -> str:
        """Replaces tokens back with original values."""
        unmasked_text = text
        for token, original in self.mapping.items():
            unmasked_text = unmasked_text.replace(token, original)
        return unmasked_text

# Global instance for the session (in a real app, this would be per-user/session)
engine = MaskingEngine()
