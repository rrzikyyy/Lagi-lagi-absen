// =======================================================
// KONFIGURASI
// Ganti dengan URL Web App dari Google Apps Script Anda!
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx8kE2_3mzq7E0waLuMzduT1T3ZUOx-QAoK0-cMmgBG_szFxd2ZlEZqdJW6Ug_1GAAHMw/exec"; 
// =======================================================

// Elemen DOM
const welcomePopup = document.getElementById('welcome-popup');
const mahasiswaPage = document.getElementById('mahasiswa-page');
const adminPage = document.getElementById('admin-page');

const loginMahasiswaBtn = document.getElementById('login-mahasiswa-btn');
const loginAdminBtn = document.getElementById('login-admin-btn');

const absensiForm = document.getElementById('absensi-form');
const logbookForm = document.getElementById('logbook-form');

const notifPopup = document.getElementById('notification-popup');
const notifMessage = document.getElementById('notification-message');

// Variabel Global
let currentUser = null;

// --- Fungsi Notifikasi Popup ---
function showNotification(message, isSuccess = true) {
    notifMessage.textContent = message;
    notifPopup.style.backgroundColor = isSuccess ? 'var(--kai-orange)' : '#d9534f';
    notifPopup.classList.add('show');
    setTimeout(() => {
        notifPopup.classList.remove('show');
    }, 4000);
}

// --- Event Listeners untuk Login ---
loginMahasiswaBtn.addEventListener('click', () => {
    const nama = prompt("Silakan masukkan nama lengkap Anda:");
    if (nama) {
        currentUser = nama.trim();
        document.getElementById('nama-mahasiswa').value = currentUser; // Otomatis isi nama
        welcomePopup.classList.remove('active');
        mahasiswaPage.style.display = 'block';
    } else {
        alert("Nama tidak boleh kosong!");
    }
});

loginAdminBtn.addEventListener('click', () => {
    // Otentikasi admin yang sangat sederhana (HANYA UNTUK CONTOH)
    const password = prompt("Masukkan password admin:");
    if (password === "admin123") { // Ganti password ini jika perlu
        welcomePopup.classList.remove('active');
        adminPage.style.display = 'block';
        fetchAdminData();
    } else {
        alert("Password salah!");
    }
});

// --- Fungsi Submit ke Google Apps Script ---
async function submitData(payload, formElement) {
    const button = formElement.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Mengirim...';

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        const result = await response.json();

        if (result.status === "success") {
            showNotification(result.message, true);
            formElement.reset();
             if (currentUser) {
                document.getElementById('nama-mahasiswa').value = currentUser;
            }
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showNotification('Error: ' + error.message, false);
    } finally {
        button.disabled = false;
        button.textContent = button.id === 'absensi-form' ? 'Kirim Absensi' : 'Kirim Logbook';
    }
}

// --- Event Listener untuk Form ---
absensiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
        action: "submitAbsensi",
        nama: document.getElementById('nama-mahasiswa').value,
        status: document.getElementById('status-absen').value,
        sesi: document.getElementById('sesi-dinas').value,
        keterangan: document.getElementById('keterangan').value
    };
    submitData(payload, absensiForm);
});

logbookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
        action: "submitLogbook",
        nama: currentUser,
        kegiatan: document.getElementById('kegiatan-logbook').value
    };
    submitData(payload, logbookForm);
});


// --- FUNGSI UNTUK ADMIN ---
async function fetchAdminData() {
    const refreshBtn = document.getElementById('refresh-data-btn');
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Memuat Data...';

    try {
        // Kita gunakan metode GET untuk mengambil data. Ini perlu penyesuaian di Apps Script
        // Untuk simpelnya kita tetap POST dengan action berbeda
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            body: JSON.stringify({ action: "getRekapan" }),
            redirect: 'follow'
        });

        const result = await response.json();
        if (result.status === 'success') {
            populateTable('tabel-absensi', result.absensi, 7);
            populateTable('tabel-logbook', result.logbook, 3);
            showNotification('Data berhasil dimuat!', true);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showNotification('Gagal memuat data: ' + error.message, false);
    } finally {
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh Data';
    }
}

function populateTable(tableId, data, columns) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    tableBody.innerHTML = ''; // Kosongkan tabel
    data.forEach(rowData => {
        const row = document.createElement('tr');
        for (let i = 0; i < columns; i++) {
            const cell = document.createElement('td');
            // Format tanggal agar lebih mudah dibaca
            if (i === 0 && rowData[i]) {
                 cell.textContent = new Date(rowData[i]).toLocaleString('id-ID');
            } else {
                 cell.textContent = rowData[i];
            }
           
            row.appendChild(cell);
        }
        tableBody.appendChild(row);
    });
}

function exportTableToCSV(tableId, filename) {
    let csv = [];
    const rows = document.querySelectorAll(`#${tableId} tr`);
    
    for (const row of rows) {
        const cols = row.querySelectorAll('td, th');
        const rowData = [];
        for (const col of cols) {
            rowData.push('"' + col.innerText.replace(/"/g, '""') + '"');
        }
        csv.push(rowData.join(','));
    }

    const csvFile = new Blob([csv.join('\n')], { type: 'text/csv' });
    const downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

document.getElementById('refresh-data-btn').addEventListener('click', fetchAdminData);
document.getElementById('download-csv-btn').addEventListener('click', () => {
    exportTableToCSV('tabel-absensi', 'rekapan_absensi.csv');
});

