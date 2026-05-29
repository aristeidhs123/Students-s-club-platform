use clup;
INSERT INTO user
(name, lastname, email, password, role)
VALUES
(
    'Tania',
    'TestUser',
    'testuser@example.com',
    '123456',
    'user'
);

INSERT INTO membership
(userid, clubid, membership_role, membership_status)
VALUES
(
    2,
    1,
    'user',
    'approved'
);

INSERT INTO event
(ev_clubid, ev_title, ev_description, ev_role, ev_seats, ev_location, ev_gplatos, ev_gmikos, ev_starttime, ev_endtime)
VALUES
(1, 'Test Completed Event', 'Εκδήλωση για δοκιμή αξιολόγησης', 'public', 30, 'Πάτρα', 38.246242, 21.735084, '2026-01-10 18:00:00', '2026-01-10 20:00:00');

INSERT INTO reservation
(res_evid, res_userid, res_status, res_apprearedatevent)
VALUES
(2, 1, 'approved', TRUE);

INSERT INTO login_activity
(user_id, is_active_code)
VALUES
(1, TRUE),
(1, TRUE),
(2, TRUE);

