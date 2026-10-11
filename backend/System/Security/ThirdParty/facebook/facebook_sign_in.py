# from fastapi import APIRouter


# router = APIRouter()


# import os
# from fastapi import APIRouter, Depends, HTTPException, status
# from datetime import datetime,timezone
# from pydantic import BaseModel
# from sqlmodel import select
# from sqlalchemy.ext.asyncio import AsyncSession
# from Facebook.oauth2 import id_token
# from Facebook.auth.transport import requests as Facebook_requests
# from typing import Annotated
# from Database.database import get_session
# from Database.model import FacebookSignIn
# from dotenv import load_dotenv
# from pathlib import Path

# root_dir = Path(__file__).resolve().parents[3]
# env_path = root_dir / "DevOp" / ".env.api"

# # Load តាមរយៈ Path ដែលបានកំណត់ច្បាស់លាស់
# load_dotenv(dotenv_path=env_path)
# router = APIRouter(prefix="/auth/Facebook", tags=["Facebook Authentication"])

# Facebook_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID","")

# class FacebookTokenRequest(BaseModel):
#     token: str

# class FacebookSchema(BaseModel):
#     username:str
#     password: str = "FacebookPassword"
#     gmail: str    
#     role: str
#     is_active:bool
#     create_at: datetime
# class FacebookSchemaResponse(BaseModel):
#     detail: str = "Facebook'user sign in successfully!✅"
#     user_info: FacebookSchema

# @router.post("/Facebook_signin",response_model = FacebookSchemaResponse)
# async def Facebook_auth(payload: FacebookTokenRequest, db: Annotated[AsyncSession, Depends(get_session)]):
#     try:
#         # Verify Facebook ID Token
#         idinfo = id_token.verify_oauth2_token(
#             payload.token, 
#             Facebook_requests.Request(), 
#             Facebook_CLIENT_ID
#         )

#         email = idinfo.get("email")
#         name = idinfo.get("name", "Facebook User")

        

#         # Check if user exists in database
#         statement = select(FacebookSignIn).where(FacebookSignIn.gmail == email)
#         result = await db.scalars(statement)
#         user = result.first()

    
#         add_Facebook_user = FacebookSignIn(username=str(name).title(),gmail=email,is_active=True,role="user",create_at=datetime.now(timezone.utc),password="FacebookPassword")    
#         db.add(add_Facebook_user)
#         await db.commit()
         
#         result_response  = FacebookSchema(username=str(name).title(),gmail=email,role= "user",is_active = user.is_active,create_at=datetime.now(timezone.utc))
#         return FacebookSchemaResponse(detail = "Facebook'user sign in successfully!✅",user_info=result_response)
#     except ValueError as e:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=f"Token verification failed: {str(e)}"
#         )