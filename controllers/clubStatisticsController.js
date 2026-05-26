import db from "../config/db.js";
import crypto from "crypto";

export async function getStatisticsOptions(req, res) {
    try {

        const options = [
            {
                id: 1,
                type: "event statistics",
                title: "Στατιστικά εκδηλώσεων"
            },
            {
                id: 2,
                type: "members statistics",
                title: "Στατιστικά συμμετοχής μελών"
            },
            {
                id: 3,
                type: "viewers statistics",
                title: "Επισκεψιμότητα από χρήστες"
            }
        ];

        res.json({
            success: true,
            options
        });

    } catch (error) {

        console.error("Get statistics options error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση επιλογών στατιστικών."
        });
    }
}

export async function getEventStatistics(req, res) {
    try {
        const { clubId } = req.params;

        const [events] = await db.query(
            `
            SELECT 
                e.event_id,
                e.ev_title,
                e.ev_role,
                e.ev_status,

                COUNT(DISTINCT r.res_userid) AS interested_users

            FROM event e

            LEFT JOIN reservation r
                ON e.event_id = r.res_evid
                AND r.res_status = 'approved'

            WHERE e.ev_clubid = ?

            GROUP BY e.event_id

            ORDER BY e.ev_starttime DESC
            `,
            [clubId]
        );

        const [members] = await db.query(
            `
            SELECT COUNT(*) AS total_members
            FROM membership
            WHERE clubid = ?
            AND membership_status = 'approved'
            `,
            [clubId]
        );

        const totalMembers = members[0].total_members;

        const [users] = await db.query(
            `
            SELECT COUNT(*) AS total_users
            FROM user
            `
        );

        const totalUsers = users[0].total_users;

        const statistics = events.map(event => {

            let ratio = 0;

            if (event.ev_role === "private") {

                ratio =
                    totalMembers > 0
                        ? event.interested_users / totalMembers
                        : 0;

            } else {

                ratio =
                    totalUsers > 0
                        ? event.interested_users / totalUsers
                        : 0;
            }

            return {
                event_id: event.event_id,
                title: event.ev_title,
                role: event.ev_role,
                status: event.ev_status,
                interested_users: event.interested_users,
                ratio: Number(ratio.toFixed(2))
            };
        });

        res.json({
            success: true,
            statistics
        });

    } catch (error) {

        console.error("Get event statistics error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση στατιστικών εκδηλώσεων."
        });
    }
}

export async function finalizeEventStatistics(req, res) {
    try {
        const { eventId } = req.params;
        const { manager_id } = req.body;

        if (!manager_id) {
            return res.status(400).json({
                success: false,
                message: "Λείπει το admin_id."
            });
        }

        const [eventRows] = await db.query(
            `
            SELECT event_id, ev_clubid, ev_title, ev_role, ev_status
            FROM event
            WHERE event_id = ?
            `,
            [eventId]
        );

        if (eventRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Δεν βρέθηκε η εκδήλωση."
            });
        }

        const event = eventRows[0];

        const [managerCheck] = await db.query(
            `
            SELECT membership_id
            FROM membership
            WHERE userid = ?
            AND clubid = ?
            AND membership_role = 'manager'
            AND membership_status = 'approved'
            `,
            [manager_id, event.ev_clubid]
        );

        if (managerCheck.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Δεν έχεις δικαίωμα μονιμοποίησης στατιστικών."
            });
        }

        const [interestRows] = await db.query(
            `
            SELECT COUNT(DISTINCT res_userid) AS interested_users
            FROM reservation
            WHERE res_evid = ?
            AND res_status = 'approved'
            `,
            [eventId]
        );

        const interestedUsers = interestRows[0].interested_users;

        let denominator = 0;

        if (event.ev_role === "private") {
            const [memberRows] = await db.query(
                `
                SELECT COUNT(*) AS total
                FROM membership
                WHERE clubid = ?
                AND membership_status = 'approved'
                `,
                [event.ev_clubid]
            );

            denominator = memberRows[0].total;
        } else {
            const [userRows] = await db.query(
                `
                SELECT COUNT(*) AS total
                FROM user
                `
            );

            denominator = userRows[0].total;
        }

        const ratio = denominator > 0 ? interestedUsers / denominator : 0;

        await db.query(
            `
            UPDATE event
            SET ev_status = 'completed'
            WHERE event_id = ?
            `,
            [eventId]
        );

        const statsData = JSON.stringify({
            event_id: event.event_id,
            event_title: event.ev_title,
            event_role: event.ev_role,
            interested_users: interestedUsers,
            denominator: denominator,
            ratio: Number(ratio.toFixed(2))
        });

        const [result] = await db.query(
            `
            INSERT INTO statistics
            (stats_userid, statstype, stats, club_id, event_id, finalized, finalized_at)
            VALUES (?, 'event statistics', ?, ?, ?, TRUE, NOW())
            `,
            [
                manager_id,
                statsData,
                event.ev_clubid,
                event.event_id
            ]
        );

        const announcementSql = `
        INSERT INTO announcements
        (ann_clubid, ann_userid, ann_title, ann_descr)
        VALUES (?, ?, ?, ?)
        `;

        await db.query(announcementSql, [
        event.ev_clubid,
        manager_id,
        "Μονιμοποίηση στατιστικών εκδήλωσης",
        `Τα στατιστικά της εκδήλωσης "${event.ev_title}" μονιμοποιήθηκαν δημιουργήθηκε ενημέρωση.`
        ]);

        res.json({
            success: true,
            message: "Τα στατιστικά της εκδήλωσης μονιμοποιήθηκαν επιτυχώς.",
            stats_id: result.insertId,
            statistics: JSON.parse(statsData)
        });

    } catch (error) {
        console.error("Finalize event statistics error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά τη μονιμοποίηση στατιστικών εκδήλωσης."
        });
    }
}

export async function getMemberParticipationStatistics(req, res) {
    try {
        const { clubId } = req.params;

        const [memberRows] = await db.query(
            `
            SELECT COUNT(*) AS total_members
            FROM membership
            WHERE clubid = ?
            AND membership_status = 'approved'
            `,
            [clubId]
        );

        const totalMembers = memberRows[0].total_members;

        const [activities] = await db.query(
            `
            SELECT 
                ia.activity_id,
                ia.title,
                ia.activity_date,
                ia.status,

                COUNT(DISTINCT ap.user_id) AS active_participants

            FROM internal_activity ia

            JOIN internal_schedule s
                ON ia.schedule_id = s.schedule_id

            LEFT JOIN activity_participation ap
                ON ia.activity_id = ap.activity_id
                AND ap.participation_status = 'active'

            WHERE s.club_id = ?

            GROUP BY ia.activity_id

            ORDER BY ia.activity_date DESC
            `,
            [clubId]
        );

        const statistics = activities.map(activity => {
            const ratio =
                totalMembers > 0
                    ? activity.active_participants / totalMembers
                    : 0;

            return {
                activity_id: activity.activity_id,
                title: activity.title,
                activity_date: activity.activity_date,
                status: activity.status,
                active_participants: activity.active_participants,
                total_members: totalMembers,
                ratio: Number(ratio.toFixed(2))
            };
        });

        res.json({
            success: true,
            statistics
        });

    } catch (error) {
        console.error("Get member participation statistics error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση στατιστικών συμμετοχής μελών."
        });
    }
}

export async function recordClubPageVisit(req, res) {
    try {
        const { clubId } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "Λείπει το user_id."
            });
        }

        const [club] = await db.query(
            `
            SELECT club_id
            FROM club
            WHERE club_id = ?
            `,
            [clubId]
        );

        if (club.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Δεν βρέθηκε ο σύλλογος."
            });
        }

        const visitCode = crypto.randomUUID();

        const sql = `
            INSERT INTO club_page_visits
            (club_id, user_id, visit_code)
            VALUES (?, ?, ?)
        `;

        await db.query(sql, [
            clubId,
            user_id,
            visitCode
        ]);

        res.status(201).json({
            success: true,
            message: "Η επίσκεψη καταγράφηκε επιτυχώς.",
            visit_code: visitCode
        });

    } catch (error) {
        console.error("Record club page visit error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την καταγραφή επίσκεψης."
        });
    }
}

export async function getClubVisitStatistics(req, res) {
    try {
        const { clubId } = req.params;

        const [visitRows] = await db.query(
            `
            SELECT COUNT(DISTINCT user_id) AS unique_visitors
            FROM club_page_visits
            WHERE club_id = ?
            AND visited_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            `,
            [clubId]
        );

        const uniqueVisitors = visitRows[0].unique_visitors;

        const [userRows] = await db.query(
            `
            SELECT COUNT(*) AS total_users
            FROM user
            `
        );

        const totalUsers = userRows[0].total_users;

        const ratio =
            totalUsers > 0
                ? uniqueVisitors / totalUsers
                : 0;

        res.json({
            success: true,
            statistics: {
                club_id: Number(clubId),
                period: "last_7_days",
                unique_visitors: uniqueVisitors,
                total_users: totalUsers,
                ratio: Number(ratio.toFixed(2))
            }
        });

    } catch (error) {
        console.error("Get club visit statistics error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση στατιστικών επισκεψιμότητας."
        });
    }
}