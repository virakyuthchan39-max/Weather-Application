from fastapi import APIRouter
from .welcome_notification import (router as welcome_router)
from .alert_notification import (router as alert_router)
from .delete_notification import (router as delete_router)
from .update_notifcation import (router as update_router)

router = APIRouter(tags=["Notification Operation"])

router.include_router(welcome_router)
router.include_router(alert_router)
router.include_router(update_router)
router.include_router(delete_router)