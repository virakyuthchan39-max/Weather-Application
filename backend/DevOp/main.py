from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from uvicorn import run

# lifespan context manager
from contextlib import asynccontextmanager

# request limited
from slowapi import Limiter,_rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

#

# import the module

# lifespan activate
@asynccontextmanager
async def lifespan(error:FastAPI):
    try:
        yield
    finally:
        pass


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_headers=["*"],
    allow_origins=["*"],
    allow_credential = True,
    allow_methods=["*"]
)




if __name__ == "__main__":
    run(app,host = "0.0.0.0", port= 8000)