from sqlalchemy import text
from app.database import engine


with engine.connect() as connection:

    connection.execute(
        text("""
        UPDATE "Blog"
        SET slug = lower(
            regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')
        )
        WHERE slug IS NULL;
        """)
    )

    connection.commit()


print("Blog slugs fixed")