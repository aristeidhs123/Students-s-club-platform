import db from "../config/db.js";

function generateBotAnswer(problem) {

    const text = problem.toLowerCase();

    if (text.includes("login")) {
        return "Δοκίμασε να ελέγξεις τα στοιχεία σύνδεσής σου.";
    }

    if (text.includes("event")) {
        return "Έλεγξε αν η εκδήλωση είναι ακόμη ενεργή.";
    }

    return "Δεν βρήκα ακριβή λύση. Θέλεις επικοινωνία με admin;";
}

export async function askChatbot(req, res) {

    try {

        const { user_id, problem } = req.body;

        if (!user_id || !problem) {

            return res.status(400).json({
                success: false,
                message: "Λείπουν δεδομένα."
            });
        }

        const checkUserSql = `
        SELECT user_id
        FROM user
        WHERE user_id = ?
        `;

        const [users] = await db.query(checkUserSql, [user_id]);

        if (users.length === 0) {
        return res.status(404).json({
        success: false,
        message: "Ο χρήστης δεν βρέθηκε."
        });
        }

        const botAnswer = generateBotAnswer(problem);

        const sql = `
            INSERT INTO chatbot_messages
            (user_id, user_problem, bot_answer)
            VALUES (?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            user_id,
            problem,
            botAnswer
        ]);

        res.status(201).json({
            success: true,
            chatbot_message_id: result.insertId,
            answer: botAnswer
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

export async function contactAdmin(req, res) {
    try {
        const {
            user_id,
            chatbot_message_id,
            full_name,
            email,
            problem
        } = req.body;

        if (!user_id || !problem) {
            return res.status(400).json({
                success: false,
                message: "Λείπει το user_id ή το πρόβλημα."
            });
        }

        const checkUserSql = `
        SELECT user_id
        FROM user
        WHERE user_id = ?
        `;

        const [users] = await db.query(checkUserSql, [user_id]);

        if (users.length === 0) {
        return res.status(404).json({
        success: false,
        message: "Ο χρήστης δεν βρέθηκε."
        });
        }

        const insertSql = `
            INSERT INTO contact_admin_messages
            (user_id, chatbot_message_id, full_name, email, problem)
            VALUES (?, ?, ?, ?, ?)
        `;

        await db.query(insertSql, [
            user_id,
            chatbot_message_id || null,
            full_name || null,
            email || null,
            problem
        ]);

        if (chatbot_message_id) {
            const updateSql = `
                UPDATE chatbot_messages
                SET needs_admin = TRUE,
                    conversation_status = 'WAITING_ADMIN'
                WHERE message_id = ?
            `;

            await db.query(updateSql, [chatbot_message_id]);
        }

        res.status(201).json({
            success: true,
            message: "Το μήνυμα στάλθηκε στον admin."
        });

    } catch (error) {
        console.error("Contact admin error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την αποστολή στον admin."
        });
    }
}

export async function getUnreadAdminMessages(req, res) {
    try {
        const sql = `
            SELECT 
                contact_id,
                user_id,
                chatbot_message_id,
                full_name,
                email,
                problem,
                status,
                created_at
            FROM contact_admin_messages
            WHERE is_read = FALSE
            AND status = 'PENDING'
            ORDER BY created_at ASC
        `;

        const [messages] = await db.query(sql);

        res.json({
            success: true,
            messages: messages
        });

    } catch (error) {
        console.error("Get unread admin messages error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση των μηνυμάτων."
        });
    }
}

export async function answerAdminMessage(req, res) {
    try {
        const { contactId } = req.params;
        const { admin_answer } = req.body;

        if (!admin_answer) {
            return res.status(400).json({
                success: false,
                message: "Η απάντηση του admin είναι υποχρεωτική."
            });
        }

        const sql = `
            UPDATE contact_admin_messages
            SET admin_answer = ?,
                is_read = TRUE,
                status = 'ANSWERED',
                answered_at = NOW()
            WHERE contact_id = ?
        `;

        const [result] = await db.query(sql, [admin_answer, contactId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Δεν βρέθηκε μήνυμα με αυτό το contact_id."
            });
        }

        res.json({
            success: true,
            message: "Η απάντηση του admin αποθηκεύτηκε επιτυχώς."
        });

    } catch (error) {
        console.error("Answer admin message error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την αποθήκευση της απάντησης."
        });
    }
}

export async function getUserChatbotHistory(req, res) {
    try {
        const { userId } = req.params;
        
        const checkUserSql = `
        SELECT user_id
        FROM user
        WHERE user_id = ?
        `;

        const [users] = await db.query(checkUserSql, [user_id]);

        if (users.length === 0) {
        return res.status(404).json({
        success: false,
        message: "Ο χρήστης δεν βρέθηκε."
        });
        }

        const sql = `
            SELECT 
                cm.message_id,
                cm.user_problem,
                cm.bot_answer,
                cm.needs_admin,
                cm.conversation_status,
                cm.created_at,

                cam.contact_id,
                cam.problem AS admin_problem,
                cam.admin_answer,
                cam.status AS admin_status,
                cam.answered_at

            FROM chatbot_messages cm
            LEFT JOIN contact_admin_messages cam
                ON cm.message_id = cam.chatbot_message_id

            WHERE cm.user_id = ?

            ORDER BY cm.created_at DESC
        `;

        const [history] = await db.query(sql, [userId]);

        res.json({
            success: true,
            history
        });

    } catch (error) {
        console.error("Get user chatbot history error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση του ιστορικού."
        });
    }
}

export async function closeConversation(req, res) {
    try {
        const { messageId } = req.params;

        const sql = `
            UPDATE chatbot_messages
            SET conversation_status = 'CLOSED'
            WHERE message_id = ?
        `;

        const [result] = await db.query(sql, [messageId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Δεν βρέθηκε συνομιλία με αυτό το message_id."
            });
        }

        res.json({
            success: true,
            message: "Η συνομιλία έκλεισε επιτυχώς."
        });

    } catch (error) {
        console.error("Close conversation error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά το κλείσιμο της συνομιλίας."
        });
    }
}