from database import engine, Base
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;"))
        conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;"))
        conn.commit()
        print("Added columns")
    except Exception as e:
        print(e)
    
    Base.metadata.create_all(bind=engine)
    print("Created new tables")
