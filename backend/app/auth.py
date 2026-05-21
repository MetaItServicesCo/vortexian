from datetime import UTC,datetime,timedelta
from fastapi.security import OAuth2PasswordBearer
import jwt
from pwdlib import PasswordHash
from app.config import settings

password_hash=PasswordHash.recommended()

admin_oauth2_scheme=OAuth2PasswordBearer(
    tokenUrl="api/admins/token",scheme_name="adminAuth"
)

def hash_password(password:str)->str:
    return password_hash.hash(password)

def verify_password(plain_password:str,hash_password:str)->bool:
    return password_hash.verify(plain_password,hash_password)

def create_access_token(data:dict,expire_delta:timedelta | None)->str:
    to_encode=data.copy()

    if expire_delta:
        expire=datetime.now(UTC)+expire_delta
    else:
        expire=datetime.now(UTC)+timedelta(minutes=settings.access_token_time_expire)

    to_encode.update({'exp':expire})
    encode_jwt=jwt.encode(to_encode,
                          settings.secret_key.get_secret_value(),
                          algorithm=settings.algorithm)
    
    return encode_jwt

def verify_access_token(token:str)->str|None:
    try:
        payload=jwt.decode(
            token,
            settings.secret_key.get_secret_value(),
            algorithms=[settings.algorithm],
            options={'require':['exp','sub']}
        )
    except jwt.InvalidTokenError:
        return None
    else:
        return payload
