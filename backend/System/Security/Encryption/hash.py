
from passlib.context import CryptContext
from fastapi import HTTPException,status

context_pwd = CryptContext(schemes=["bcrypt"],deprecated="auto")


def hash_password(pwd:str):
    if not pwd or len(pwd) <8:
        raise HTTPException(detail = "Password would be at least 8 characters long!",status_code=status.HTTP_400_BAD_REQUEST)
    
    return context_pwd.hash(pwd)

def verify_password(plain:str,hashed:str):
   try: 
     if not context_pwd.verify(plain,hashed):
        raise HTTPException(defail= "Invalid password! Please try again!",status_code=status.HTTP_400_BAD_REQUEST)
     return context_pwd.verify(plain,hashed)
   except (ValueError,OverflowError):
       raise HTTPException(detail = "Something went wrong!",status_code=status.HTTP_400_BAD_REQUEST)
   