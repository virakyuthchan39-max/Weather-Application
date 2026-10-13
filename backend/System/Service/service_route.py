from fastapi import APIRouter
from .data_streaming import router as data_streaming_router

router = APIRouter()

router.include_router(data_streaming_router)