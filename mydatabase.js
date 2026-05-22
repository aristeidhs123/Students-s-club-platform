import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise()

export async function createuser(name , lastname, email, password) {
    const newuser = await pool.query('INSERT INTO user (name, lastname, email, password, role) VALUES (?, ?, ?, ?, "user")',[name, lastname, email, password])
    return newuser
}

export async function editprofile(id, userimg, bio, interests ) {
    const [editpr] = await pool.query('UPDATE user SET profil_img = ?, user_bio = ?, user_interests = ? WHERE user_id = ?', [userimg, bio, interests, id])
    return [editpr]
}

export async function turntomanager(id) {
    const [managr] = await pool.query('UPDATE user SET role="manager" WHERE user_id=?', [id])
    return managr
}

export async function showprofile(id) {
    const [shuser] = await pool.query('SELECT * FROM user WHERE user_id=? ',[id])
    return shuser[0]
}

export async function club (title, descr, managerid) {
    const newclub = await pool.query('INSERT INTO club (title, description, manager_id, status) VALUES (?,?,?, "pending")',[title, descr, managerid])
     return newclub
}
export async function rejectclub(clubid) {
    const [rejcl] = await pool.query('UPDATE club SET status="deleted" WHERE club_id=?', [clubid])
    return rejcl
}

export async function acceptclub(clubidd) {
    const [acccl] = await pool.query('UPDATE club SET status="approved" WHERE club_id=?', [clubidd])
    return acccl
}

export async function showclubs() {
    const [shclb] = await pool.query('SELECT * FROM club WHERE status="approved"')
    return shclb
    
}

export async function newmembership(iduser, idclub) {

    const [newmembr] = await pool.query(
        'INSERT INTO membership(userid, clubid, membership_role, membership_status) VALUES (?, ?, "user", "pending")',
        [iduser, idclub]
    )

    return newmembr
}

export async function makemanagermember(idmanag) {

    const [mangrmemb] = await pool.query(
        'UPDATE membership SET membership_role="manager" WHERE membership_id=?',
        [idmanag]
    )

    return mangrmemb
}

export async function apprmember(memberid) {
    const [apprmemb] = await pool.query('UPDATE membership SET membership_status="approved" WHERE membership_id=?', [memberid])
    return apprmemb
}


export async function rejmember(memberidd) {
    const [rejmemb] = await pool.query('UPDATE membership SET membership_status="rejected" WHERE membership_id=?', [memberidd])
    return rejmemb
}

export async function newevent(clubid, title, description, role, seats, location, gplatos, gmikos, starttime, endtime) {
    const newev = await pool.query('INSERT INTO event(ev_clubid, ev_title,  ev_description, ev_role, ev_seats, ev_location, ev_gplatos, ev_gmikos, ev_starttime, ev_endtime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[clubid, title, description, role, seats, location, gplatos, gmikos, starttime, endtime])
    return newev
    
}
export async function reservationevent(eventid, userid) {

    const [newreservation] = await pool.query(
        `INSERT INTO reservation
        (
            res_evid,
            res_userid,
            res_status,
            res_apprearedatevent
        )
        VALUES (?, ?, "pending", false)`,
        [eventid, userid]
    )

    return newreservation
}

export async function acceptreservation(resid) {

    const [apprres] = await pool.query(
        'UPDATE reservation SET res_status="approved" WHERE res_id=?',
        [resid]
    )

    return apprres
}

export async function rejectreservation(residd) {

    const [rejres] = await pool.query(
        'UPDATE reservation SET res_status="rejected" WHERE res_id=?',
        [residd]
    )

    return rejres
}


export async function appearedatevent(residdd) {

    const [apear] = await pool.query(
        'UPDATE reservation SET res_apprearedatevent=TRUE WHERE res_id=?',
        [residdd]
    )

    return apear
}

export async function newannouncements(idclub, iduser, anndescr, anntitle){

    const [newann] = await pool.query(
        'INSERT INTO announcements(ann_clubid, ann_userid, ann_descr, ann_title) VALUES (?, ?, ?, ?)',
        [idclub, iduser, anndescr, anntitle]
    )

    return newann
}

export async function newreviewev(
    reventid,
    ruserid,
    review,
    revdescription
) {

    const [newrev] = await pool.query(
        'INSERT INTO review_EVENT(r_eventid, r_userid, r_review, r_descr) VALUES (?, ?, ?, ?)',
        [reventid, ruserid, review, revdescription]
    )

    return newrev
}

export async function newstats(statsuserid, statstype, stats) {

    const [newstats] = await pool.query(
        'INSERT INTO statistics (stats_userid, statstype, stats) VALUES (?, ?, ?)',
        [statsuserid, statstype, stats]
    )

    return newstats
}

