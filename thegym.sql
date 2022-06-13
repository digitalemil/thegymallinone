Create database thegym; 
\c thegym
CREATE USER thegym;
GRANT ALL ON DATABASE thegym TO thegym WITH GRANT OPTION;
\c thegym thegym
CREATE TABLE hrdata (id BIGINT, color text, location text, event_timestamp text, deviceid text, username text, heartrate INT);
