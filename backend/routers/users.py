from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, field_validator
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from passlib.context import CryptContext

from core.auth import get_current_user
from core.db import get_session
from models.user_model import (
    User,
    UserRead,
    UserUpdate,
    UserRole,
)

from services.user_service import get_user_service
router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
class UserStatusUpdate(BaseModel):
    is_active: bool
class UserResponse(BaseModel):
    id: int
    email: str
    fullname: str
    username: str
    user_role: str
    is_active: bool
    is_superuser: bool
    is_verified: bool

    @field_validator("user_role", mode="before")
    @classmethod
    def convert_enum_to_str(cls, v):
        if isinstance(v, UserRole):
            return v.value
        return v
    class Config:
        from_attributes = True

@router.get("/", response_model=List[UserResponse])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    user_service = await get_user_service(session)
    users = await user_service.get_all_users(skip=skip, limit=limit)
    return users

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    user_service = await get_user_service(session)
    user = await user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Tidak Ditemukan")
    return user


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="no perms")

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="error")

    user_service = await get_user_service(session)
    await user_service.delete_user(user_id)
    return {"message": "Pengguna berhasil dihapus"}


@router.patch("/me", response_model=UserRead)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(User).where(User.id == current_user.id)) # type: ignore
    db_user = result.scalar_one_or_none()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.dict(exclude_unset=True)

    # Validasi email jika ada perubahan
    if "email" in update_data and update_data["email"]:
        if update_data["email"] != db_user.email:
            # Cek apakah email sudah digunakan user lain
            email_check = await session.execute(
                select(User).where(User.email == update_data["email"]).where(User.id != current_user.id) # type: ignore
            )
            existing_email_user = email_check.scalar_one_or_none()
            if existing_email_user:
                raise HTTPException(
                    status_code=400,
                    detail="Email sudah digunakan oleh pengguna lain"
                )

    # Validasi username jika ada perubahan
    if "username" in update_data and update_data["username"]:
        if update_data["username"] != db_user.username:
            # Cek apakah username sudah digunakan user lain
            username_check = await session.execute(
                select(User).where(User.username == update_data["username"]).where(User.id != current_user.id) # type: ignore
            )
            existing_username_user = username_check.scalar_one_or_none()
            if existing_username_user:
                raise HTTPException(
                    status_code=400,
                    detail="Username sudah digunakan oleh pengguna lain"
                )

    # Validasi NRP jika ada perubahan
    if "nrp" in update_data and update_data["nrp"]:
        if update_data["nrp"] != db_user.nrp:
            # Cek apakah NRP sudah digunakan user lain
            nrp_check = await session.execute(
                select(User).where(User.nrp == update_data["nrp"]).where(User.id != current_user.id) # type: ignore
            )
            existing_nrp_user = nrp_check.scalar_one_or_none()
            if existing_nrp_user:
                raise HTTPException(
                    status_code=400,
                    detail="NRP sudah digunakan oleh pengguna lain"
                )

    if "password" in update_data and update_data["password"]:
        update_data["hashed_password"] = pwd_context.hash(update_data["password"])
        del update_data["password"]

    for field, value in update_data.items():
        if hasattr(db_user, field) and field != "password":
            setattr(db_user, field, value)

    try:
        await session.commit()
        await session.refresh(db_user)
    except Exception as e:
        await session.rollback()
        # Tangani error khusus untuk unique constraint violation
        error_message = str(e)
        if "duplicate key value violates unique constraint" in error_message.lower():
            if "email" in error_message.lower():
                raise HTTPException(
                    status_code=400,
                    detail="Email sudah digunakan oleh pengguna lain"
                )
            elif "username" in error_message.lower():
                raise HTTPException(
                    status_code=400,
                    detail="Username sudah digunakan oleh pengguna lain"
                )
            elif "nrp" in error_message.lower():
                raise HTTPException(
                    status_code=400,
                    detail="NRP sudah digunakan oleh pengguna lain"
                )
        raise HTTPException(
            status_code=500, detail="Gagal memperbarui profil. Silakan coba lagi."
        )

    return UserRead(
        id=db_user.id,
        fullname=db_user.fullname, # type: ignore
        username=db_user.username, # type: ignore
        email=db_user.email,
        user_role=db_user.user_role, # type: ignore
        notelp=db_user.notelp, # type: ignore
        nrp=db_user.nrp, # type: ignore
        institution=db_user.institution, # type: ignore
        biografi=db_user.biografi, # type: ignore
        profile_picture=db_user.profile_picture, # type: ignore
        is_active=db_user.is_active,
        is_superuser=db_user.is_superuser,
        is_verified=db_user.is_verified,
    )