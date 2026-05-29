import db from "../config/db.js";

export async function getProfile(req, res) {
    try {
        const { userId } = req.params;

        const [users] = await db.query(
            `
            SELECT 
                user_id,
                name,
                lastname,
                username,
                email,
                role,
                profil_img,
                user_bio,
                user_interests
            FROM user
            WHERE user_id = ?
            `,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ο χρήστης δεν βρέθηκε."
            });
        }

        res.json({
            success: true,
            profile: users[0]
        });

    } catch (error) {
        console.error("Get profile error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση προφίλ."
        });
    }
}

export async function checkUsernameAvailability(req, res) {
    try {
        const { username } = req.params;

        const [users] = await db.query(
            `
            SELECT user_id
            FROM user
            WHERE username = ?
            `,
            [username]
        );

        if (users.length > 0) {
            return res.json({
                success: true,
                available: false,
                message: "Το username δεν είναι διαθέσιμο."
            });
        }

        res.json({
            success: true,
            available: true,
            message: "Το username είναι διαθέσιμο."
        });

    } catch (error) {
        console.error("Check username error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά τον έλεγχο username."
        });
    }
}

export async function updateUsername(req, res) {
    try {
        const { userId } = req.params;
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: "Λείπει το username."
            });
        }

        const [existing] = await db.query(
            `
            SELECT user_id
            FROM user
            WHERE username = ?
            AND user_id <> ?
            `,
            [username, userId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Το username δεν είναι διαθέσιμο."
            });
        }

        await db.query(
            `
            UPDATE user
            SET username = ?
            WHERE user_id = ?
            `,
            [username, userId]
        );

        res.json({
            success: true,
            message: "Το username ενημερώθηκε επιτυχώς."
        });

    } catch (error) {
        console.error("Update username error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ενημέρωση username."
        });
    }
}

export async function updateProfileImage(req, res) {
    try {
        const { userId } = req.params;
        const { profil_img } = req.body;

        if (!profil_img) {
            return res.status(400).json({
                success: false,
                message: "Λείπει η εικόνα προφίλ."
            });
        }

        await db.query(
            `
            UPDATE user
            SET profil_img = ?
            WHERE user_id = ?
            `,
            [profil_img, userId]
        );

        res.json({
            success: true,
            message: "Η εικόνα προφίλ ενημερώθηκε επιτυχώς."
        });

    } catch (error) {
        console.error("Update profile image error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ενημέρωση εικόνας προφίλ."
        });
    }
}

export async function updateInterests(req, res) {
    try {
        const { userId } = req.params;
        const { interests } = req.body;

        if (!interests) {
            return res.status(400).json({
                success: false,
                message: "Λείπουν τα ενδιαφέροντα."
            });
        }

        await db.query(
            `
            UPDATE user
            SET user_interests = ?
            WHERE user_id = ?
            `,
            [interests, userId]
        );

        res.json({
            success: true,
            message: "Τα ενδιαφέροντα ενημερώθηκαν επιτυχώς."
        });

    } catch (error) {
        console.error("Update interests error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ενημέρωση ενδιαφερόντων."
        });
    }
}

export async function updateBio(req, res) {
    try {
        const { userId } = req.params;
        const { bio } = req.body;

        if (!bio) {
            return res.status(400).json({
                success: false,
                message: "Λείπει το bio."
            });
        }

        await db.query(
            `
            UPDATE user
            SET user_bio = ?
            WHERE user_id = ?
            `,
            [bio, userId]
        );

        res.json({
            success: true,
            message: "Το bio ενημερώθηκε επιτυχώς."
        });

    } catch (error) {
        console.error("Update bio error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ενημέρωση bio."
        });
    }
}

export async function getUserClubs(req, res) {
    try {
        const { userId } = req.params;

        const sql = `
            SELECT 
                c.club_id,
                c.title,
                c.description,
                m.membership_role,
                m.membership_status,
                m.membershipdate
            FROM membership m
            JOIN club c
                ON m.clubid = c.club_id
            WHERE m.userid = ?
            AND m.membership_status = 'approved'
        `;

        const [clubs] = await db.query(sql, [userId]);

        res.json({
            success: true,
            clubs
        });

    } catch (error) {
        console.error("Get user clubs error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση συλλόγων."
        });
    }
}

export async function leaveClub(req, res) {
    try {
        const { userId, clubId } = req.params;

        const [result] = await db.query(
            `
            DELETE FROM membership
            WHERE userid = ?
            AND clubid = ?
            AND membership_role = 'user'
            `,
            [userId, clubId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Δεν βρέθηκε απλή συνδρομή χρήστη για απεγγραφή."
            });
        }

        res.json({
            success: true,
            message: "Η απεγγραφή από τον σύλλογο ολοκληρώθηκε."
        });

    } catch (error) {
        console.error("Leave club error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την απεγγραφή από σύλλογο."
        });
    }
}