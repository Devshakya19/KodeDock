from fastapi import APIRouter, Request
from pydantic import BaseModel
from app.limiter import limiter

router = APIRouter()


class RecommendationResponse(BaseModel):
    products: list
    algorithm: str


@router.get("/{user_id}", response_model=RecommendationResponse)
@limiter.limit("10/minute")
async def get_recommendations(request: Request, user_id: str):
    # TODO: Implement recommendation engine
    return RecommendationResponse(
        products=[],
        algorithm="popular",
    )
