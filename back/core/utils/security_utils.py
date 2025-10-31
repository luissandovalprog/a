# core/utils/security_utils.py
import os
import base64
import hashlib
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password as django_check_password

FERNET_KEY_ENV = os.getenv('FERNET_ENCRYPTION_KEY')

if FERNET_KEY_ENV:
    ENCRYPTION_KEY = FERNET_KEY_ENV.encode()
    print("INFO: Usando FERNET_ENCRYPTION_KEY desde .env para cifrado.")
else:
    print("WARN: FERNET_ENCRYPTION_KEY no encontrada. Derivando clave desde SECRET_KEY (NO RECOMENDADO).")
    password = settings.SECRET_KEY.encode()
    salt = b'DjangoSalt' # Salt fijo para clave determinista
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    ENCRYPTION_KEY = base64.urlsafe_b64encode(kdf.derive(password))

try:
    fernet = Fernet(ENCRYPTION_KEY)
    print("INFO: Instancia de Fernet creada exitosamente.")
except Exception as e:
    print(f"ERROR CRÍTICO: No se pudo inicializar Fernet. Cifrado fallará. Error: {e}")
    fernet = None

def encrypt_data(data):
    if fernet is None:
        print("ERROR: Fernet no inicializado. No se puede cifrar.")
        return None
    if data is None:
        return None
    if isinstance(data, str):
        data = data.encode('utf-8')
    try:
        encrypted_data = fernet.encrypt(data)
        return encrypted_data.decode('utf-8')
    except Exception as e:
        print(f"ERROR cifrando dato: {e}")
        return None

def decrypt_data(encrypted_data):
    if fernet is None:
        print("ERROR: Fernet no inicializado. No se puede descifrar.")
        return None
    if encrypted_data is None:
        return None
    try:
        if isinstance(encrypted_data, str):
            encrypted_data = encrypted_data.encode('utf-8')
        decrypted_data = fernet.decrypt(encrypted_data)
        return decrypted_data.decode('utf-8')
    except Exception as e:
        print(f"ERROR descifrando dato: {e}")
        return "[Dato ilegible]"

def hash_password(raw_password):
    if not raw_password:
        return None
    return make_password(raw_password)

def check_password(raw_password, hashed_password):
    if not raw_password or not hashed_password:
        return False
    return django_check_password(raw_password, hashed_password)

def create_search_hash(data):
    if data is None:
        return None
    data_str = str(data).lower().strip()
    hasher = hashlib.sha256()
    hasher.update(data_str.encode('utf-8'))
    return hasher.hexdigest()