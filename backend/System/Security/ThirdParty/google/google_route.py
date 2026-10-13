from fastapi import APIRouter
from .google_login import router as google_login_router
from .google_sign_in import router as google_sign_in_router

router = APIRouter(prefix="/auth/google", tags=["Google Authentication"])


router.include_router(google_sign_in_router)
router.include_router(google_login_router)
