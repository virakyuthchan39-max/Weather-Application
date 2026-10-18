from fastapi import APIRouter
from .data_streaming import router as data_streaming_router
from .default_city_location import router as default_city_router 

router = APIRouter()

router.include_router(data_streaming_router)
 
from .similar_city import router as similar_city_router
router = APIRouter()

router.include_router(data_streaming_router)
router.include_router(similar_city_router)
router.include_router(default_city_router)
