from Database.model_account import *
from Database.model_role import *
from Database.model_application import *

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from uvicorn import run
 
 
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from Router.OpenWeather.open_weather import limiter


from Database.database import create_table, engine_account,engine_application,engine_role

# import the module
# from  Router
from Router.Account.account_route import router as Account_Router
from Security.ThirdParty.google.google_route import router as Google_Router
from Security.ThirdParty.facebook.facebook_route import router as Facebook_Router
from Security.ThirdParty.github.github_route import router as Github_Router


# import the module
# from  Router
from Router.Account.account_route import router as Account_Router
from Router.OpenWeather.open_weather import router as OpenWeather_Router
# from security
from Security.ThirdParty.google.google_route import router as Google_Router
from Security.ThirdParty.facebook.facebook_route import router as Facebook_Router
from Security.ThirdParty.github.github_route import router as Github_Router

# from service
from Service.service_route import router as Service_Router
@asynccontextmanager
async def lifespan(app: FastAPI):
    try: 
      await create_table()
    except Exception as e:
        print(f"Error: {e}")
        raise e
    try:
        yield
    finally:
        await engine_account.dispose()
        await engine_application.dispose()
        await engine_role.dispose()

app = FastAPI(
    title="Weather Application ~ Oragnization/Operation",
    lifespan=lifespan,)


app.add_middleware(
    CORSMiddleware,
    allow_headers=["*"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
)

 
 
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded,_rate_limit_exceeded_handler)

# including the router
app.include_router(Account_Router,tags=["Account Operation"])
app.include_router(OpenWeather_Router,tags=["Open Weather Operation"])

app.include_router(Service_Router,tags=["Weather app's Service"])
app.include_router(Google_Router)
app.include_router(Facebook_Router)
app.include_router(Github_Router)

if __name__ == "__main__":
    run(app, host="0.0.0.0", port=8000)