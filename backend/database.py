import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./loop_game.db")

# Ensure postgresql connection string is compatible with psycopg2 if using postgres
if raw_db_url.startswith("postgres://"):
    db_url = raw_db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif raw_db_url.startswith("postgresql://") and not raw_db_url.startswith("postgresql+"):
    db_url = raw_db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
else:
    db_url = raw_db_url

# Remove channel_binding if present since standard psycopg2 doesn't use that parameter directly in url
if "channel_binding=" in db_url:
    db_url = db_url.replace("&channel_binding=require", "").replace("?channel_binding=require&", "?").replace("?channel_binding=require", "")

connect_args = {}
if "sqlite" in db_url:
    connect_args["check_same_thread"] = False

try:
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_recycle=300 if "sqlite" not in db_url else -1
    )
    # Quick connectivity test
    with engine.connect() as conn:
        pass
    print(f" Connected to database: {db_url.split('@')[-1] if '@' in db_url else 'SQLite'}")
except Exception as e:
    print(f" Warning: Failed to connect to primary DB ({e}). Falling back to local SQLite.")
    db_url = "sqlite:///./loop_game.db"
    engine = create_engine("sqlite:///./loop_game.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
