use clup;
create table users (
userID int auto_increment primary key,
username varchar(30) not null unique,
email varchar(100) not null unique,
password varchar(255) not null,
firstName varchar(50) not null,
lastName varchar(50) not null,
bio text,
profileImage varchar(255),
role enum('user','admin') default 'user',
created_at timestamp default current_timestamp
);

create table clubs (
clubID int auto_increment primary key,
name varchar(100) not null unique,
description text,
category varchar(50),
logo varchar(255),
created_by int not null,
club_status enum('pending', 'approved', 'rejected', 'disabled') default 'pending',
created_at timestamp default current_timestamp,

foreign key (created_by) references users(userID)
);

create table memberships ( 
membershipID int auto_increment primary key,
user_id int not null,
club_id int not null,
role enum('member','moderator','manager') default 'member',
membership_status enum('pending','accepted','rejected') default 'pending',
joined_at timestamp default current_timestamp,

foreign key (user_id) references users(userID),
foreign key (club_id) references clubs(clubID),

unique(user_id, club_id)
);

create table events(
eventID int auto_increment primary key,
club_id int not null,
title varchar(100) not null,
description text,
event_type enum('public','private') default 'public',
location varchar(100),
maxParticipants int,
starts_at datetime not null,
ends_at datetime not null,
event_status enum('upcoming','completed','cancelled') default 'upcoming',
created_at timestamp default current_timestamp,

foreign key (club_id) references clubs(clubID)
);

create table eventReservations (
reservationID int auto_increment primary key,
event_id int not null,
user_id int not null,
reservation_status enum('pending','confirmed','cancelled') default 'pending',
check_in boolean default false,
reserved_at timestamp default current_timestamp,

foreign key (event_id) references events(eventID),
foreign key (user_id) references users(userID),

unique(event_id,user_id)
);

create table announcements (
announcementsID int auto_increment primary key,
club_id int not null,
created_by int not null,
title varchar(100) not null,
content text not null,
visibility enum('private','public') default 'private',
created_at timestamp default current_timestamp,
foreign key (club_id) references clubs(clubID),
foreign key (created_by) references users(userID)
);

create table eventReviews (
reviewID int auto_increment primary key,
event_id int not null,
user_id int not null,
rating int check (rating between 1 and 5),
comment text,
created_at timestamp default current_timestamp,
foreign key (event_id) references events(eventID),
foreign key (user_id) references users(userID),
unique(event_id,user_id)
);

create table clubRequests (
requestID int auto_increment primary key,
application_id int not null,
club_name varchar(100) not null,
description text,
req_status enum('pending','approved','rejected') default 'pending',
admin_comment text,
submitted_at timestamp default current_timestamp,

foreign key (application_id) references users(userID)
);

create table chatbot (
messageID int auto_increment primary key,
user_id int not null,
sender enum('user','chatbot','admin'),
message text not null,
sent_at timestamp default current_timestamp,
foreign key (user_id) references users(userID)
);

create table statistics (
statisticID int auto_increment primary key,
statistic_type enum('event_stats','member_stats','visitor_stats','chatbot_stats','application_stats'),
related_club_id int null,
generated_at timestamp default current_timestamp,
data json,
foreign key (related_club_id) references clubs(clubID)
);