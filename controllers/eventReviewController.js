import db from "../config/db.js";

export async function getCompletedEventsForReview(req, res) {
    try {
        const { userId } = req.params;

        const sql = `
            SELECT 
                e.event_id,
                e.ev_title,
                e.ev_description,
                e.ev_location,
                e.ev_starttime,
                e.ev_endtime,

                r.res_id,
                r.res_status,
                r.res_apprearedatevent,

                rev.rev_id
            FROM event e
            JOIN reservation r
                ON e.event_id = r.res_evid
            LEFT JOIN review_EVENT rev
                ON rev.r_eventid = e.event_id
                AND rev.r_userid = r.res_userid
            WHERE r.res_userid = ?
            AND r.res_status = 'approved'
            AND r.res_apprearedatevent = TRUE
            AND e.ev_endtime < NOW()
            ORDER BY e.ev_endtime DESC
        `;

        const [events] = await db.query(sql, [userId]);

        res.json({
            success: true,
            events
        });

    } catch (error) {
        console.error("Get completed events error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση ολοκληρωμένων εκδηλώσεων."
        });
    }
}
export async function createEventReview(req, res) {
    try {
        const { eventId } = req.params;
        const { user_id, rating, description } = req.body;

        if (!user_id || !rating || !description) {
            return res.status(400).json({
                success: false,
                message: "Λείπουν υποχρεωτικά στοιχεία."
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Η βαθμολογία πρέπει να είναι από 1 έως 5."
            });
        }

        const [event] = await db.query(
            `
            SELECT event_id
            FROM event
            WHERE event_id = ?
            AND ev_endtime < NOW()
            `,
            [eventId]
        );

        if (event.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Η εκδήλωση δεν βρέθηκε ή δεν έχει ολοκληρωθεί."
            });
        }

        const [participation] = await db.query(
            `
            SELECT res_id
            FROM reservation
            WHERE res_evid = ?
            AND res_userid = ?
            AND res_status = 'approved'
            AND res_apprearedatevent = TRUE
            `,
            [eventId, user_id]
        );

        if (participation.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Δεν μπορείς να αξιολογήσεις εκδήλωση στην οποία δεν συμμετείχες."
            });
        }

        const sql = `
            INSERT INTO review_EVENT
            (r_eventid, r_userid, r_review, r_descr)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            eventId,
            user_id,
            rating,
            description
        ]);

        res.status(201).json({
            success: true,
            message: "Η αξιολόγηση αποθηκεύτηκε και έγινε δημόσια.",
            review_id: result.insertId
        });

    } catch (error) {
        console.error("Create event review error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Έχεις ήδη αξιολογήσει αυτή την εκδήλωση."
            });
        }

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την αποθήκευση αξιολόγησης."
        });
    }
}

export async function getPublicEventReviews(req, res) {
    try {
        const { eventId } = req.params;

        const sql = `
            SELECT 
                rev.rev_id,
                rev.r_review,
                rev.r_descr,
                u.name,
                u.lastname
            FROM review_EVENT rev
            JOIN user u
                ON rev.r_userid = u.user_id
            WHERE rev.r_eventid = ?
            ORDER BY rev.rev_id DESC
        `;

        const [reviews] = await db.query(sql, [eventId]);

        res.json({
            success: true,
            reviews
        });

    } catch (error) {
        console.error("Get public reviews error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση αξιολογήσεων."
        });
    }
}