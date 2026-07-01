let currentStressLevel = "";

// Database Alur Chatbot Konseling Cabang Berdasarkan Tingkat Stres
const flowDatabase = {
    // ─── ALUR STRES RINGAN ───
    Ringan: {
        start: {
            text: "Hai! Hasil analisis tadi menunjukkan tingkat stresmu masih di batas <b>Ringan</b> kok. Tapi wajar banget kalau kamu ngerasa ada ganjalan. Gimana keadaanmu sekarang? 🌱",
            options: [
                { text: "Alhamdulillah, masih bisa dikontrol kok! 👍", next: "kontrol" },
                { text: "Aman, cuma lagi butuh asupan motivasi aja nih. ⚡", next: "motivasi" }
            ]
        },
        kontrol: {
            text: "Keren banget! Berarat manajemen emosimu udah oke. Tapi, biasanya apa nih hal kecil yang paling sering bikin kamu kepikiran akhir-akhir ini? 🤔",
            options: [
                { text: "Tugas kuliah mulai numpuk dikit 📚", next: "tugas" },
                { text: "Jam tidur agak berantakan nih 😴", next: "tidur" }
            ]
        },
        tugas: {
            text: "Ah, klasik banget ya kehidupan mahasiswa. Tugas numpuk emang suka jadi silent killer. Mau coba trik beresinnya tanpa bikin pusing? 🛠️",
            options: [
                { text: "Mau tau tips manajemen waktu dong ⏱️", next: "pomodoro" },
                { text: "Enggak deh, mau tips biar tetep santai aja ☕", next: "santai" }
            ]
        },
        pomodoro: {
            text: "Pernah denger Teknik Pomodoro? Kamu fokus belajar/nyicil tugas selama 25 menit, terus wajib total break 5 menit. Otak jadi gak gampang panas. Mau coba terapin?",
            options: [
                { text: "Boleh, mau coba nanti! 🚀", next: "finish" },
                { text: "Ada cara alternatif lain? 🧐", next: "prioritas" }
            ]
        },
        prioritas: {
            text: "Cara lain: bikin To-Do List pake skala prioritas. Beresin 1 tugas terkecil dulu dalam waktu 5 menit. Jangan ditunda ya, biar gak numpuk! Semangat!",
            options: [{ text: "Siap, langsung gas kerjain! 💪", next: "finish" }]
        },
        santai: {
            text: "Biar tetep santai pas nugas, coba jauhin distreksi medsos dulu 30 menit, terus setel musik instrumen lo-fi di background. Dijamin suasana hati jadi adem.",
            options: [{ text: "Nah, ini cocok banget! 🥤", next: "finish" }]
        },
        tidur: {
            text: "Kurang tidur itu bisa bikin gampang cranky dan merusak konsentrasi kuliah lho. Malam ini mau coba perbaiki kualitas jam tidurmu?",
            options: [
                { text: "Mau tips biar cepet ngantuk 🌙", next: "tipsTidur" },
                { text: "Susah tidur gara-gara overthinking 🧠", next: "overthinkRingan" }
            ]
        },
        tipsTidur: {
            text: "Cobalah aturan Screen-Free Zone 30 menit sebelum tidur. Jauhin HP, matiin atau redupin lampu kamar kamu. Gimana, mau dipraktekkin nanti malam?",
            options: [{ text: "Bakal dicoba malam ini! 🫡", next: "finish" }]
        },
        overthinkRingan: {
            text: "Kunci ngusir overthinking sebelum tidur: dengerin suara white noise alam atau podcast monoton penenang batin. Jangan dipaksa mikirin hari esok ya.",
            options: [{ text: "Okey, dicatat masukannya 📝", next: "finish" }]
        },
        motivasi: {
            text: "Siap, ini booster buat kamu: <i>'Kamu nggak harus sempurna buat jadi hebat. Kamu cuma perlu mulai, melangkah pelan-pelan, dan hargai prosesnya.'</i> Mau denger quotes penambah semangat kuliah?",
            options: [
                { text: "Boleh, butuh motivasi akademik 🎓", next: "motivasiAkademik" },
                { text: "Motivasi buat yang lagi ragu sama diri sendiri 🌟", next: "motivasiDiri" }
            ]
        },
        motivasiAkademik: {
            text: "Nilai ujian atau revisi skripsi emang penting, tapi ingetin ke diri kamu kalau itu semua gak mendefinisikan seberapa berharganya kamu sebagai manusia. Badai kuliah pasti berlalu!",
            options: [{ text: "Makasih ya, dapet energi baru! ✨", next: "finish" }]
        },
        motivasiDiri: {
            text: "Jangan bandingin tokomu sama toko orang lain yang udah buka duluan. Setiap orang punya timeline suksesnya masing-masing. Percaya sama langkahmu sendiri!",
            options: [{ text: "Betul banget, makasih! ✊", next: "finish" }]
        },
        finish: {
            text: "Ingat ya, stres ringan itu alarm alami tubuh biar kamu makin waspada dan berkembang. Kamu hebat udah bertahan sejauh ini! Teruskan energi positifmu hari ini ya! ✨",
            options: [{ text: "Terima kasih, StressCare! (Selesai) 🏁", next: "restart" }]
        }
    },

    // ─── ALUR STRES SEDANG ───
    Sedang: {
        start: {
            text: "Melihat hasil analisismu, tingkat stresmu berada di kategori <b>Sedang</b>. Aku tahu belakangan ini pasti rasanya berat dan melelahkan banget ya buat kamu. Gak apa-apa, kamu aman di sini. Apa yang paling bikin hatimu mengganjal? 🫂",
            options: [
                { text: "Aku ngerasa burnout & capek mental total 😭", next: "burnout" },
                { text: "Pikiran gak bisa berhenti, overthinking terus 🧠", next: "overthinking" }
            ]
        },
        burnout: {
            text: "Burnout itu tanda kalau mesin tubuh dan otak kamu udah dipaksa lari terlalu jauh tanpa jeda istirahat. Wajar banget kalau ngerasa kosong dan males ngapa-ngapain sekarang. Apa yang paling kamu butuhin saat ini? 🧊",
            options: [
                { text: "Mau menenangkan diri sejenak 🍃", next: "tenang" },
                { text: "Butuh saran biar tugas gak makin terbengkalai 📈", next: "solusiTugas" }
            ]
        },
        tenang: {
            text: "Pilihan yang bijak. Tugas kuliah bisa nunggu, tapi kesehatan mentalmu gak bisa dinegosiasi. Gimana kalau kita latihan pernapasan kotak (Box Breathing) bareng selama 1 menit? 🧘",
            options: [
                { text: "Boleh, pandu aku dong 👣", next: "boxBreathing" },
                { text: "Lebih pengen denger rekomendasi musik relaksasi aja 🎵", next: "musik" }
            ]
        },
        boxBreathing: {
            text: "Yuk mulai. Tarik napas 4 detik... Tahan napas 4 detik... Buang napas pelan 4 detik... Tahan kosong 4 detik. Rasakan udara dingin masuk mengalir ke paru-parumu. Gimana sensasinya?",
            options: [
                { text: "Agak lebih longgar & tenang 🍃", next: "finish" },
                { text: "Masih ngerasa rada deg-degan 💓", next: "afirmasi" }
            ]
        },
        afirmasi: {
            text: "Gak apa-apa, wajar kalau awal-awal masih gelisah. Coba taruh tangan kananmu di dada, rasakan detaknya, lalu bisikkan ke dirimu sendiri: <i>'Aku aman, aku berharga, dan aku sudah melakukan yang terbaik hari ini.'</i>",
            options: [{ text: "Terima kasih bimbingannya emosionalnya 💜", next: "finish" }]
        },
        musik: {
            text: "Cobalah cari playlist 'Binaural Beats Delta Waves' atau suara gemercik air hujan di YouTube/Spotify. Gelombang suaranya dirancang khusus buat nurunin frekuensi stres di sel otak kamu.",
            options: [{ text: "Okey, mau aku dengerin sekarang 🎧", next: "finish" }]
        },
        boxBreathing: {}, // Sesuai file asli
        solusiTugas: {
            text: "Kalau lagi burnout, jangan liat tugas sebagai satu gunung besar. Pecah jadi kepingan kecil. Bilang ke diri sendiri: 'Aku cuma mau baca satu paragraf aja/ngetik 2 kalimat aja hari ini.' Berani coba cara cicil super kecil ini?",
            options: [{ text: "Oke, dicoba pelan-pelan 🤏", next: "finish" }]
        },
        overthinking: {
            text: "Overthinking itu ibarat duduk di kursi goyang. Bikin kamu bergerak panik, tapi gak ngebawa kamu maju ke mana-mana. Apa sih skenario terburuk yang lagi muter terus di kepalamu? 🌪️",
            options: [
                { text: "Takut masa depan suram / takut gagal kuliah 📉", next: "gagal" },
                { text: "Terlalu mikirin penilaian atau omongan orang lain 🗣️", next: "omongan" }
            ]
        },
        gagal: {
            text: "Kegagalan itu bukan akhir dunia, melainkan cuma belokan jalan. IPK atau kecepatan lulus gak menentukan total harga diri kamu. Mau coba teknik mengurai ketakutan?",
            options: [{ text: "Gimana tuh caranya? 🔦", next: "brainDump" }]
        },
        brainDump: {
            text: "Gunakan teknik <b>Brain Dumping</b>. Ambil kertas, tulis semua hal yang bikin kamu takut. Terus coret hal-hal yang GAK BISA kamu kontrol (omongan orang, keputusan dosen) dan fokus ke hal yang BISA kamu kontrol (belajar 15 menit hari ini).",
            options: [{ text: "Sangat logis, mau aku praktekkin! ✍️", next: "finish" }]
        },
        omongan: {
            text: "Ingat ya, kamu gak punya kewajiban buat menuruti semua ekspektasi orang lain. Mereka gak menjalani harimu, mereka gak ngerasain capekmu. Batasi dirimu dari lingkungan toxic.",
            options: [{ text: "Benar juga, aku harus tegas 🛡️", next: "finish" }]
        },
        finish: {
            text: "Hari ini kamu udah hebat banget mau bertahan menghadapi badai di kepalamu. Gak usah buru-buru, jalani hari ini satu demi satu langkah saja ya. Aku selalu mendukungmu! 💜",
            options: [{ text: "Terima kasih, obrolan ini sangat menenangkan 😊", next: "restart" }]
        }
    },

    // ─── ALUR STRES TINGGI ───
    Tinggi: {
        start: {
            text: "Hei... Tarik napas dalam-dalam dulu yuk. Hasil analisis mendeteksi tingkat stresmu ada di kategori <b>Tinggi</b>. Tolong tahu satu hal ini: <b>Kamu aman di sini, kamu nggak sendirian, dan emosi hebat yang kamu rasain sekarang pasti akan berlalu.</b> Boleh aku temenin melewati momen berat ini? 💜",
            options: [
                { text: "Dada aku sesek / panik banget sekarang 😰", next: "grounding" },
                { text: "Pengen nangis / ngerasa hancur banget 😭", next: "nangis" },
                { text: "Aku butuh informasi bantuan profesional segera 🏥", next: "profesional" }
            ]
        },
        grounding: {
            text: "Oke, dengerin instruksiku ya. Kita pakai teknik <b>Grounding 5-4-3-2-1</b> buat bawa kesadaranmu kembali ke sini. Sekarang, sebutkan dalam hati <b>5 benda</b> di sekitarmu yang bisa kamu lihat dengan jelas. Sudah?",
            options: [{ text: "Udah, aku bisa lihat 5 benda 🔍", next: "grounding4" }]
        },
        grounding4: {
            text: "Bagus sekali. Sekarang, sebutkan <b>4 hal</b> di sekitarmu yang bisa kamu rasakan fisiknya secara nyata (misal: lantai yang dipijak, baju yang menyentuh kulit). Rasakan teksturnya pelan-pelan.",
            options: [{ text: "Udah, aku bisa merasakannya 👍", next: "grounding3" }]
        },
        grounding3: {
            text: "Hebat. Lanjut sebutkan <b>3 suara</b> yang terdengar di sekitarmu, lalu cari <b>2 aroma</b> di sekelilingmu, dan rasakan <b>1 rasa</b> di dalam lidahmu. Tarik napas... Gimana ritme jantungmu sekarang? Udah mendingan?",
            options: [
                { text: "Udah lumayan longgar & enakan 😮💨", next: "finish" },
                { text: "Masih ngerasa cemas mendalam 🥺", next: "profesional" }
            ]
        },
        nangis: {
            text: "Nangis aja, keluarin semuanya di sini. Menangis itu bukan tanda kamu lemah, itu cara biologis tubuh buat ngelepas racun kortisol stres yang udah kepenuhan di dadamu. Gak usah ditahan ya, aku bakal diem nemenin kamu di sini sampai reda.",
            options: [
                { text: "Udah agak redaan... makasih ya 🥺", next: "finish" },
                { text: "Aku ngerasa bener-bener mentok & putus asa 🚪", next: "mentok" }
            ]
        },
        mentok: {
            text: "Rasanya emang kaya gak ada jalan keluar ya saat ini. Tapi percayalah, itu cuma cara otakmu yang lagi kelelahan memandang masalah. Masalahmu valid, tapi menyerah bukan solusinya. Esok hari badainya pasti bakal beda. Janji ya mau bertahan demi dirimu?",
            options: [
                { text: "Aku janji mau bertahan demi masa depanku ✊", next: "finish" },
                { text: "Aku bingung harus cerita ke siapa lagi 👤", next: "profesional" }
            ]
        },
        profesional: {
            text: "Meminta bantuan itu bukan tanda kamu lemah, tapi tanda kalau kamu pejuang yang pemberani. Kamu bisa hubungi Unit Layanan Bimbingan Konseling/Psikologi Kampus. Rahasiamu dijamin aman dan tidak akan mempengaruhi nilai akademik sama sekali.",
            options: [{ text: "Iya, aku mau coba hubungi layanan kampus 📞", next: "finish" }]
        },
        finish: {
            text: "Kamu adalah pemenang karena berhasil melewati hari yang paling berat ini. Malam ini matikan laptopmu, lupakan tugas sejenak, istirahat total. Kamu sangat berharga bagi dunia ini! 💜🌟<br><br><b>Kontak Bantuan Darurat:</b> Hotline Kemenkes Peduli Jiwa (119 ext 8).",
            options: [{ text: "Terima kasih banyak StressCare. Aku pamit istirahat 💤", next: "restart" }]
        }
    }
};

// Fungsi Navigasi Halaman Utama Wizard
function moveStep(stepNumber) {
    document.querySelectorAll('.form-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById('section' + stepNumber).classList.add('active');
}

function goToStep2() { switchSubTab('beranda'); moveStep(2); }
function goToStep3() { moveStep(3); }

function goToStep4() {
    const nama = document.getElementById('identitasNama').value;
    const umur = document.getElementById('identitasUmur').value;
    const semester = document.getElementById('identitasSemester').value;
    
    if(!nama || !umur || !semester) {
        alert('Silakan lengkapi semua data identitas terlebih dahulu ya 😊');
        return;
    }
    moveStep(4);
    initCharCounter(); 
}

function initCharCounter() {
    const textarea = document.getElementById('curhatan');
    if (textarea) {
        textarea.removeEventListener('input', handleCharInput);
        textarea.addEventListener('input', handleCharInput);
    }
}

function handleCharInput() {
    const charCount = document.getElementById('charCount');
    if(charCount) charCount.innerText = this.value.length;
}

// ─── TAMPILAN KE-6: INISIALISASI ENGINE CHATBOT INTERAKTIF BERDASARKAN HASIL NAIVE BAYES ───
function goToStep6() {
    moveStep(6);
    
    if (!currentStressLevel || currentStressLevel === "") {
        currentStressLevel = "Sedang"; 
    }
    
    let levelKey = currentStressLevel;
    if (levelKey === "Rendah") levelKey = "Ringan";

    renderChatNode(levelKey, "start");
}

function renderChatNode(level, nodeKey) {
    const bubble = document.getElementById('botChatBubble');
    const optionsGrid = document.getElementById('chatOptionsGrid');
    
    if (!bubble || !optionsGrid) return;
    
    const nodeData = flowDatabase[level][nodeKey];
    
    bubble.innerHTML = nodeData.text;
    optionsGrid.innerHTML = "";
    
    nodeData.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = "btn-option-chat";
        btn.innerHTML = opt.text;
        
        btn.onclick = function() {
            if (opt.next === "restart") {
                kembaliKeBeranda();
            } else {
                renderChatNode(level, opt.next);
            }
        };
        optionsGrid.appendChild(btn);
    });
}

function goToStep7() { moveStep(7); }

function kembaliKeBeranda() {
    document.getElementById('identitasNama').value = "";
    document.getElementById('identitasUmur').value = "";
    document.getElementById('identitasSemester').value = "";
    document.getElementById('curhatan').value = "";
    if(document.getElementById('charCount')) {
        document.getElementById('charCount').innerText = "0";
    }
    currentStressLevel = "";
    moveStep(1);
}

// Event AJAX Form POST curhatan ke Backend Flask
document.getElementById('stressForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerHTML = 'Memproses Preprocessing & Naive Bayes... <i class="fa-solid fa-spinner fa-spin ms-1"></i>';
    
    const formData = new FormData();
    formData.append('curhatan', document.getElementById('curhatan').value);
    
    fetch('/predict', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
        const hasil = data.hasil_prediksi;
        currentStressLevel = hasil; 
        
        btn.disabled = false;
        btn.innerHTML = 'Analisis Tingkat Stres <i class="fa-solid fa-wand-magic-sparkles ms-1"></i>';
        
        moveStep(5);
        
        const emojiHasil = document.getElementById('emojiHasil');
        const textLevelStres = document.getElementById('textLevelStres');
        const deskripsiHasil = document.getElementById('deskripsiHasil');
        
        if(hasil === 'Rendah' || hasil === 'Ringan') {
            if(emojiHasil) emojiHasil.innerText = "🙂";
            if(textLevelStres) { textLevelStres.innerText = "Ringan"; textLevelStres.style.color = "#10b981"; }
            if(deskripsiHasil) deskripsiHasil.innerText = "Kondisi psikologis kamu saat ini berada dalam batas normal dan stabil. Pertahankan kebiasaan positifmu!";
        } else if(hasil === 'Sedang') {
            if(emojiHasil) emojiHasil.innerText = "😐";
            if(textLevelStres) { textLevelStres.innerText = "Sedang"; textLevelStres.style.color = "#f59e0b"; }
            if(deskripsiHasil) deskripsiHasil.innerText = "Kamu mungkin sedang merasakan tekanan yang cukup berarti. Penting untuk meluangkan waktu beristirahat.";
        } else if(hasil === 'Tinggi') {
            if(emojiHasil) emojiHasil.innerText = "😫";
            if(textLevelStres) { textLevelStres.innerText = "Tinggi"; textLevelStres.style.color = "#ef4444"; }
            if(deskripsiHasil) deskripsiHasil.innerText = "Sistem mendeteksi beban stres yang sangat tinggi. Sangat disarankan untuk beristirahat total atau konsultasi.";
        }

        renderRiwayatNyata(data.daftar_riwayat_nyata);
    });
});

// ─── BAGIAN PERBAIKAN: TOMBOL LIHAT DETAIL SUDAH DIHAPUS ───
function renderRiwayatNyata(daftarRiwayat) {
    const container = document.getElementById('daftarRiwayatContainer');
    if (!container) return;
    container.innerHTML = "";

    if (!daftarRiwayat || daftarRiwayat.length === 0) {
        container.innerHTML = `<div class="text-center text-muted small my-4">Belum ada riwayat analisis stres.</div>`;
        return;
    }

    daftarRiwayat.forEach(item => {
        let emoji = "😐"; let warnaTeks = "#f59e0b"; let namaLabel = "Sedang";
        if (item.hasil === 'Rendah' || item.hasil === 'Ringan') {
            emoji = "🙂"; warnaTeks = "#10b981"; namaLabel = "Ringan";
        } else if (item.hasil === 'Tinggi') {
            emoji = "😫"; warnaTeks = "#ef4444"; namaLabel = "Tinggi";
        }

        const cardHtml = `
            <div class="card p-3 border-1 border-light-subtle" style="border-radius: 18px;">
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div class="d-flex align-items-center gap-3">
                        <span style="font-size: 38px;">${emoji}</span>
                        <div>
                            <h6 style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 0;">
                                Tingkat Stres <span style="color: ${warnaTeks};">${namaLabel}</span>
                            </h6>
                            <span style="font-size: 11.5px; color: #94a3b8;">${item.waktu}</span>
                        </div>
                    </div>
                </div>
            </div>`;
        container.innerHTML += cardHtml;
    });
}

function hapusSemuaRiwayat() {
    if (confirm("Apakah kamu yakin ingin menghapus semua jejak riwayat cerita?")) {
        fetch('/clear_history', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                renderRiwayatNyata([]);
            }
        });
    }
}

function switchSubTab(targetTabName) {
    document.querySelectorAll('.subtab-content-item').forEach(content => content.classList.add('d-none'));
    document.querySelectorAll('.navbar-custom .nav-links a').forEach(link => link.classList.remove('active'));
    
    const activeContent = document.getElementById('subtab-' + targetTabName);
    if (activeContent) activeContent.classList.remove('d-none');
    
    const activeLink = document.getElementById('nav-' + targetTabName);
    if (activeLink) activeLink.classList.add('active');
}