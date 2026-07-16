from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    category: str | None = None
    min_price: int | None = None
    max_price: int | None = None


class SearchResponse(BaseModel):
    products: list
    total: int
    query: str


@router.post("/", response_model=SearchResponse)
async def search_products(request: SearchRequest):
    # TODO: Implement AI-powered search
    # For now, return empty results
    return SearchResponse(
        products=[],
        total=0,
        query=request.query
    )
