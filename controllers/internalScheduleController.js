import db from "../config/db.js";

export async function createInternalSchedule(req, res) {
    try {
        const {
            club_id,
            created_by,
            title,
            description,
            start_date,
            end_date
        } = req.body;

        if (!club_id || !created_by || !title || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "Λείπουν υποχρεωτικά στοιχεία."
            });
        }

        const [club] = await db.query(
            "SELECT club_id FROM club WHERE club_id = ?",
            [club_id]
        );

        if (club.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Δεν βρέθηκε ομάδα με αυτό το club_id."
            });
        }

        const [user] = await db.query(
            "SELECT user_id, role FROM user WHERE user_id = ?",
            [created_by]
        );

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Δεν βρέθηκε χρήστης με αυτό το created_by."
            });
        }

        const [membership] = await db.query(
            `
            SELECT membership_id
            FROM membership
            WHERE userid = ?
            AND clubid = ?
            AND membership_role = 'manager'
            AND membership_status = 'approved'
            `,
            [created_by, club_id]
        );

        const isAdmin = user[0].role === "admin";

        if (membership.length === 0 && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Δεν έχεις δικαίωμα δημιουργίας χρονοδιαγράμματος για αυτή την ομάδα."
            });
        }

        const sql = `
            INSERT INTO internal_schedule
            (club_id, created_by, title, description, start_date, end_date, status)
            VALUES (?, ?, ?, ?, ?, ?, 'active')
        `;

        const [result] = await db.query(sql, [
            club_id,
            created_by,
            title,
            description || null,
            start_date,
            end_date
        ]);

        res.status(201).json({
            success: true,
            message: "Το χρονοδιάγραμμα δημιουργήθηκε επιτυχώς.",
            schedule_id: result.insertId
        });

    } catch (error) {
        console.error("Create internal schedule error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά τη δημιουργία χρονοδιαγράμματος."
        });
    }
}