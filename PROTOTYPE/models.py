from sqlalchemy import Column, Text, Integer

from database import Base


class Novel(Base):
    __tablename__ = "novel"

    id = Column(Integer, primary_key=True)
    novel = Column(Text, nullable=False)