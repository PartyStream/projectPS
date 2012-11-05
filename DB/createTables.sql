/* SQLEditor (Postgres)*/

DROP TABLE users CASCADE;
CREATE TABLE users
(
id SERIAL NOT NULL UNIQUE,
status BIT,
username VARCHAR(50) NOT NULL UNIQUE,
password VARCHAR(50) NOT NULL,
date_created TIMESTAMPTZ,
last_modified TIMESTAMPTZ DEFAULT NOW(),
first_name VARCHAR(50),
last_name VARCHAR(50),
dob DATE,
PRIMARY KEY (id)
);

DROP TABLE picture_events CASCADE;
CREATE TABLE picture_events
(
event_id INTEGER,
picture_id INTEGER
);

DROP TABLE events CASCADE;
CREATE TABLE events
(
id SERIAL NOT NULL UNIQUE,
name VARCHAR(50),
creator INTEGER,
PRIMARY KEY (id)
);

DROP TABLE pictures CASCADE;
CREATE TABLE pictures
(
id SERIAL NOT NULL UNIQUE,
name VARCHAR(50),
owner INTEGER,
path VARCHAR(100) NOT NULL,
PRIMARY KEY (id)
);

CREATE INDEX users_username_idx ON users(username);

ALTER TABLE picture_events ADD FOREIGN KEY (event_id) REFERENCES events (id);

ALTER TABLE picture_events ADD FOREIGN KEY (picture_id) REFERENCES pictures (id);

ALTER TABLE events ADD FOREIGN KEY (creator) REFERENCES users (id);

ALTER TABLE pictures ADD FOREIGN KEY (owner) REFERENCES users (id);

/**
+++++++++++++++++++++++++++++++++++++++++++++++++++
+++                                             +++
+               Insert Sample Data                +
+++                                             +++
+++++++++++++++++++++++++++++++++++++++++++++++++++
**/
INSERT INTO users(status,username,password,date_created,first_name,last_name,dob) VALUES('1','jsnow','test',current_timestamp,'Jon','Snow','1970-07-03');
INSERT INTO users(status,username,password,date_created,first_name,last_name,dob) VALUES('1','edstark','test',current_timestamp,'Eddard','Stark','1970-07-03');
INSERT INTO users(status,username,password,date_created,first_name,last_name,dob) VALUES('1','catstark','test',current_timestamp,'Catelyn','Stark','1970-07-03');
INSERT INTO users(status,username,password,date_created,first_name,last_name,dob) VALUES('1','robstark','test',current_timestamp,'Robb','Stark','1970-07-03');
INSERT INTO users(status,username,password,date_created,first_name,last_name,dob) VALUES('1','sanstark','test',current_timestamp,'Sansa','Stark','1970-07-03');
INSERT INTO users(status,username,password,date_created,first_name,last_name,dob) VALUES('1','brastark','test',current_timestamp,'Bran','Stark','1970-07-03');




