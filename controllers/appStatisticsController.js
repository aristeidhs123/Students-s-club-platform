import db from "../config/db.js";

export async function getAppStatisticsOptions(req, res) {
    try {
        const options = [
            {
                id: 1,
                type: "chatbot_usage",
                title: "Χρήση chatbot"
            },
            {
                id: 2,
                type: "chatbot_efficiency",
                title: "Στατιστικά αποδοτικότητας"
            },
            {
                id: 3,
                type: "app_usage",
                title: "Στατιστικά χρήσης εφαρμογής"
            }
        ];

        res.json({
            success: true,
            options
        });

    } catch (error) {
        console.error("Get app statistics options error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση επιλογών στατιστικών εφαρμογής."
        });
    }
}

export async function getChatbotUsageStatistics(req, res) {
    try {
        const [chatbotRows] = await db.query(
            `
            SELECT COUNT(*) AS chatbot_uses
            FROM chatbot_messages
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            `
        );

        const [userRows] = await db.query(
            `
            SELECT COUNT(*) AS total_users
            FROM user
            `
        );

        const chatbotUses = chatbotRows[0].chatbot_uses;
        const totalUsers = userRows[0].total_users;

        const ratio = totalUsers > 0 ? chatbotUses / totalUsers : 0;

        res.json({
            success: true,
            statistics: {
                period: "last_7_days",
                chatbot_uses: chatbotUses,
                total_users: totalUsers,
                ratio: Number(ratio.toFixed(2))
            }
        });

    } catch (error) {
        console.error("Get chatbot usage statistics error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση χρήσης chatbot."
        });
    }
}

export async function getChatbotEfficiencyStatistics(req, res) {
    try {
        const [adminContactRows] = await db.query(
            `
            SELECT COUNT(*) AS admin_contacts
            FROM contact_admin_messages
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            `
        );

        const [chatbotUserRows] = await db.query(
            `
            SELECT COUNT(DISTINCT user_id) AS chatbot_users
            FROM chatbot_messages
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            `
        );

        const adminContacts = adminContactRows[0].admin_contacts;
        const chatbotUsers = chatbotUserRows[0].chatbot_users;

        const ratio = chatbotUsers > 0 ? adminContacts / chatbotUsers : 0;

        res.json({
            success: true,
            statistics: {
                period: "last_7_days",
                admin_contacts: adminContacts,
                chatbot_users: chatbotUsers,
                ratio: Number(ratio.toFixed(2))
            }
        });

    } catch (error) {
        console.error("Get chatbot efficiency statistics error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση αποδοτικότητας chatbot."
        });
    }
}

export async function getAppUsageStatistics(req, res) {
    try {
        const [loginRows] = await db.query(
            `
            SELECT COUNT(*) AS login_interactions
            FROM login_activity
            WHERE login_time >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
            `
        );

        const [activeCodeRows] = await db.query(
            `
            SELECT COUNT(DISTINCT user_id) AS active_login_users
            FROM login_activity
            WHERE is_active_code = TRUE
            `
        );

        const loginInteractions = loginRows[0].login_interactions;
        const activeLoginUsers = activeCodeRows[0].active_login_users;

        const ratio =
            activeLoginUsers > 0
                ? loginInteractions / activeLoginUsers
                : 0;

        res.json({
            success: true,
            statistics: {
                period: "last_month",
                login_interactions: loginInteractions,
                active_login_users: activeLoginUsers,
                ratio: Number(ratio.toFixed(2))
            }
        });

    } catch (error) {
        console.error("Get app usage statistics error:", error);

        res.status(500).json({
            success: false,
            message: "Σφάλμα κατά την ανάκτηση χρήσης εφαρμογής."
        });
    }
}