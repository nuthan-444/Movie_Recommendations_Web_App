from dotenv import load_dotenv
import os
import joblib
from sklearn.metrics.pairwise import cosine_similarity
import requests
from huggingface_hub import hf_hub_download

load_dotenv()
TMDB_API_KEY = os.getenv("TMDB_API_KEY")



# for local running
# DF = joblib.load('./model/DF.pkl')
# vectors = joblib.load('./model/vectors.pkl')


# for production Running
DF_path = hf_hub_download(
    repo_id="nuthan-444/Movie_Recommendation_System",
    filename="DF.pkl",
    repo_type="model"
)

vectors_path = hf_hub_download(
    repo_id="nuthan-444/Movie_Recommendation_System",
    filename="vectors.pkl",
    repo_type="model"
)

# Load the downloaded files
DF = joblib.load(DF_path)
vectors = joblib.load(vectors_path)
# for production Running


similarity = cosine_similarity(vectors)

def recommend(movie):
    matching_movies = DF[DF['title'] == movie]
    if matching_movies.empty:
        raise ValueError(f"Movie '{movie}' not found")

    movie_index = matching_movies.index[0]

    distances = similarity[movie_index]
    movie_list = sorted(list(enumerate(distances)),reverse=True,key=lambda x:x[1])[1:6]
    top5_movie_recommend = []
    for i in movie_list:
        movie_name = DF.iloc[i[0]].title


        top5_movie_recommend.append(movie_name)


    return top5_movie_recommend

