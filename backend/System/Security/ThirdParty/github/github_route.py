from fastapi import APIRouter 
from .github_sign_in import router as github_sign_in_router
from .github_login import router as github_login_router

router = APIRouter()

router.include_router(github_sign_in_router)
router.include_router(github_login_router)