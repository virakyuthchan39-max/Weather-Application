from fastapi import APIRouter,status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio

router = APIRouter()


class Text_Request(BaseModel):
    text:str
async def Text_generator(request:Text_Request):
    for i in request.text:
        yield i
        await asyncio.sleep(0.4)
        
@router.get("/data_streaming",status_code = status.HTTP_200_OK,response_class=StreamingResponse)
async def StreamingResponses():
    return StreamingResponse(Text_generator(),media_type="text/plain")