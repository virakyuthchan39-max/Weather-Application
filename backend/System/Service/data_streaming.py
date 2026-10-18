 
from fastapi import APIRouter,status
 
from fastapi import APIRouter, status

from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio

router = APIRouter()


class Text_Request(BaseModel):
    username:str


async def Text_generator(username: str):
    message = f"Hello {username.title()}👋🏻! What's is your weather today⛅? If you don't know let figure out together✨!"
    for char in message:
        yield char
        await asyncio.sleep(0.08)


@router.post("/data_streaming", status_code=status.HTTP_200_OK, response_class=StreamingResponse)
async def StreamingResponses(request: Text_Request):
    return StreamingResponse(
        Text_generator(request.username),
        media_type="text/plain",
    )

