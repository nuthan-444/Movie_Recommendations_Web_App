from dotenv import load_dotenv
import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from recommend import recommend
from movies_title import getRandomMovies

load_dotenv()

FRONTEND_KEY = os.getenv("FRONTEND_KEY")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_KEY,"http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MovieRecRequest(BaseModel):
    movie: str



@app.get("/")
def home():
    return {"message":"The server is running."}






@app.get("/api/getRandomMovies/{n}")
def getRandomMoviesRouter(n: int):
    if(n<=0 or n>=10):
        return {
            "message":"The Movie Count Should be ( > 0 and <= 20 ).",
            "status":False,
            "statuscode":400
        }

    
    try:
        random_movies = getRandomMovies(n)

        if(len(random_movies)==0 or len(random_movies)==None):
            return {
            "message":"Sorry ! Try Again",
            "status":False,
            "statuscode":400
            }
        return {
            "random_movies":random_movies,
            "status":True,
            "statuscode":200
        }
    
    except Exception as e:
        return {
            "e":str(e),
            "error":"Server Error ! Please Try Again",
            "status":False,
            "statuscode":500
        }





@app.post("/api/recommend")
def recommendation(data:MovieRecRequest):
    movie=data.movie

    try :
        recommendations = recommend(movie)

        if(len(recommendations)<=0):
            return {
            "message":"Something went wrong !",
            "status":False,
            "statuscode":400
            }

        return {
            "recommendMovies":recommendations,
            "status":True,
            "statuscode":200
        }
    except Exception as e:
        return {
            "e":str(e),
            "error":"Server Error ! Please Try Again",
            "status":False,
            "statuscode":500
        }