# ============================================================
#  Auth Pydantic Schemas
# ============================================================

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    email: str
    is_admin: bool

    model_config = {"from_attributes": True}
