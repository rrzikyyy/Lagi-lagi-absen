document.addEventListener('DOMContentLoaded', () => {
    const welcomePopup = document.getElementById('welcome-popup');
    const closeWelcomeBtn = document.getElementById('close-welcome');
    const loginChoicePopup = document.getElementById('login-choice-popup');
    const mahasiswaSection = document.getElementById('mahasiswa-section');
    const absensiForm = document.getElementById('absensi-form');
    const statusKehadiran = document.getElementById('status-kehadiran');
    const dinasSection = document.getElementById('dinas-section');
    const logbookSection = document.getElementById('logbook-section');
    const pilihanDinas = document.getElementById('pilihan-dinas');
    const currentTimeEl = document.getElementById('current-time');
    const successNotification = document.getElementById('success-notification');

    // Tampilkan Jam Real-time
    function updateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        currentTimeEl.textContent = now.toLocaleDateString('id-ID', options);
    }
    setInterval(updateTime, 1000);
    updateTime();

    // Event Listener untuk Pop-up
    closeWelcomeBtn.addEventListener('click', () => {
        welcomePopup.classList.add('hidden');
        loginChoicePopup.classList.remove('hidden');
    });

    window.showMahasiswaLogin = function() {
        loginChoicePopup.classList.add('hidden');
        mahasiswaSection.classList.remove('hidden');
    }

    // Tampilkan pilihan dinas jika "Hadir"
    statusKehadiran.addEventListener('change', () => {
        if (statusKehadiran.value === 'Hadir') {
            dinasSection.classList.remove('hidden');
            logbookSection.classList.remove('hidden');
        } else {
            dinasSection.classList.add('hidden');
            logbookSection.classList.add('hidden');
        }
    });

    // Handle pengiriman form
    absensiForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = document.getElementById('submit-button');
        submitButton.textContent = 'Mengirim...';
        submitButton.disabled = true;

        const now = new Date();
        const jam = now.getHours();
        const menit = now.getMinutes();
        const waktuAbsen = `${String(jam).padStart(2, '0')}:${String(menit).padStart(2, '0')}`;
        
        let keteranganTerlambat = 'Tepat Waktu';
        if (statusKehadiran.value === 'Hadir') {
            const dinas = pilihanDinas.value;
            if (dinas === 'Pagi' && (jam > 6 || (jam === 6 && menit > 0))) {
                keteranganTerlambat = 'Terlambat';
            } else if (dinas === 'Siang' && (jam > 14 || (jam === 14 && menit > 0))) {
                keteranganTerlambat = 'Terlambat';
            } else if (dinas === 'Malam' && (jam > 22 || (jam === 22 && menit > 0))) {
                keteranganTerlambat = 'Terlambat';
            }
        }

        // Data yang akan dikirim
        const data = {
            timestamp: now.toLocaleString('id-ID'),
            nama: document.getElementById('nama').value,
            nim: document.getElementById('nim').value,
            status: statusKehadiran.value,
            dinas: statusKehadiran.value === 'Hadir' ? pilihanDinas.value : '-',
            waktuAbsen: waktuAbsen,
            keterangan: keteranganTerlambat,
            logbook: document.getElementById('logbook').value || '-'
        };

        // Kirim data ke backend (Netlify Function)
        try {
            // GANTI DENGAN URL NETLIFY FUNCTION ANDA SETELAH DEPLOY
            const response = await fetch('https://NAMA-SITUS-ANDA.netlify.app/.netlify/functions/submit-attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showSuccessNotification();
                absensiForm.reset();
                dinasSection.classList.add('hidden');
                logbookSection.classList.add('hidden');
            } else {
                throw new Error('Gagal mengirim absensi.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan. Coba lagi.');
        } finally {
            submitButton.textContent = 'Kirim Absensi';
            submitButton.disabled = false;
        }
    });

    function showSuccessNotification() {
        successNotification.classList.remove('hidden');
        setTimeout(() => {
            successNotification.classList.add('hidden');
        }, 3000);
    }
});
