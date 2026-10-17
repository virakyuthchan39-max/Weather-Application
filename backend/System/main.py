from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from uvicorn import run
<<<<<<< HEAD
=======
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from Router.OpenWeather.open_weather import limiter
>>>>>>> backend

from Database.database import create_table, engine
from Database.model import (UserSignIn, UserLogin,
                            FacebookSignIn,UserFacebookLogin,
                            GoogleSignIn,UserGoogleLogin,
                            GithubSignIn,UserGithubLogin)

<<<<<<< HEAD


# import the module
# from  Router
from Router.Account.account_route import router as Account_Router
from Security.ThirdParty.google.google_route import router as Google_Router
from Security.ThirdParty.facebook.facebook_route import router as Facebook_Router
from Security.ThirdParty.github.github_route import router as Github_Router

=======
# import the module
# from  Router
from Router.Account.account_route import router as Account_Router
from Router.OpenWeather.open_weather import router as OpenWeather_Router
# from security
from Security.ThirdParty.google.google_route import router as Google_Router
from Security.ThirdParty.facebook.facebook_route import router as Facebook_Router
from Security.ThirdParty.github.github_route import router as Github_Router
>>>>>>> backend
# from service
from Service.service_route import router as Service_Router
@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_table()
    try:
        yield
    finally:
        await engine.dispose()

app = FastAPI(
    title="Weather Application ~ Oragnization/Operation",
<<<<<<< HEAD
    lifespan=lifespan,
    prefix="/v1/weatherApplication/")
=======
    lifespan=lifespan)
>>>>>>> backend

app.add_middleware(
    CORSMiddleware,
    allow_headers=["*"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
)

<<<<<<< HEAD


# including the router
app.include_router(Account_Router,tags=["Account Operation"])
=======
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded,_rate_limit_exceeded_handler)

# including the router
app.include_router(Account_Router,tags=["Account Operation"])
app.include_router(OpenWeather_Router,tags=["Open Weather Operation"])
>>>>>>> backend
app.include_router(Service_Router,tags=["Weather app's Service"])
app.include_router(Google_Router)
app.include_router(Facebook_Router)
app.include_router(Github_Router)



<<<<<<< HEAD
=======

>>>>>>> backend
if __name__ == "__main__":
    run(app, host="0.0.0.0", port=8000)