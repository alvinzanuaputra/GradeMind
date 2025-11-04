from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.db import get_session
from models.user_model import User, UserCreate, UserRead, UserSession, UserRole
from core.auth import get_jwt_strategy, ACCESS_TOKEN_EXPIRE_MINUTES
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
import jwt

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
class LoginRequest(BaseModel):
    email: str  # Bisa berisi email atau username
    password: str
    
class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserRead
class RegisterResponse(BaseModel):
    message: str
    user: UserRead

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    request: Request = None, # type: ignore
    session: AsyncSession = Depends(get_session)
):
    # Coba login dengan email
    result = await session.execute(select(User).where(User.email == form_data.username)) # type: ignore
    user = result.scalar_one_or_none()
    # Jika tidak ditemukan dengan email, coba dengan username
    if not user:
        result = await session.execute(select(User).where(User.username == form_data.username))
        user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email/Username atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email/Username atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Akun pengguna tidak aktif",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    jwt_strategy = get_jwt_strategy()
    access_token = await jwt_strategy.write_token(user)
    
    login_timestamp = datetime.utcnow()
    expires_at = login_timestamp + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    client_host = request.client.host if request and request.client else None
    user_agent = request.headers.get("user-agent", "") if request else ""
    
    new_session = UserSession(
        user_id=user.id,
        token=access_token,
        login_timestamp=login_timestamp,
        last_activity=login_timestamp,
        ip_address=client_host,
        user_agent=user_agent,
        is_active=True,
        expires_at=expires_at
    )
    
    session.add(new_session)
    await session.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(select(User).where(User.email == user_data.email)) # type: ignore
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar"
        )
    
    result = await session.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username sudah terpakai"
        )
    
    # Validasi NRP jika ada (tidak boleh duplikat)
    if user_data.nrp:
        result = await session.execute(select(User).where(User.nrp == user_data.nrp))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="NRP sudah terdaftar"
            )
    
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        email=user_data.email, # type: ignore
        fullname=user_data.fullname, # type: ignore
        username=user_data.username, # type: ignore
        user_role=user_data.user_role, # type: ignore
        notelp=user_data.notelp, # type: ignore
        nrp=user_data.nrp, # type: ignore
        institution=user_data.institution, # type: ignore
        biografi=user_data.biografi, # type: ignore
        profile_picture=user_data.profile_picture, # type: ignore
        hashed_password=hashed_password, # type: ignore
        is_active=True, # type: ignore
        is_verified=False, # type: ignore
        is_superuser=False, # type: ignore
    )
    
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    
    user_read = UserRead(
        id=new_user.id,
        email=new_user.email,
        fullname=new_user.fullname, # type: ignore
        username=new_user.username, # type: ignore
        user_role=new_user.user_role, # type: ignore
        notelp=new_user.notelp, # type: ignore
        nrp=new_user.nrp, # type: ignore
        institution=new_user.institution, # type: ignore
        biografi=new_user.biografi, # type: ignore
        profile_picture=new_user.profile_picture, # type: ignore
        is_active=new_user.is_active, # type: ignore
        is_verified=new_user.is_verified, # type: ignore
        is_superuser=new_user.is_superuser, # type: ignore
    )
    
    return RegisterResponse(
        message="Pengguna terdaftar berhasil",
        user=user_read
    )


@router.post("/login", response_model=LoginResponse)
async def login_user(
    login_data: LoginRequest,
    request: Request,
    session: AsyncSession = Depends(get_session)
):
    # Coba login dengan email
    result = await session.execute(select(User).where(User.email == login_data.email)) # type: ignore
    user = result.scalar_one_or_none()
    
    # Jika tidak ditemukan dengan email, coba dengan username
    if not user:
        result = await session.execute(select(User).where(User.username == login_data.email))
        user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email/Username atau password salah"
        )
    
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email/Username atau password salah"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Akun pengguna tidak aktif"
        )
    
    jwt_strategy = get_jwt_strategy()
    token = await jwt_strategy.write_token(user)
    
    login_timestamp = datetime.utcnow()
    expires_at = login_timestamp + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    client_host = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")
    
    new_session = UserSession(
        user_id=user.id,
        token=token,
        login_timestamp=login_timestamp,
        last_activity=login_timestamp,
        ip_address=client_host,
        user_agent=user_agent,
        is_active=True,
        expires_at=expires_at
    )
    
    session.add(new_session)
    await session.commit()
    # is_oauth_user = not user.hashed_password or user.hashed_password == ""
    
    user_read = UserRead(
        id=user.id,
        email=user.email,
        fullname=user.fullname, # type: ignore
        username=user.username, # type: ignore
        user_role=user.user_role, # type: ignore
        notelp=user.notelp, # type: ignore
        institution=user.institution, # type: ignore
        biografi=user.biografi, # type: ignore
        profile_picture=user.profile_picture, # type: ignore
        is_active=user.is_active, # type: ignore
        is_verified=user.is_verified, # type: ignore
        is_superuser=user.is_superuser,
        # is_oauth_user=is_oauth_user,
    )
    
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=user_read
    )


@router.get("/me", response_model=UserRead)
async def get_current_user(
    authorization: str = Header(None),
    session: AsyncSession = Depends(get_session)
):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hilangnya header otorisasi"
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Format header otorisasi tidak valid"
        )
    
    token = parts[1]
    
    try:
        SECRET = os.getenv("SECRET_KEY")
        payload = jwt.decode(
            token, 
            SECRET, # type: ignore 
            algorithms=["HS256"],
            audience=["fastapi-users:auth"]
        )
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token tidak valid"
            )
        
        stmt = select(User).where(User.id == int(user_id)) # type: ignore
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Pengguna tidak ditemukan"
            )
        
        is_oauth_user = not user.hashed_password or user.hashed_password == ""
        
        return UserRead(
            id=user.id,
            email=user.email,
            fullname=user.fullname, # type: ignore
            username=user.username, # type: ignore
            user_role=user.user_role, # type: ignore
            notelp=user.notelp, # type: ignore
            institution=user.institution, # type: ignore
            biografi=user.biografi, # type: ignore
            profile_picture=user.profile_picture, # type: ignore
            is_active=user.is_active,
            is_verified=user.is_verified,
            is_superuser=user.is_superuser,
            # is_oauth_user=is_oauth_user,
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Kadaluarsa"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid"
        )

@router.post("/logout")
async def logout_user(
    token: str,
    session: AsyncSession = Depends(get_session)
):
    try:
        result = await session.execute(
            select(UserSession).where(
                UserSession.token == token,
                UserSession.is_active == True
            )
        )
        user_session = result.scalar_one_or_none()
        if user_session:
            user_session.is_active = False # type: ignore
            await session.commit() 
        return {"message": "Logout berhasil"}
    except Exception:
        return {"message": "Logout gagal"}