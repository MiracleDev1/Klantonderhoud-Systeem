document.addEventListener('DOMContentLoaded', () => {

    // --- ALGEMENE SELECTOREN ---
    const container = document.querySelector('.container');
    const customerList = document.querySelector('.customer-list');

    // --- TOEVOEGEN Functies ---
    const modal = document.getElementById('add-customer-modal');
    const addButton = document.getElementById('addButton');
    const closeButton = document.querySelector('.close-button');
    const addCustomerForm = document.getElementById('add-customer-form');

    const openModal = () => modal.style.display = 'block';
    const closeModal = () => {
        modal.style.display = 'none';
        addCustomerForm.reset();
    };

    addButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    addCustomerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;

        const newRow = document.createElement('div');
        newRow.classList.add('customer-row');
        newRow.innerHTML = `
            <span><strong>ID:</strong></span>
            <span><strong>Naam:</strong> ${name}</span>
            <span><strong>Adres:</strong> ${address}</span>
            <span><strong>Telefoon:</strong> ${phone}</span>
            <span><strong>Email:</strong> ${email}</span>
            <i class="fas fa-pencil-alt edit-icon"></i>
        `;
        customerList.appendChild(newRow);
        closeModal();
    });

    // --- VERWIJDEREN Functies ---
    const deleteButton = document.getElementById('deleteButton');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    let inDeleteMode = false;

    // Functie om de verwijder-modus te verlaten
    const exitDeleteMode = () => {
        inDeleteMode = false;
        container.classList.remove('delete-mode');
        deleteButton.textContent = 'Verwijderen';
        deleteButton.classList.remove('cancel-mode');
        
        // Deselecteer alle rijen die geselecteerd waren
        document.querySelectorAll('.customer-row.selected-for-deletion').forEach(row => {
            row.classList.remove('selected-for-deletion');
        });
    };

    // Klik op de hoofd "Verwijderen" / "Annuleren" knop
    deleteButton.addEventListener('click', () => {
        if (inDeleteMode) {
            // Als we al in de modus zijn, annuleren we
            exitDeleteMode();
        } else {
            // Anders starten we de modus
            inDeleteMode = true;
            container.classList.add('delete-mode');
            deleteButton.textContent = 'Annuleren';
            deleteButton.classList.add('cancel-mode');
        }
    });

    // Klik op een klantenrij om deze te (de)selecteren
    customerList.addEventListener('click', (event) => {
        // Werkt alleen als we in de verwijder-modus zijn
        if (!inDeleteMode) return;
        
        // Vind de geklikte .customer-row
        const clickedRow = event.target.closest('.customer-row');
        if (clickedRow) {
            clickedRow.classList.toggle('selected-for-deletion');
        }
    });

    // Klik op het prullenbak-icoon om de selectie te verwijderen
    confirmDeleteButton.addEventListener('click', () => {
        // Vraag om bevestiging
        const rowsToDelete = document.querySelectorAll('.selected-for-deletion');
        if (rowsToDelete.length === 0) {
            alert("Selecteer eerst een of meerdere klanten om te verwijderen.");
            return;
        }

        if (confirm(`Weet je zeker dat je ${rowsToDelete.length} klant(en) wilt verwijderen?`)) {
            rowsToDelete.forEach(row => {
                row.remove();
            });
            // Verlaat de verwijder-modus na het verwijderen
            exitDeleteMode();
        }
    });
});