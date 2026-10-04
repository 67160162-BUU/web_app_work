from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text, JSON, Float, Index
from sqlalchemy.orm import relationship
import enum

from app.database import Base

class UserRole(str, enum.Enum):
    PLAYER = "player"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=True, index=True)
    email = Column(String(100), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    # [Indexing Lab Insight]: เพิ่ม index ให้ display_name ป้องกัน Seq Scan ตอนค้นหาชื่อผู้เล่น
    display_name = Column(String(50), nullable=False, index=True)
    role = Column(String(20), default="player", nullable=False)
    is_guest = Column(Boolean, default=True, nullable=False)
    weight = Column(Float, default=65.0, nullable=False)
    height = Column(Float, default=170.0, nullable=False)
    is_pro = Column(Boolean, default=False, nullable=False)
    pro_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    scores = relationship("Score", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    # [Indexing Lab Insight]: ทำ Index บน Foreign Key (user_id) เสมอ
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    pose_key = Column(String(50), default="dab", nullable=False, index=True)
    score = Column(Integer, default=0, nullable=False, index=True)
    count = Column(Integer, default=0, nullable=False)
    pose_accuracy_details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="scores")

    # [Indexing Lab 05/06 Insight]: Composite Index สำหรับ Leaderboard (pose_key + user_id + score + count)
    __table_args__ = (
        Index("idx_scores_pose_user_score", "pose_key", "user_id", "score", "count"),
        Index("idx_scores_user_created", "user_id", "created_at"),
    )

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(String(100), primary_key=True)
    # [Indexing Lab Insight]: ทำ Index บน Foreign Key user_id และ expires_at
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token = Column(Text, nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="sessions")

