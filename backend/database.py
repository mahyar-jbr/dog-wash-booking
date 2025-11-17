from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite DB file (bookings.db will be created in backend/ when you run it)
SQLALCHEMY_DATABASE_URL = "sqlite:///./bookings.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # needed for SQLite + threads
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency used in routes to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
