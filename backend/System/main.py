from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from uvicorn import run

from Database.database import create_table, engine
from Database.model import UserSignIn, UserLogin


# import the module
from Router.Account.account_route import router as Account_Router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_table()
    try:
        yield
    finally:
        await engine.dispose()

app = FastAPI(lifespan=lifespan,prefix="/v1/weatherApplication/")

app.add_middleware(
    CORSMiddleware,
    allow_headers=["*"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
)



# including the router
app.include_router(Account_Router,tags=["Account Operation"])



if __name__ == "__main__":
    run(app, host="0.0.0.0", port=8000)