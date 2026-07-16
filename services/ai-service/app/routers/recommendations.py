from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class RecommendationResponse(BaseModel):
    products: list
    algorithm: str


@router.get("/{user_id}", response_model=RecommendationResponse)
async def get_recommendations(user_id: str):
    # TODO: Implement recommendation engine
    # For now, return popular products
    return RecommendationResponse(
        products=[],
        algorithm="popular"
    )
