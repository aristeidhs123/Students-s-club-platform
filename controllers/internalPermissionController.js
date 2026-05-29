import db from "../config/db.js";

export async function grantActivityPermission(req, res) {
    try {
        const {
            club_id,
            granted_by,
            user_id,
            permission_type
        } = req.body;

        if (
            !club_id ||
            !granted_by ||
            !user_id ||
            !permission_type
        ) {
            return res.status(400).json({
                success: false,
                message: "Λείπουν υποχρεωτικά στοιχεία."
            });
        }

        const allowedPermissions = [
            "manage_schedule",
            "manage_activities",
            "view_attendance"
        ];

        if (!allowedPermissions.includes(permission_type)) {
            return res.status(400).json({
                success: false,
                message: "Μη έγκυρος τύπος δικαιώματος."
            });
        }

        const [manager] = await db.query(
            `
            SELECT membership_id
            FROM membership
            WHERE userid = ?
            AND clubid = ?
            AND membership_role = 'manager'
            AND membership_status = 'approved'
            `,
            [granted_by, club_id]
        );

        const [admin] = await db.query(
            `
            SELECT role
            FROM user
            WHERE user_id = ?
            `,
            [granted_by]
        );

        const isAdmin =
            admin.length > 0 &&
            admin[0].role === "admin";

        if (manager.length === 0 && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Δεν έχεις δικαίωμα εκχώρησης permissions."
            });
        }

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
            return res.status(404).json({
                success: false,
                message: "Ο χρήστης δεν είναι εγκεκριμένο μέλος."
            });
        }

        const sql = `
            INSERT INTO activity_permission
            (club_id, user_id, granted_by, permission_type)
            VALUES (?, ?, ?, ?)
        `;

        await db.query(sql, [
            club_id,
            user_id,
            granted_by,
            permission_type
        ]);

        res.status(201).json({
            success: true,
            message: "Το permission δόθηκε επιτυχώς."
        });

    } catch (error) {
        console.error("Grant permission error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την εκχώρηση permission."
        });
    }
}