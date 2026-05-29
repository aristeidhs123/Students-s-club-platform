import {
    getProfile,
    checkUsernameAvailability,
    updateUsername,
    updateProfileImage,
    updateBio,
    updateInterests,
    getUserClubs,
    leaveClub
} from "./api.js";

// προσωρινά μέχρι να βάλουμε login/session
const USER_ID = 1;

async function loadProfile() {
    try {
        const data = await getProfile(USER_ID);
        const profile = data.profile;

        document.getElementById("viewName").textContent =
            `${profile.name} ${profile.lastname}`;

        document.getElementById("viewRole").textContent =
            `Role: ${profile.role}`;

        document.getElementById("viewBio").textContent =
            profile.user_bio || "Δεν υπάρχει bio.";

        document.getElementById("profileImage").src =
            profile.profil_img ||
            "https://via.placeholder.com/600x400?text=Profile";

        if (document.getElementById("username")) {
            document.getElementById("username").value = profile.username || "";
        }

        if (document.getElementById("bio")) {
            document.getElementById("bio").value = profile.user_bio || "";
        }

        if (document.getElementById("profileImageUrl")) {
            document.getElementById("profileImageUrl").value = profile.profil_img || "";
        }

        if (document.getElementById("interests")) {
            document.getElementById("interests").value = profile.user_interests || "";
        }

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function saveUsername() {
    try {
        const username = document.getElementById("username").value.trim();

        if (!username) {
            alert("Συμπλήρωσε username.");
            return;
        }

        const availability = await checkUsernameAvailability(username);

        if (!availability.available) {
            alert("Το username δεν είναι διαθέσιμο.");
            return;
        }

        const data = await updateUsername(USER_ID, username);
        alert(data.message);

        await loadProfile();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function saveBio() {
    try {
        const bio = document.getElementById("bio").value.trim();

        const data = await updateBio(USER_ID, bio);
        alert(data.message);

        await loadProfile();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function saveProfileImage() {
    try {
        const profil_img = document.getElementById("profileImageUrl").value.trim();

        if (!profil_img) {
            alert("Συμπλήρωσε URL εικόνας.");
            return;
        }

        const data = await updateProfileImage(USER_ID, profil_img);
        alert(data.message);

        await loadProfile();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function saveInterests() {
    try {
        const interests = document.getElementById("interests").value.trim();

        const data = await updateInterests(USER_ID, interests);
        alert(data.message);

        await loadProfile();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function loadUserClubs() {
    try {
        const data = await getUserClubs(USER_ID);
        const clubsList = document.getElementById("clubsList");

        if (!clubsList) return;

        clubsList.innerHTML = "";

        data.clubs.forEach((club) => {
            const div = document.createElement("div");
            div.className = "club-item";

            div.innerHTML = `
                <h4>${club.title}</h4>
                <p>${club.description || ""}</p>
                <p>Role: ${club.membership_role}</p>
                <button class="secondary-btn" data-club-id="${club.club_id}">
                    Απεγγραφή
                </button>
            `;

            div.querySelector("button").addEventListener("click", async () => {
                await handleLeaveClub(club.club_id);
            });

            clubsList.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function handleLeaveClub(clubId) {
    try {
        const confirmLeave = confirm("Θέλεις σίγουρα να απεγγραφείς από αυτόν τον σύλλογο;");

        if (!confirmLeave) return;

        const data = await leaveClub(USER_ID, clubId);
        alert(data.message);

        await loadUserClubs();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    loadUserClubs();

    const saveUsernameBtn = document.getElementById("saveUsernameBtn");
    const saveBioBtn = document.getElementById("saveBioBtn");
    const saveImageBtn = document.getElementById("saveImageBtn");
    const saveInterestsBtn = document.getElementById("saveInterestsBtn");
    const resetBtn = document.getElementById("resetBtn");

    if (saveUsernameBtn) {
        saveUsernameBtn.addEventListener("click", saveUsername);
    }

    if (saveBioBtn) {
        saveBioBtn.addEventListener("click", saveBio);
    }

    if (saveImageBtn) {
        saveImageBtn.addEventListener("click", saveProfileImage);
    }

    if (saveInterestsBtn) {
        saveInterestsBtn.addEventListener("click", saveInterests);
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", loadProfile);
    }
});