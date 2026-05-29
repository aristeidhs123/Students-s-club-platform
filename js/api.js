const API_URL = "http://localhost:3000/api";

async function apiRequest(endpoint, method = "GET", body = null) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (body !== null) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Σφάλμα στο request.");
    }

    return data;
}

// PROFILE API
export function getProfile(userId) {
    return apiRequest(`/profile/${userId}`);
}

export function checkUsernameAvailability(username) {
    return apiRequest(`/profile/check-username/${username}`);
}

export function updateUsername(userId, username) {
    return apiRequest(`/profile/${userId}/username`, "PATCH", {
        username
    });
}

export function updateProfileImage(userId, profil_img) {
    return apiRequest(`/profile/${userId}/image`, "PATCH", {
        profil_img
    });
}

export function updateBio(userId, bio) {
    return apiRequest(`/profile/${userId}/bio`, "PATCH", {
        bio
    });
}

export function updateInterests(userId, interests) {
    return apiRequest(`/profile/${userId}/interests`, "PATCH", {
        interests
    });
}

export function getUserClubs(userId) {
    return apiRequest(`/profile/${userId}/clubs`);
}

export function leaveClub(userId, clubId) {
    return apiRequest(`/profile/${userId}/clubs/${clubId}/leave`, "DELETE");
}