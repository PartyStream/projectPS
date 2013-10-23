/* SQLEditor (Postgres)*/

-- ==================
-- = uuid extension =
-- ==================
CREATE EXTENSION "uuid-ossp";

DROP TABLE pictures CASCADE;
DROP TABLE picture_events CASCADE;
DROP TABLE events CASCADE;
DROP TABLE users CASCADE;
DROP TABLE event_users CASCADE;
DROP TABLE sessions CASCADE;
DROP TABLE comments CASCADE;

CREATE TABLE picture_events
(
picture_id UUID NOT NULL,
event_id UUID NOT NULL
);

CREATE TABLE comments
(
id SERIAL UNIQUE,
comment TEXT,
picture_id UUID,
date_created TIMESTAMPTZ DEFAULT NOW(),
date_updated TIMESTAMPTZ,
PRIMARY KEY (id)
);

CREATE TABLE users
(
id SERIAL NOT NULL UNIQUE,
status BIT,
username VARCHAR(50) NOT NULL UNIQUE,
password VARCHAR(100) NOT NULL,
email VARCHAR(75) NOT NULL UNIQUE,
first_name VARCHAR(50),
last_name VARCHAR(50),
dob DATE,
date_created TIMESTAMPTZ,
date_updated TIMESTAMPTZ DEFAULT NOW(),
PRIMARY KEY (id)
);

CREATE TABLE events
(
id UUID NOT NULL UNIQUE,
status BIT,
name VARCHAR(50),
creator INTEGER,
event_date TIMESTAMPTZ,
date_created TIMESTAMPTZ DEFAULT NOW(),
date_updated TIMESTAMPTZ DEFAULT NOW(),
PRIMARY KEY (id)
);

CREATE TABLE pictures
(
id UUID NOT NULL UNIQUE,
name VARCHAR(50),
owner INTEGER,
date_created TIMESTAMPTZ DEFAULT NOW(),
date_updated TIMESTAMPTZ,
url VARCHAR(150),
hash VARCHAR(40) NOT NULL,
mime VARCHAR(25),
extension VARCHAR(10),
PRIMARY KEY (id)
);

CREATE TABLE event_users
(
id SERIAL NOT NULL UNIQUE,
event_id UUID,
user_id INTEGER,
permission INT2 NOT NULL DEFAULT 2,
PRIMARY KEY (id)
);

CREATE TABLE sessions
(
id SERIAL UNIQUE,
token VARCHAR(128) UNIQUE,
user_id INTEGER,
created TIMESTAMPTZ,
PRIMARY KEY (id)
);


ALTER TABLE picture_events ADD FOREIGN KEY (picture_id) REFERENCES pictures (id);
ALTER TABLE picture_events ADD FOREIGN KEY (event_id) REFERENCES events (id);
CREATE INDEX users_username_idx ON users(username);
CREATE INDEX users_email_idx ON users(email);
ALTER TABLE events ADD FOREIGN KEY (creator) REFERENCES users (id);
ALTER TABLE pictures ADD FOREIGN KEY (owner) REFERENCES users (id);
CREATE INDEX event_users_id_idx ON event_users(id);
ALTER TABLE event_users ADD FOREIGN KEY (event_id) REFERENCES events (id);
ALTER TABLE event_users ADD FOREIGN KEY (user_id) REFERENCES users (id);
CREATE INDEX Sessions_token_idx ON Sessions(token);
ALTER TABLE Sessions ADD FOREIGN KEY (user_id) REFERENCES users (id);
CREATE INDEX comments_id_idx ON comments(id);
ALTER TABLE comments ADD FOREIGN KEY (picture_id) REFERENCES pictures (id);

/**
+++++++++++++++++++++++++++++++++++++++++++++++++++
+++                                             +++
+               Insert Sample Data                +
+++                                             +++
+++++++++++++++++++++++++++++++++++++++++++++++++++
**/
-- USERS
INSERT INTO users(status,username,email,password,date_created,first_name,last_name,dob) VALUES('1','jsnow','jsnow@email.com','$2a$10$/z20j7hc8Clkx0.4v2d5w.VOU7yDBD6nzWsjb5AsbGtCoRt3x4Npy',current_timestamp,'Jon','Snow','1970-07-03');
INSERT INTO users(status,username,email,password,date_created,first_name,last_name,dob) VALUES('1','edstark','edstark@email.com','$2a$10$/z20j7hc8Clkx0.4v2d5w.VOU7yDBD6nzWsjb5AsbGtCoRt3x4Npy',current_timestamp,'Eddard','Stark','1970-07-03');
INSERT INTO users(status,username,email,password,date_created,first_name,last_name,dob) VALUES('1','catstark','catstark@email.com','$2a$10$/z20j7hc8Clkx0.4v2d5w.VOU7yDBD6nzWsjb5AsbGtCoRt3x4Npy',current_timestamp,'Catelyn','Stark','1970-07-03');
INSERT INTO users(status,username,email,password,date_created,first_name,last_name,dob) VALUES('1','robstark','robstark@email.com','$2a$10$/z20j7hc8Clkx0.4v2d5w.VOU7yDBD6nzWsjb5AsbGtCoRt3x4Npy',current_timestamp,'Robb','Stark','1970-07-03');
INSERT INTO users(status,username,email,password,date_created,first_name,last_name,dob) VALUES('1','sanstark','sanstark@email.com','$2a$10$/z20j7hc8Clkx0.4v2d5w.VOU7yDBD6nzWsjb5AsbGtCoRt3x4Npy',current_timestamp,'Sansa','Stark','1970-07-03');
INSERT INTO users(status,username,email,password,date_created,first_name,last_name,dob) VALUES('1','brastark','brastark@email.com','$2a$10$/z20j7hc8Clkx0.4v2d5w.VOU7yDBD6nzWsjb5AsbGtCoRt3x4Npy',current_timestamp,'Bran','Stark','1970-07-03');

-- EVENTS
INSERT INTO events(id,name,status,creator,date_created) VALUES(uuid_generate_v4(),'Winterfell','1','2',current_timestamp);
INSERT INTO events(id,name,status,creator,date_created) VALUES(uuid_generate_v4(),'King''s Landing','1','2',current_timestamp);
INSERT INTO events(id,name,status,creator,date_created) VALUES(uuid_generate_v4(),'The Wall','1','2',current_timestamp);
INSERT INTO events(id,name,status,creator,date_created) VALUES(uuid_generate_v4(),'Braavos','1','2',current_timestamp);
INSERT INTO events(id,name,status,creator,date_created) VALUES(uuid_generate_v4(),'Riv','1','2',current_timestamp);

-- EVENTS USERS
-- INSERT INTO event_users (event_id,user_id,permission) VALUES(1,1,2);
-- INSERT INTO event_users (event_id,user_id,permission) VALUES(2,1,2);
-- INSERT INTO event_users (event_id,user_id,permission) VALUES(3,1,2);
-- INSERT INTO event_users (event_id,user_id,permission) VALUES(1,2,2);



