import db from "../config/db.js";

async function hasActivityPermission(userId, clubId, permissionType) {
    const [manager] = await db.query(
        `
        SELECT membership_id
        FROM membership
        WHERE userid = ?
        AND clubid = ?
        AND membership_status = 'approved'
        AND membership_role = 'manager'
        `,
        [userId, clubId]
    );

    if (manager.length > 0) {
        return true;
    }

    const [permission] = await db.query(
        `
        SELECT permission_id
        FROM activity_permission
        WHERE user_id = ?
        AND club_id = ?
        AND permission_type = ?
        `,
        [userId, clubId, permissionType]
    );

    return permission.length > 0;
}

export async function createInternalActivity(req, res) {
    try {
        const {
            schedule_id,
            created_by,
            title,
            description,
            activity_date,
            start_time,
            end_time,
            location
        } = req.body;

        if (!schedule_id || !created_by || !title || !activity_date) {
            return res.status(400).json({
                success: false,
                message: "Λείπουν υποχρεωτικά στοιχεία."
            });
        }

        const [schedule] = await db.query(
            `SELECT schedule_id, club_id FROM internal_schedule WHERE schedule_id = ?`,
            [schedule_id]
        );

        if (schedule.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Δεν βρέθηκε χρονοδιάγραμμα."
            });
        }

        const club_id = schedule[0].club_id;

        const allowed = await hasActivityPermission(
        created_by,
        club_id,
        "manage_activities"
        );

        if (!allowed) {
        return res.status(403).json({
        success: false,
        message: "Δεν έχεις δικαίωμα προσθήκης δραστηριότητας."
        });
        }

        const sql = `
            INSERT INTO internal_activity
            (schedule_id, created_by, title, description, activity_date, start_time, end_time, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            schedule_id,
            created_by,
            title,
            description || null,
            activity_date,
            start_time || null,
            end_time || null,
            location || null
        ]);
        
        const announcementSql = `
        INSERT INTO announcements
        (ann_clubid, ann_userid, ann_title, ann_descr)
        VALUES (?, ?, ?, ?)
        `;

        await db.query(announcementSql, [
        club_id,
        created_by,
        `Νέα δραστηριότητα: ${title}`,
        `Προστέθηκε νέα δραστηριότητα στο πρόγραμμα: ${title}. Ημερομηνία: ${activity_date}.`
        ]);


        res.status(201).json({
            success: true,
            message: "Η δραστηριότητα προστέθηκε επιτυχώς και δημιουργήθηκε ανακοίνωση.",
            activity_id: result.insertId
        });

    } catch (error) {
        console.error("Create internal activity error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την προσθήκη δραστηριότητας."
        });
    }
}

export async function deleteInternalActivity(req, res) {
    try {
        const { activityId } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "Λείπει το user_id."
            });
        }

        const [activity] = await db.query(
            `
            SELECT ia.activity_id, s.club_id
            FROM internal_activity ia
            JOIN internal_schedule s
                ON ia.schedule_id = s.schedule_id
            WHERE ia.activity_id = ?
            `,
            [activityId]
        );

        if (activity.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Δεν βρέθηκε δραστηριότητα."
            });
        }

        const club_id = activity[0].club_id;

        const allowed = await hasActivityPermission(
        user_id,
        club_id,
        "manage_activities"
        );

        if (!allowed) {
        return res.status(403).json({
        success: false,
        message: "Δεν έχεις δικαίωμα διαγραφής δραστηριότητας."
        });
        }

        await db.query(
            `DELETE FROM internal_activity WHERE activity_id = ?`,
            [activityId]
        );

        res.json({
            success: true,
            message: "Η δραστηριότητα διαγράφηκε επιτυχώς."
        });

    } catch (error) {
        console.error("Delete internal activity error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά τη διαγραφή δραστηριότητας."
        });
    }
}

export async function updateInternalActivity(req, res) {
    try {
        const { activityId } = req.params;

        const {
            user_id,
            title,
            description,
            activity_date,
            start_time,
            end_time,
            location,
            status
        } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "Λείπει το user_id."
            });
        }

        const [activity] = await db.query(
            `
            SELECT ia.activity_id, s.club_id
            FROM internal_activity ia
            JOIN internal_schedule s
                ON ia.schedule_id = s.schedule_id
            WHERE ia.activity_id = ?
            `,
            [activityId]
        );

        if (activity.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Δεν βρέθηκε δραστηριότητα."
            });
        }

        const club_id = activity[0].club_id;

        const allowed = await hasActivityPermission(
        user_id,
        club_id,
        "manage_activities"
        );

        if (!allowed) {
        return res.status(403).json({
        success: false,
        message: "Δεν έχεις δικαίωμα τροποποίησης δραστηριότητας."
        });
        }

        const sql = `
            UPDATE internal_activity
            SET 
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                activity_date = COALESCE(?, activity_date),
                start_time = COALESCE(?, start_time),
                end_time = COALESCE(?, end_time),
                location = COALESCE(?, location),
                status = COALESCE(?, status)
            WHERE activity_id = ?
        `;

        await db.query(sql, [
            title || null,
            description || null,
            activity_date || null,
            start_time || null,
            end_time || null,
            location || null,
            status || null,
            activityId
        ]);

        res.json({
            success: true,
            message: "Η δραστηριότητα ενημερώθηκε επιτυχώς."
        });

    } catch (error) {
        console.error("Update internal activity error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ενημέρωση δραστηριότητας."
        });
    }
}

export async function participateInActivity(req, res) {
    try {
        const { activityId } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "Λείπει το user_id."
            });
        }

        const [activity] = await db.query(
            `
            SELECT ia.activity_id, s.club_id
            FROM internal_activity ia
            JOIN internal_schedule s
                ON ia.schedule_id = s.schedule_id
            WHERE ia.activity_id = ?
            `,
            [activityId]
        );

        if (activity.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Δεν βρέθηκε δραστηριότητα."
            });
        }

        const club_id = activity[0].club_id;

        const [member] = await db.query(
            `
            SELECT membership_id
            FROM membership
            WHERE userid = ?
            AND clubid = ?
            AND membership_status = 'approved'
            `,
            [user_id, club_id]
        );

        if (member.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Δεν είσαι εγκεκριμένο μέλος αυτής της ομάδας."
            });
        }

        const sql = `
            INSERT INTO activity_participation
            (activity_id, user_id, participation_status)
            VALUES (?, ?, 'active')
            ON DUPLICATE KEY UPDATE
                participation_status = 'active'
        `;

        await db.query(sql, [activityId, user_id]);

        res.status(201).json({
            success: true,
            message: "Η συμμετοχή δηλώθηκε επιτυχώς."
        });

    } catch (error) {
        console.error("Participate in activity error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά τη δήλωση συμμετοχής."
        });
    }
}

export async function declareAvailability(req, res) {
    try {
        const { activityId } = req.params;
        const { user_id, availability_status, note } = req.body;

        if (!user_id || !availability_status) {
            return res.status(400).json({
                success: false,
                message: "Λείπει το user_id ή το availability_status."
            });
        }

        const allowedStatuses = ["available", "not_available", "maybe"];

        if (!allowedStatuses.includes(availability_status)) {
            return res.status(400).json({
                success: false,
                message: "Μη έγκυρη τιμή διαθεσιμότητας."
            });
        }

        const [activity] = await db.query(
            `
            SELECT ia.activity_id, s.club_id
            FROM internal_activity ia
            JOIN internal_schedule s
                ON ia.schedule_id = s.schedule_id
            WHERE ia.activity_id = ?
            `,
            [activityId]
        );

        if (activity.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Δεν βρέθηκε δραστηριότητα."
            });
        }

        const club_id = activity[0].club_id;

        const [member] = await db.query(
            `
            SELECT membership_id
            FROM membership
            WHERE userid = ?
            AND clubid = ?
            AND membership_status = 'approved'
            `,
            [user_id, club_id]
        );

        if (member.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Δεν είσαι εγκεκριμένο μέλος αυτής της ομάδας."
            });
        }

        const sql = `
            INSERT INTO activity_availability
            (activity_id, user_id, availability_status, note)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                availability_status = VALUES(availability_status),
                note = VALUES(note),
                submitted_at = CURRENT_TIMESTAMP
        `;

        await db.query(sql, [
            activityId,
            user_id,
            availability_status,
            note || null
        ]);

        res.status(201).json({
            success: true,
            message: "Η διαθεσιμότητα δηλώθηκε επιτυχώς."
        });

    } catch (error) {
        console.error("Declare availability error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά τη δήλωση διαθεσιμότητας."
        });
    }
}

export async function getActivityAttendance(req, res) {
    try {
        const { activityId } = req.params;

        const [activity] = await db.query(
            `
            SELECT activity_id
            FROM internal_activity
            WHERE activity_id = ?
            `,
            [activityId]
        );

        if (activity.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Δεν βρέθηκε δραστηριότητα."
            });
        }

        const sql = `
            SELECT 
                ap.participation_id,
                ap.activity_id,
                ap.user_id,
                u.name,
                u.lastname,
                u.email,
                ap.participation_status,
                ap.joined_at
            FROM activity_participation ap
            JOIN user u
                ON ap.user_id = u.user_id
            WHERE ap.activity_id = ?
            ORDER BY ap.joined_at ASC
        `;

        const [attendance] = await db.query(sql, [activityId]);

        res.json({
            success: true,
            attendance
        });

    } catch (error) {
        console.error("Get activity attendance error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση παρουσιολογίου."
        });
    }
}

export async function getActivityAvailability(req, res) {
    try {
        const { activityId } = req.params;

        const [activity] = await db.query(
            `
            SELECT activity_id
            FROM internal_activity
            WHERE activity_id = ?
            `,
            [activityId]
        );

        if (activity.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Δεν βρέθηκε δραστηριότητα."
            });
        }

        const sql = `
            SELECT 
                av.availability_id,
                av.activity_id,
                av.user_id,
                u.name,
                u.lastname,
                u.email,
                av.availability_status,
                av.note,
                av.submitted_at
            FROM activity_availability av
            JOIN user u
                ON av.user_id = u.user_id
            WHERE av.activity_id = ?
            ORDER BY av.submitted_at ASC
        `;

        const [availability] = await db.query(sql, [activityId]);

        res.json({
            success: true,
            availability
        });

    } catch (error) {
        console.error("Get activity availability error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση διαθεσιμοτήτων."
        });
    }
}