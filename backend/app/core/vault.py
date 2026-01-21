import sqlite3
import os
from cryptography.fernet import Fernet
from datetime import datetime

class Vault:
    def __init__(self, db_path="pennywise.db"):
        self.db_path = db_path
        self.key = self._load_or_generate_key()
        self.cipher = Fernet(self.key)
        self._init_db()

    def _load_or_generate_key(self):
        # In a real app, this key would be derived from a user password and not stored loosely.
        # For this prototype, we store it in a .key file to persist between restarts.
        key_file = "vault.key"
        if os.path.exists(key_file):
            with open(key_file, "rb") as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(key_file, "wb") as f:
                f.write(key)
            return key

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS history
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      timestamp TEXT,
                      role TEXT,
                      encrypted_content TEXT)''')
        conn.commit()
        conn.close()

    def add_event(self, role: str, content: str):
        """Encrypts and saves a chat event."""
        encrypted_content = self.cipher.encrypt(content.encode()).decode()
        timestamp = datetime.now().isoformat()
        
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("INSERT INTO history (timestamp, role, encrypted_content) VALUES (?, ?, ?)",
                  (timestamp, role, encrypted_content))
        conn.commit()
        conn.close()

    def get_history(self):
        """Retrieves and decrypts chat history."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT timestamp, role, encrypted_content FROM history ORDER BY id DESC LIMIT 50")
        rows = c.fetchall()
        conn.close()

        history = []
        for ts, role, enc_content in rows:
            try:
                decrypted = self.cipher.decrypt(enc_content.encode()).decode()
                history.append({"timestamp": ts, "role": role, "content": decrypted})
            except:
                history.append({"timestamp": ts, "role": role, "content": "[DECRYPTION ERROR]"})
        
        return history[::-1] # Return chronological order

vault = Vault()
