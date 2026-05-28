// ========================================================
// 1. ΔΙΑΧΕΙΡΙΣΗ MODALS (ΑΝΟΙΓΜΑ & ΚΛΕΙΣΙΜΟ)
// ========================================================

// Παίρνουμε όλα τα modals
const modal1 = document.getElementById("id01");
const modal2 = document.getElementById("id02");
const modal3 = document.getElementById("id03");
const modal4 = document.getElementById("id04");

// Κλείσιμο όταν ο χρήστης πατάει οπουδήποτε ΕΞΩ από κάποιο modal
window.addEventListener('click', function (event) {
    if (event.target === modal1) modal1.style.display = "none";
    if (event.target === modal2) modal2.style.display = "none";
    if (event.target === modal3) modal3.style.display = "none";
    if (event.target === modal4) modal4.style.display = "none";
});

// ========================================================
// 2. ΛΕΙΤΟΥΡΓΙΚΟΤΗΤΑ ΡΟΛΟΥ (ADMIN FIELDS ΣΤΟ MODAL 3)
// ========================================================
function setupAdminFields() {
    const roleSelect = document.getElementById("user_role");
    const adminFields = document.getElementById("admin_only_fields");
    const visibilitySelect = document.getElementById("ann_visibility");

    if (roleSelect && adminFields) {
        roleSelect.addEventListener("change", function() {
            if (this.value === "admin") {
                adminFields.style.visibility = "visible";
                adminFields.style.height = "auto"; // Ανοίγει ο χώρος ομαλά
                if (visibilitySelect) visibilitySelect.required = true;
            } else {
                adminFields.style.visibility = "hidden";
                adminFields.style.height = "0px"; // Κλείνει ο χώρος
                if (visibilitySelect) visibilitySelect.required = false;
            }
        });
    }
}

// ========================================================
// 3. ΑΝΤΛΗΣΗ ΔΕΔΟΜΕΝΩΝ (FETCH) ΑΠΟ PHP
// ========================================================

// Φόρτωση των Clubs (Γεμίζει το Dropdown στη Φόρμα 1 και στη Φόρμα 3)
async function loadClubs() {
    try {
        const response = await fetch('get_clubs.php');
        const clubs = await response.json();
        
        const selectElement1 = document.getElementById('clubid');     
        const selectElement3 = document.getElementById('ann_clubid'); 

        clubs.forEach(club => {
            // Γέμισμα 1ης φόρμας
            if (selectElement1) {
                const option1 = document.createElement('option');
                option1.value = club.id;
                option1.textContent = club.name;
                selectElement1.appendChild(option1);
            }
            // Γέμισμα 3ης φόρμας (Ανακοινώσεις)
            if (selectElement3) {
                const option3 = document.createElement('option');
                option3.value = club.id;
                option3.textContent = club.name;
                selectElement3.appendChild(option3);
            }
        });
    } catch (error) {
        console.error("Σφάλμα κατά τη φόρτωση των clubs:", error);
    }
}

// Φόρτωση των Events (Γεμίζει το Dropdown στη Φόρμα 2)
async function loadEvents() {
    try {
        const response = await fetch('get_events.php');
        const events = await response.json();
        const selectElement = document.getElementById('event_id'); // Διορθώθηκε για να ταιριάζει με την HTML σου
        
        if (selectElement) {
            events.forEach(event => {
                const option = document.createElement('option');
                option.value = event.event_id;   
                option.textContent = event.ev_title; 
                selectElement.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Σφάλμα κατά τη φόρτωση των events:", error);
    }
}

// ========================================================
// 4. ΕΚΤΕΛΕΣΗ ΜΟΛΙΣ ΦΟΡΤΩΣΕΙ Η ΣΕΛΙΔΑ
// ========================================================
window.addEventListener('load', () => {
    loadClubs();
    loadEvents();
    setupAdminFields();
});