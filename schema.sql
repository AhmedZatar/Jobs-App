DROP TABLE IF EXISTS jobs;

CREATE TABLE IF NOT EXISTS jobs(
    id SERIAL PRIMARY KEY,
    title VARCHAR (255),
    company VARCHAR (255),
    location VARCHAR (255),
    url VARCHAR (255),
    description text
)