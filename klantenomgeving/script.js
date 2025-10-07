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

    // Nieuwe helper functie om een rij te maken (zodat we het kunnen hergebruiken)
    const createCustomerRow = (id, name, address, phone, email) => {
        const newRow = document.createElement('div');
        newRow.classList.add('customer-row');
        newRow.dataset.customerId = id;
        newRow.innerHTML = `
            <span data-field="id"><strong>ID:</strong> ${id}</span>
            <span data-field="name"><strong>Naam:</strong> ${name}</span>
            <span data-field="address"><strong>Adres:</strong> ${address}</span>
            <span data-field="phone"><strong>Telefoon:</strong> ${phone}</span>
            <span data-field="email"><strong>Email:</strong> ${email}</span>
            <i class="fas fa-pencil-alt edit-icon"></i>
            <div class="edit-actions">
                <button class="save-button">Opslaan</button>
                <button class="cancel-button">Annuleren</button>
            </div>
        `;
        return newRow;
    };

    addButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    addCustomerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        // **OPMERKING:** In een echt systeem zou je een ID van de server krijgen.
        // Dit is een simpele manier om een unieke ID te genereren in de browser.
        const maxId = Array.from(customerList.querySelectorAll('.customer-row'))
            .map(row => parseInt(row.dataset.customerId))
            .filter(id => !isNaN(id))
            .reduce((max, current) => Math.max(max, current), 0);
        const newId = maxId + 1;

        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;

        const newRow = createCustomerRow(newId, name, address, phone, email);
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
        // Zorg ervoor dat we niet op een bewerkingsknop klikken als we in delete mode zijn
        if (clickedRow && !event.target.closest('.edit-actions') && !event.target.classList.contains('edit-icon')) {
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

    // --- WIJZIGEN Functies (NIEUW) ---

    const enableEditMode = (row) => {
        // Zorg ervoor dat we niet in delete mode zijn voordat we gaan bewerken
        if (inDeleteMode) {
            exitDeleteMode();
        }

        // Voorkom bewerking als er al een andere rij wordt bewerkt
        if (document.querySelector('.customer-row.edit-mode')) {
            alert("Sluit eerst de huidige bewerking af.");
            return;
        }

        row.classList.add('edit-mode');

        // Loop door elk span-veld (behalve ID) en vervang het door een inputveld
        row.querySelectorAll('span[data-field]').forEach(span => {
            const field = span.dataset.field;
            // Haal alleen de waarde op uit de span-tekst (e.g. "Naam: Jan" -> "Jan")
            const currentValue = span.textContent.replace(new RegExp(`^.*:\\s*`), '').trim(); 
            
            if (field !== 'id') {
                 // Sla de oorspronkelijke waarde op als een attribuut op de span
                 span.dataset.originalValue = currentValue; 

                const input = document.createElement('input');
                input.type = field === 'email' ? 'email' : 'text';
                input.value = currentValue;
                input.dataset.field = field; // Gebruik data-field om het veld te identificeren
                
                // Voeg het inputveld vóór de span toe
                row.insertBefore(input, span);
            }
        });
    };

    const disableEditMode = (row, shouldSave) => {
        row.classList.remove('edit-mode');
        
        // Loop door alle inputvelden in deze rij
        row.querySelectorAll('input[data-field]').forEach(input => {
            const field = input.dataset.field;
            const span = row.querySelector(`span[data-field="${field}"]`);
            
            if (shouldSave) {
                // Opslaan: Update de span-inhoud met de nieuwe waarde
                const fieldLabel = span.textContent.split(':')[0]; // Haal de label op (e.g. "Naam")
                span.innerHTML = `<strong>${fieldLabel}:</strong> ${input.value}`;
            } else {
                // Annuleren: Herstel de span-inhoud naar de oorspronkelijke waarde
                const fieldLabel = span.textContent.split(':')[0];
                const originalValue = span.dataset.originalValue || ''; // Gebruik de opgeslagen waarde
                span.innerHTML = `<strong>${fieldLabel}:</strong> ${originalValue}`;
            }

            // Verwijder het inputveld
            input.remove();
        });

        // Verwijder de opgeslagen originele waarden
        row.querySelectorAll('span[data-field]').forEach(span => {
            delete span.dataset.originalValue;
        });
    };

    // Voeg een algemene click-listener toe voor bewerken en acties
    customerList.addEventListener('click', (event) => {
        const row = event.target.closest('.customer-row');
        if (!row) return;

        // Klik op potlood-icoon
        if (event.target.classList.contains('edit-icon')) {
            enableEditMode(row);
        } 
        
        // Klik op "Opslaan"
        else if (event.target.classList.contains('save-button')) {
            // In een echt systeem zou je hier een AJAX/Fetch call doen om op te slaan
            disableEditMode(row, true); // True betekent opslaan
        } 
        
        // Klik op "Annuleren"
        else if (event.target.classList.contains('cancel-button')) {
            disableEditMode(row, false); // False betekent niet opslaan
        }
    });
});