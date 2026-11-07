from fastapi import APIRouter
from .login import router as login_router
from .logout import router as logout_router
from .signUp import router as signUp_router
from .logout_ThirdParty import router as logout_ThirdParty_router
from .delete_thirdParty import router as delete_ThirdParty_router
from .delete import router as delete_router
router = APIRouter()

router.include_router(signUp_router)
router.include_router(login_router)
router.include_router(logout_router)
router.include_router(logout_ThirdParty_router)
router.include_router(delete_router)
router.include_router(delete_ThirdParty_router)
