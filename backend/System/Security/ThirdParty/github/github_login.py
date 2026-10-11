# import os
# from fastapi import APIRouter, Depends, HTTPException, status
# from datetime import datetime,timezone
# from pydantic import BaseModel
# from sqlmodel import select
# from sqlalchemy.ext.asyncio import AsyncSession
# from Github.oauth2 import id_token
# from Github.auth.transport import requests as Github_requests
# from typing import Annotated
# from Database.database import get_session
# from Database.model import GithubSignIn
# from dotenv import load_dotenv
# from pathlib import Path

# root_dir = Path(__file__).resolve().parents[3]
# env_path = root_dir / "DevOp" / ".env.api"

# # Load តាមរយៈ Path ដែលបានកំណត់ច្បាស់លាស់
# load_dotenv(dotenv_path=env_path)
# router = APIRouter(prefix="/auth/github", tags=["Github Authentication"])

# Github_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID","")

# class GithubTokenRequest(BaseModel):
#     token: str

# class GithubSchema(BaseModel):
  
#     username:str
#     password: str = "GithubPassword"
#     gmail: str    
#     role: str
#     is_active:bool
#     create_at: datetime
# class GithubSchemaResponse(BaseModel):
#     detail: str = "Github'user sign in successfully!✅"
#     user_info: GithubSchema

# @router.post("/Github_signin",response_model = GithubSchemaResponse)
# async def Github_auth(payload: GithubTokenRequest, db: Annotated[AsyncSession, Depends(get_session)]):
#     try:
#         # Verify Github ID Token
#         idinfo = id_token.verify_oauth2_token(
#             payload.token, 
#             Github_requests.Request(), 
#             Github_CLIENT_ID
#         )

#         email = idinfo.get("email")
#         name = idinfo.get("name", "Github User")

        

#         # Check if user exists in database
#         statement = select(GithubSignIn).where(GithubSignIn.gmail == email)
#         result = await db.scalars(statement)
#         user = result.first()

    
#         add_Github_user = GithubSignIn(username=str(name).title(),gmail=email,is_active=True,role="user",create_at=datetime.now(timezone.utc),password="GithubPassword")    
#         db.add(add_Github_user)
#         await db.commit()
         
#         result_response  = GithubSchema(username=str(name).title(),gmail=email,role= "user",is_active = user.is_active,create_at=datetime.now(timezone.utc))
#         return GithubSchemaResponse(detail = "Github'user sign in successfully!✅",user_info=result_response)
#     except ValueError as e:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=f"Token verification failed: {str(e)}"
#         )