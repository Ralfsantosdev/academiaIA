import os
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.sqlite.pysqlite import SQLiteDialect_pysqlite

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./academia.db")
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN", "")

if DATABASE_URL.startswith("libsql://"):
    import libsql_experimental as libsql

    class TursoDialect(SQLiteDialect_pysqlite):
        supports_statement_cache = True

        @classmethod
        def import_dbapi(cls):
            return libsql

        def on_connect_url(self, url):
            return None

    def get_turso_connection():
        return libsql.connect(
            DATABASE_URL,
            auth_token=TURSO_AUTH_TOKEN,
            uri=True,
        )

    engine = create_engine("sqlite://", creator=get_turso_connection, _initialize=False)
    engine.dialect = TursoDialect(dbapi=libsql)
    event.listen(engine.pool, "connect", lambda conn, record: None)
else:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
