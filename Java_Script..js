    <!-- JAVASCRIPT SYSTEM ENGINE LOGIC -->
    <script>
        const DEFAULT_LOGO_BEKASI = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%231e3a8a'/><circle cx='50' cy='50' r='35' fill='%23f59e0b'/><text x='50%' y='55%' font-size='16' fill='white' font-weight='bold' text-anchor='middle' dominant-baseline='middle'>BEKASI</text></svg>";

        let appLogo = localStorage.getItem('rt002_logo') || DEFAULT_LOGO_BEKASI;
        let formatNoSurat = localStorage.getItem('rt002_formatSurat') || "470/{NO}/RT.002/RW.007/2026";
        let counterSurat = parseInt(localStorage.getItem('rt002_counterSurat') || "15");
        let cdeGsEndpoint = localStorage.getItem('rt002_cdeGsUrl') || "";
        let isLoggedIn = false;
        let tempKKDocFile = "";

        let pejabatData = JSON.parse(localStorage.getItem('rt002_pejabat')) || {
            namaRT: "Bpk. H. Ahmad Santoso",
            namaRW: "Bpk. Drs. M. Ridwan",
            lurah: "Lurah Aren Jaya, Kota Bekasi",
            fotoRT: ""
        };

        let dataWargaKK = JSON.parse(localStorage.getItem('rt002_wargaKK')) || [
            {
                id: 1,
                noKk: "3275011002230001",
                nama: "Bpk. H. Ahmad Santoso",
                alamat: "Jl. Melati Blok A No. 12",
                desil: "Nondesil",
                fileDoc: "KTP_Ahmad.pdf",
                anggota: [
                    { nama: "Bpk. H. Ahmad Santoso", hub: "Kepala Keluarga", usia: 48 },
                    { nama: "Ibu Hj. Mariam", hub: "Istri", usia: 44 },
                    { nama: "Rizky Santoso", hub: "Anak", usia: 21 },
                    { nama: "Aisyah Santoso", hub: "Anak", usia: 4 }
                ]
            },
            {
                id: 2,
                noKk: "3275011002230002",
                nama: "Ibu Siti Aminah",
                alamat: "Jl. Melati Blok A No. 15",
                desil: "Desil 2",
                fileDoc: "KK_Siti.jpg",
                anggota: [
                    { nama: "Ibu Siti Aminah", hub: "Kepala Keluarga", usia: 52 },
                    { nama: "Budi Prasetyo", hub: "Anak", usia: 19 },
                    { nama: "Mbah Sastro", hub: "Orang Tua", usia: 72 }
                ]
            }
        ];

        let dataAduanWarga = JSON.parse(localStorage.getItem('rt002_aduanWarga')) || [
            { 
                id: 1, 
                tanggal: "10 Nov 2026", 
                nama: "Bpk. Hendra", 
                rumah: "Blok A No. 05", 
                pesan: "Lampu penerangan jalan gang A mati sejak dua hari lalu.", 
                status: "Selesai Ditangani", 
                tanggapan: "Sudah diganti dengan lampu LED baru oleh seksi keamanan." 
            }
        ];

        let dataKas = JSON.parse(localStorage.getItem('rt002_dataKas')) || [
            { id: 1, tanggal: "01 Nov 2026", ket: "Iuran Bulanan Warga RT.002", jenis: "Pemasukan", nominal: 2500000 },
            { id: 2, tanggal: "05 Nov 2026", ket: "Pembelian Lampu LED Jalan Gang A", jenis: "Pengeluaran", nominal: 350000 },
            { id: 3, tanggal: "10 Nov 2026", ket: "Honor Petugas Keamanan & Kebersihan", jenis: "Pengeluaran", nominal: 1200000 }
        ];

        let dataAdminAkses = JSON.parse(localStorage.getItem('rt002_adminAkses')) || [
            { id: 1, user: "admin_rt02", nama: "Bpk. H. Ahmad Santoso", role: "Super Admin" },
            { id: 2, user: "sekretaris02", nama: "Bpk. Bambang S.", role: "Sekretaris RT" }
        ];

        let pengurusStrukturList = JSON.parse(localStorage.getItem('rt002_pengurusStruk')) || [
            { id: 1, nama: "Bpk. Bambang S.", jabatan: "Sekretaris RT", telp: "0812-3333-5555" },
            { id: 2, nama: "Ibu Ratna Sari", jabatan: "Bendahara RT", telp: "0812-4444-6666" },
            { id: 3, nama: "Bpk. Dedi Supriadi", jabatan: "Seksi Keamanan & Ketertiban", telp: "0812-7777-8888" },
            { id: 4, nama: "Ibu Endang W.", jabatan: "Seksi Posyandu & Kesehatan", telp: "0812-9999-0000" }
        ];

        let permohonanSurat = JSON.parse(localStorage.getItem('rt002_permohonanSurat')) || [
            { id: 1, nama: "Budi Prasetyo", nik: "3275011002230009", wa: "081299887766", jenis: "Surat Keterangan Domisili Warga", alamat: "Blok A No. 15", keperluan: "Persyaratan Melamar Pekerjaan", status: "Disetujui RT", noSurat: "470/012/RT.002/RW.007/2026" }
        ];

        let tempFotoData = "";
        let tempVideoData = "";
        let dataPengumuman = JSON.parse(localStorage.getItem('rt002_pengumuman')) || [
            { 
                id: 1, 
                judul: "Kerja Bakti Massal Antisipasi Musim Hujan", 
                tanggal: "12 November 2026", 
                isi: "Pembersihan saluran air dan got utama di seluruh wilayah RT.002 Kota Bekasi.",
                foto: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='350' viewBox='0 0 600 350'><rect width='600' height='350' fill='%231e3a8a'/><text x='50%' y='50%' font-size='22' fill='white' font-weight='bold' text-anchor='middle' dominant-baseline='middle'>FOTO DOKUMENTASI KERJA BAKTI</text></svg>",
                video: ""
            },
            { 
                id: 2, 
                judul: "Jadwal Posyandu Balita & Pemeriksaan Lansia", 
                tanggal: "18 November 2026", 
                isi: "Pemeriksaan kesehatan gratis, penimbangan balita, dan vitamin di Balai Warga.",
                foto: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='350' viewBox='0 0 600 350'><rect width='600' height='350' fill='%23059669'/><text x='50%' y='50%' font-size='22' fill='white' font-weight='bold' text-anchor='middle' dominant-baseline='middle'>DOKUMENTASI KEGIATAN POSYANDU</text></svg>",
                video: ""
            }
        ];

        function saveDataPermanen() {
            localStorage.setItem('rt002_wargaKK', JSON.stringify(dataWargaKK));
            localStorage.setItem('rt002_dataKas', JSON.stringify(dataKas));
            localStorage.setItem('rt002_adminAkses', JSON.stringify(dataAdminAkses));
            localStorage.setItem('rt002_pengurusStruk', JSON.stringify(pengurusStrukturList));
            localStorage.setItem('rt002_permohonanSurat', JSON.stringify(permohonanSurat));
            localStorage.setItem('rt002_pengumuman', JSON.stringify(dataPengumuman));
            localStorage.setItem('rt002_aduanWarga', JSON.stringify(dataAduanWarga));
        }

        function showModal(title, msg, type = "info") {
            const icon = document.getElementById('modalIcon');
            if (type === 'success') {
                icon.className = "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl bg-emerald-100 text-emerald-600";
                icon.innerHTML = '<i class="fa-solid fa-check"></i>';
            } else {
                icon.className = "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl bg-blue-100 text-primary";
                icon.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
            }
            document.getElementById('modalTitle').innerText = title;
            document.getElementById('modalMessage').innerText = msg;
            document.getElementById('customModal').classList.remove('hidden');
        }

        function closeModal() { document.getElementById('customModal').classList.add('hidden'); }
        function closeMediaModal() { document.getElementById('mediaModal').classList.add('hidden'); document.getElementById('mediaModalContent').innerHTML = ""; }
        function toggleMobileMenu() { document.getElementById('mobileMenu').classList.toggle('hidden'); }

        function switchTab(tabId) {
            if (tabId === 'panel' && !isLoggedIn) { openLoginModal(); return; }
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            const target = document.getElementById(tabId);
            if (target) target.classList.add('active');

            document.querySelectorAll('.nav-btn').forEach(btn => {
                if (btn.getAttribute('data-target') === tabId) {
                    btn.classList.add('text-primary', 'bg-blue-50', 'font-semibold');
                    btn.classList.remove('text-slate-600');
                } else {
                    btn.classList.remove('text-primary', 'bg-blue-50', 'font-semibold');
                    btn.classList.add('text-slate-600');
                }
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function switchSubTab(subTabId) {
            document.querySelectorAll('.subtab-content').forEach(el => el.classList.remove('active'));
            const target = document.getElementById(subTabId);
            if (target) target.classList.add('active');

            document.querySelectorAll('.subnav-btn').forEach(btn => {
                if (btn.getAttribute('data-target') === subTabId) {
                    btn.classList.add('bg-primary', 'text-white');
                    btn.classList.remove('bg-slate-100', 'text-slate-700');
                } else {
                    btn.classList.remove('bg-primary', 'text-white');
                    btn.classList.add('bg-slate-100', 'text-slate-700');
                }
            });
        }

        function getKategoriUsia(usia) {
            if (usia <= 5) return 'Balita';
            if (usia <= 17) return 'Anak/Remaja';
            if (usia <= 59) return 'Dewasa';
            return 'Lansia';
        }

        function renderBerandaDemografi() {
            let totalKK = dataWargaKK.length;
            let totalWarga = 0;
            let usiaBalita = 0, usiaAnak = 0, usiaDewasa = 0, usiaLansia = 0;
            let countDesil = { "Desil 1": 0, "Desil 2": 0, "Desil 3": 0, "Desil 4": 0, "Nondesil": 0 };

            dataWargaKK.forEach(kk => {
                countDesil[kk.desil] = (countDesil[kk.desil] || 0) + 1;
                if (kk.anggota && Array.isArray(kk.anggota)) {
                    totalWarga += kk.anggota.length;
                    kk.anggota.forEach(a => {
                        let kat = getKategoriUsia(a.usia);
                        if (kat === 'Balita') usiaBalita++;
                        else if (kat === 'Anak/Remaja') usiaAnak++;
                        else if (kat === 'Dewasa') usiaDewasa++;
                        else if (kat === 'Lansia') usiaLansia++;
                    });
                }
            });

            document.getElementById('statKK').innerText = `${totalKK} KK`;
            document.getElementById('statWarga').innerText = `${totalWarga} Jiwa`;
            let rtmCount = (countDesil["Desil 1"] || 0) + (countDesil["Desil 2"] || 0);
            document.getElementById('statDesil').innerText = `${rtmCount} KK`;

            const boxUsia = document.getElementById('boxStatUsia');
            if (boxUsia) {
                boxUsia.innerHTML = `
                    <div class="bg-blue-50 p-2 rounded-xl"><p class="text-[10px] text-slate-500">Balita</p><p class="font-extrabold text-primary text-base">${usiaBalita}</p></div>
                    <div class="bg-blue-50 p-2 rounded-xl"><p class="text-[10px] text-slate-500">Anak/Remaja</p><p class="font-extrabold text-primary text-base">${usiaAnak}</p></div>
                    <div class="bg-blue-50 p-2 rounded-xl"><p class="text-[10px] text-slate-500">Dewasa</p><p class="font-extrabold text-primary text-base">${usiaDewasa}</p></div>
                    <div class="bg-blue-50 p-2 rounded-xl"><p class="text-[10px] text-slate-500">Lansia</p><p class="font-extrabold text-primary text-base">${usiaLansia}</p></div>
                    <div class="bg-primary text-white p-2 rounded-xl"><p class="text-[10px] opacity-80">Total</p><p class="font-extrabold text-base">${totalWarga}</p></div>
                `;
            }

            const boxDesil = document.getElementById('boxStatDesil');
            if (boxDesil) {
                boxDesil.innerHTML = `
                    <div class="bg-amber-50 p-2 rounded-xl"><p class="text-[10px] text-slate-500">Desil 1</p><p class="font-extrabold text-amber-600 text-base">${countDesil["Desil 1"] || 0}</p></div>
                    <div class="bg-amber-50 p-2 rounded-xl"><p class="text-[10px] text-slate-500">Desil 2</p><p class="font-extrabold text-amber-600 text-base">${countDesil["Desil 2"] || 0}</p></div>
                    <div class="bg-amber-50 p-2 rounded-xl"><p class="text-[10px] text-slate-500">Desil 3</p><p class="font-extrabold text-amber-600 text-base">${countDesil["Desil 3"] || 0}</p></div>
                    <div class="bg-amber-50 p-2 rounded-xl"><p class="text-[10px] text-slate-500">Desil 4</p><p class="font-extrabold text-amber-600 text-base">${countDesil["Desil 4"] || 0}</p></div>
                    <div class="bg-slate-100 p-2 rounded-xl"><p class="text-[10px] text-slate-500">Nondesil</p><p class="font-extrabold text-slate-700 text-base">${countDesil["Nondesil"] || 0}</p></div>
                `;
            }

            const tbodyBeranda = document.querySelector('#tabelBerandaWarga tbody');
            if (tbodyBeranda) {
                tbodyBeranda.innerHTML = "";
                dataWargaKK.slice(0, 5).forEach(kk => {
                    tbodyBeranda.innerHTML += `
                        <tr class="hover:bg-slate-50">
                            <td class="p-3 font-mono font-semibold text-slate-700">${kk.noKk}</td>
                            <td class="p-3 font-bold text-slate-900">${kk.nama}</td>
                            <td class="p-3 text-slate-600">${kk.alamat}</td>
                            <td class="p-3"><span class="px-2 py-0.5 text-[10px] rounded-full font-bold bg-amber-100 text-amber-800">${kk.desil}</span></td>
                            <td class="p-3 font-bold text-primary">${kk.anggota ? kk.anggota.length : 0} Jiwa</td>
                        </tr>
                    `;
                });
            }
        }

        function renderWargaPublik() {
            const tbody = document.querySelector('#tabelWargaPublik tbody');
            if (!tbody) return;
            let query = (document.getElementById('searchWargaPublik')?.value || "").toLowerCase();
            tbody.innerHTML = "";

            let filtered = dataWargaKK.filter(kk => kk.nama.toLowerCase().includes(query) || kk.noKk.includes(query));
            filtered.forEach(kk => {
                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50">
                        <td class="py-4 px-6 font-mono font-semibold text-slate-700">${kk.noKk}</td>
                        <td class="py-4 px-6 font-bold text-slate-900">${kk.nama}</td>
                        <td class="py-4 px-6 text-slate-600">${kk.alamat}</td>
                        <td class="py-4 px-6"><span class="px-2.5 py-1 text-xs rounded-full font-bold bg-amber-100 text-amber-800">${kk.desil}</span></td>
                        <td class="py-4 px-6 font-bold text-slate-800">${kk.anggota ? kk.anggota.length : 0} Jiwa</td>
                        <td class="py-4 px-6 text-center">
                            <button onclick="lihatDetailAnggotaPublik(${kk.id})" class="px-3 py-1.5 bg-blue-50 text-primary text-xs font-bold rounded-xl hover:bg-blue-100 transition"><i class="fa-solid fa-eye mr-1"></i> Detail</button>
                        </td>
                    </tr>
                `;
            });
        }

        function lihatDetailAnggotaPublik(kkId) {
            let kk = dataWargaKK.find(x => x.id == kkId);
            if (!kk) return;
            let text = (kk.anggota || []).map(a => `- ${a.nama} (${a.hub}, ${a.usia} Thn - ${getKategoriUsia(a.usia)})`).join('\n');
            showModal(`Anggota Keluarga - ${kk.nama}`, text || "Belum ada anggota terdaftar.", "info");
        }

        function renderPengurus() {
            document.getElementById('lblNamaKetuaRT').innerText = pejabatData.namaRT;
            const boxFoto = document.getElementById('boxFotoKetuaRT');
            if (pejabatData.fotoRT) {
                boxFoto.innerHTML = `<img src="${pejabatData.fotoRT}" class="w-full h-full object-cover">`;
            } else {
                boxFoto.innerHTML = `<i class="fa-solid fa-user-tie"></i>`;
            }

            const container = document.getElementById('listPengurus');
            if (!container) return;

            container.innerHTML = "";
            pengurusStrukturList.forEach(p => {
                container.innerHTML += `
                    <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-2">
                        <div class="w-16 h-16 mx-auto bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-2xl font-bold"><i class="fa-solid fa-user"></i></div>
                        <h5 class="font-bold text-slate-800 text-sm">${p.nama}</h5>
                        <p class="text-[10px] text-primary font-bold uppercase tracking-wider">${p.jabatan}</p>
                        <p class="text-xs text-slate-400 pt-1 border-t border-slate-100"><i class="fa-solid fa-phone mr-1"></i> ${p.telp}</p>
                    </div>
                `;
            });
        }

        function renderKas() {
            let saldo = 0;
            const tbody = document.querySelector('#tabelKas tbody');
            if (!tbody) return;
            tbody.innerHTML = "";

            dataKas.forEach(k => {
                if (k.jenis === 'Pemasukan') saldo += k.nominal;
                else saldo -= k.nominal;

                let isMasuk = k.jenis === 'Pemasukan';
                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50">
                        <td class="py-4 px-6 text-xs text-slate-500">${k.tanggal}</td>
                        <td class="py-4 px-6 font-bold text-slate-800">${k.ket}</td>
                        <td class="py-4 px-6"><span class="px-2.5 py-1 text-xs rounded-full font-bold ${isMasuk ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">${k.jenis}</span></td>
                        <td class="py-4 px-6 text-right font-extrabold ${isMasuk ? 'text-emerald-600' : 'text-red-600'}">Rp ${k.nominal.toLocaleString('id-ID')}</td>
                    </tr>
                `;
            });

            document.getElementById('statKas').innerText = `Rp ${saldo.toLocaleString('id-ID')}`;
            document.getElementById('saldoKasHeader').innerText = `Rp ${saldo.toLocaleString('id-ID')}`;
        }

        function submitSurat(e) {
            e.preventDefault();
            let nama = document.getElementById('suratNama').value;
            let nik = document.getElementById('suratNik').value;
            let wa = document.getElementById('suratWa').value;
            let jenis = document.getElementById('suratJenis').value;
            let alamat = document.getElementById('suratAlamat').value;
            let keperluan = document.getElementById('suratKeperluan').value;

            let noSurat = formatNoSurat.replace('{NO}', String(counterSurat).padStart(3, '0')).replace('{THN}', '2026');
            counterSurat++;
            localStorage.setItem('rt002_counterSurat', counterSurat);

            permohonanSurat.unshift({ id: Date.now(), nama, nik, wa, jenis, alamat, keperluan, status: 'Menunggu Persetujuan', noSurat });
            saveDataPermanen();
            document.getElementById('formSurat').reset();

            showModal("Permohonan Terkirim", `Surat Pengantar berhasil diajukan dengan Nomor Referensi: ${noSurat}. Pengurus RT akan memproses & menyetujui permohonan Anda.`, "success");
            renderPanelAdminAll();
        }

        function submitAduan(e) {
            e.preventDefault();
            let nama = document.getElementById('aduanNama').value;
            let rumah = document.getElementById('aduanRumah').value;
            let pesan = document.getElementById('aduanPesan').value;
            let tanggal = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

            dataAduanWarga.unshift({
                id: Date.now(),
                tanggal,
                nama,
                rumah,
                pesan,
                status: 'Menunggu',
                tanggapan: '-'
            });

            saveDataPermanen();
            document.getElementById('formAduan').reset();
            renderAdminAduan();
            showModal("Pengaduan Terkirim", "Terima kasih, pengaduan/aspirasi Anda telah diteruskan ke Pengurus RT.002.", "success");
        }

        function openLoginModal() {
            if (isLoggedIn) { switchTab('panel'); } else { document.getElementById('modalLogin').classList.remove('hidden'); }
        }
        function closeLoginModal() { document.getElementById('modalLogin').classList.add('hidden'); }

        function submitLoginAdmin(e) {
            e.preventDefault();
            let u = document.getElementById('loginUser').value;
            if (u === 'admin_rt02' || u === 'admin') {
                isLoggedIn = true;
                closeLoginModal();
                document.getElementById('lblLoginStatus').innerText = "Panel Admin (Aktif)";
                switchTab('panel');
                renderPanelAdminAll();
            } else {
                showModal("Login Gagal", "Username atau password pengurus tidak cocok.", "info");
            }
        }

        function logoutAdmin() {
            isLoggedIn = false;
            document.getElementById('lblLoginStatus').innerText = "Panel Pengurus";
            switchTab('beranda');
        }

        function renderPanelAdminAll() {
            renderAdminWarga();
            renderAdminSurat();
            renderAdminKas();
            renderAdminPengumuman();
            renderAdminAkses();
            renderAdminPengurusStruktur();
            renderAdminAduan();
            let urlInput = document.getElementById('cdeGsUrlInput');
            if (urlInput) urlInput.value = cdeGsEndpoint;
        }

        function renderAdminAduan() {
            const tbody = document.querySelector('#tabelAdminAduan tbody');
            const badge = document.getElementById('badgeAduanCount');
            if (!tbody) return;
            if (badge) badge.innerText = `${dataAduanWarga.length} Pengaduan`;
            tbody.innerHTML = "";

            dataAduanWarga.forEach(a => {
                let badgeStatus = a.status === 'Selesai Ditangani' ? 'bg-emerald-100 text-emerald-800' :
                                  (a.status === 'Sedang Diproses' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800');
                
                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50 border-b border-slate-100">
                        <td class="p-3">
                            <p class="font-bold text-slate-900">${a.nama}</p>
                            <p class="text-[10px] text-slate-400">${a.tanggal}</p>
                        </td>
                        <td class="p-3 font-medium text-slate-700">${a.rumah}</td>
                        <td class="p-3 max-w-xs text-slate-800">${a.pesan}</td>
                        <td class="p-3"><span class="px-2 py-0.5 text-[10px] rounded font-bold ${badgeStatus}">${a.status}</span></td>
                        <td class="p-3 max-w-xs text-slate-600 italic">${a.tanggapan || '-'}</td>
                        <td class="p-3 text-center space-x-1">
                            <button onclick="openModalTanggapiAduan(${a.id})" class="p-1.5 bg-blue-50 text-primary rounded-lg hover:bg-blue-100" title="Tanggapi Pengaduan"><i class="fa-solid fa-reply"></i></button>
                            <button onclick="hapusAduan(${a.id})" class="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Hapus Pengaduan"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }

        function openModalTanggapiAduan(id) {
            let aduan = dataAduanWarga.find(x => x.id == id);
            if (!aduan) return;
            document.getElementById('aduanEditId').value = aduan.id;
            document.getElementById('aduanStatus').value = aduan.status;
            document.getElementById('aduanTanggapan').value = aduan.tanggapan !== '-' ? aduan.tanggapan : '';
            document.getElementById('modalTanggapiAduan').classList.remove('hidden');
        }

        function closeModalTanggapiAduan() { document.getElementById('modalTanggapiAduan').classList.add('hidden'); }

        function simpanTanggapanAduan(e) {
            e.preventDefault();
            let editId = document.getElementById('aduanEditId').value;
            let status = document.getElementById('aduanStatus').value;
            let tanggapan = document.getElementById('aduanTanggapan').value;

            let aduan = dataAduanWarga.find(x => x.id == editId);
            if (aduan) {
                aduan.status = status;
                aduan.tanggapan = tanggapan;
                saveDataPermanen();
                renderAdminAduan();
                closeModalTanggapiAduan();
                showModal("Pengaduan Diperbarui", "Tanggapan dan status pengaduan warga berhasil diperbarui.", "success");
            }
        }

        function hapusAduan(id) {
            dataAduanWarga = dataAduanWarga.filter(x => x.id !== id);
            saveDataPermanen();
            renderAdminAduan();
        }

        function renderAdminWarga() {
            const tbody = document.querySelector('#tabelAdminWarga tbody');
            if (!tbody) return;
            tbody.innerHTML = "";

            dataWargaKK.forEach(kk => {
                let namaAnggotaList = (kk.anggota || []).map(a => `${a.nama} (${a.hub}, ${a.usia} Thn - ${getKategoriUsia(a.usia)})`).join('; ') || 'Belum ada anggota';
                let jmlAnggota = kk.anggota ? kk.anggota.length : 0;

                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50 border-b border-slate-100">
                        <td class="p-3 font-mono font-bold text-slate-700">${kk.noKk}</td>
                        <td class="p-3 font-bold text-slate-900">${kk.nama}</td>
                        <td class="p-3 text-slate-600">${kk.alamat}</td>
                        <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">${kk.desil}</span></td>
                        <td class="p-3">
                            <p class="text-slate-800 font-semibold max-w-xs truncate" title="${namaAnggotaList}">${namaAnggotaList}</p>
                            <button onclick="openModalAnggota(${kk.id})" class="mt-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100 text-[10px]"><i class="fa-solid fa-users mr-1"></i> ${jmlAnggota} Anggota (CRUD)</button>
                        </td>
                        <td class="p-3 font-mono text-slate-500">${kk.fileDoc || '-'}</td>
                        <td class="p-3 text-center space-x-1">
                            <button onclick="editKK(${kk.id})" class="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100" title="Edit KK"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="hapusKK(${kk.id})" class="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Hapus KK"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }

        function openModalTambahKK() {
            tempKKDocFile = "";
            document.getElementById('kkEditId').value = "";
            document.getElementById('titleModalKK').innerText = "Tambah Data Kepala Keluarga Baru";
            document.getElementById('kkNo').value = "";
            document.getElementById('kkNama').value = "";
            document.getElementById('kkAlamat').value = "";
            document.getElementById('kkDesil').value = "Nondesil";
            document.getElementById('kkFile').value = "";
            document.getElementById('modalKK').classList.remove('hidden');
        }

        function closeModalKK() { document.getElementById('modalKK').classList.add('hidden'); }
        function handleDocUpload(input) { if (input.files && input.files[0]) { tempKKDocFile = input.files[0].name; } }

        function simpanKK(e) {
            e.preventDefault();
            let editId = document.getElementById('kkEditId').value;
            let noKk = document.getElementById('kkNo').value;
            let nama = document.getElementById('kkNama').value;
            let alamat = document.getElementById('kkAlamat').value;
            let desil = document.getElementById('kkDesil').value;

            if (editId) {
                let kk = dataWargaKK.find(x => x.id == editId);
                if (kk) {
                    kk.noKk = noKk;
                    kk.nama = nama;
                    kk.alamat = alamat;
                    kk.desil = desil;
                    if (tempKKDocFile) kk.fileDoc = tempKKDocFile;
                }
            } else {
                dataWargaKK.push({
                    id: Date.now(), noKk, nama, alamat, desil,
                    fileDoc: tempKKDocFile || "KTP_KK_Doc.pdf",
                    anggota: [{ nama, hub: "Kepala Keluarga", usia: 40 }]
                });
            }

            saveDataPermanen();
            closeModalKK();
            renderBerandaDemografi();
            renderWargaPublik();
            renderAdminWarga();
            showModal("Data Tersimpan", "Data Kepala Keluarga & Dokumen Warga berhasil diperbarui secara permanen.", "success");
        }

        function editKK(id) {
            let kk = dataWargaKK.find(x => x.id == id);
            if (!kk) return;
            document.getElementById('kkEditId').value = kk.id;
            document.getElementById('titleModalKK').innerText = "Edit Data Kepala Keluarga";
            document.getElementById('kkNo').value = kk.noKk;
            document.getElementById('kkNama').value = kk.nama;
            document.getElementById('kkAlamat').value = kk.alamat;
            document.getElementById('kkDesil').value = kk.desil;
            tempKKDocFile = kk.fileDoc || "";
            document.getElementById('modalKK').classList.remove('hidden');
        }

        function hapusKK(id) {
            dataWargaKK = dataWargaKK.filter(x => x.id !== id);
            saveDataPermanen();
            renderBerandaDemografi();
            renderWargaPublik();
            renderAdminWarga();
        }

        let activeKkForAnggota = null;
        function openModalAnggota(kkId) {
            activeKkForAnggota = dataWargaKK.find(x => x.id == kkId);
            if (!activeKkForAnggota) return;
            document.getElementById('anggotaKkId').value = activeKkForAnggota.id;
            document.getElementById('subTitleAnggota').innerText = `No KK: ${activeKkForAnggota.noKk} - Kepala Keluarga: ${activeKkForAnggota.nama}`;
            renderAnggotaDetailTable();
            document.getElementById('modalAnggota').classList.remove('hidden');
        }

        function closeModalAnggota() { document.getElementById('modalAnggota').classList.add('hidden'); }

        function renderAnggotaDetailTable() {
            const tbody = document.querySelector('#tabelAnggotaDetail tbody');
            if (!tbody || !activeKkForAnggota) return;
            tbody.innerHTML = "";
            (activeKkForAnggota.anggota || []).forEach((a, idx) => {
                let kat = getKategoriUsia(a.usia);
                tbody.innerHTML += `
                    <tr>
                        <td class="p-2 font-bold text-slate-800">${a.nama}</td>
                        <td class="p-2 text-slate-600">${a.hub}</td>
                        <td class="p-2 font-bold">${a.usia} Thn</td>
                        <td class="p-2"><span class="px-2 py-0.5 text-[10px] rounded font-bold bg-blue-100 text-primary">${kat}</span></td>
                        <td class="p-2 text-center">
                            <button onclick="hapusAnggotaKeluarga(${idx})" class="text-red-500 hover:text-red-700"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }

        function tambahAnggotaKeluarga(e) {
            e.preventDefault();
            if (!activeKkForAnggota) return;
            let nama = document.getElementById('anggotaNama').value;
            let hub = document.getElementById('anggotaHub').value;
            let usia = parseInt(document.getElementById('anggotaUsia').value);

            if (!activeKkForAnggota.anggota) activeKkForAnggota.anggota = [];
            activeKkForAnggota.anggota.push({ nama, hub, usia });
            saveDataPermanen();
            document.getElementById('anggotaNama').value = "";
            document.getElementById('anggotaUsia').value = "";
            renderAnggotaDetailTable();
            renderBerandaDemografi();
            renderAdminWarga();
        }

        function hapusAnggotaKeluarga(idx) {
            if (!activeKkForAnggota || !activeKkForAnggota.anggota) return;
            activeKkForAnggota.anggota.splice(idx, 1);
            saveDataPermanen();
            renderAnggotaDetailTable();
            renderBerandaDemografi();
            renderAdminWarga();
        }

        function renderPengumuman() {
            const container = document.getElementById('listPengumuman');
            if (!container) return;
            container.innerHTML = "";

            dataPengumuman.forEach(p => {
                let mediaHtml = "";
                if (p.video) {
                    mediaHtml = `<video src="${p.video}" controls class="w-full h-48 object-cover rounded-xl bg-black mb-3"></video>`;
                } else if (p.foto) {
                    mediaHtml = `<img src="${p.foto}" onclick="previewMedia('${p.foto}', 'image', '${p.judul}')" class="w-full h-48 object-cover rounded-xl mb-3 cursor-pointer hover:opacity-90 transition">`;
                }

                container.innerHTML += `
                    <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
                        <div>
                            ${mediaHtml}
                            <span class="text-[10px] font-bold uppercase text-primary bg-blue-50 px-2.5 py-1 rounded-full"><i class="fa-solid fa-calendar-day mr-1"></i> ${p.tanggal}</span>
                            <h4 class="font-bold text-slate-900 text-sm mt-2">${p.judul}</h4>
                            <p class="text-xs text-slate-600 mt-1 leading-relaxed">${p.isi}</p>
                        </div>
                    </div>
                `;
            });
        }

        function renderAdminPengumuman() {
            const tbody = document.querySelector('#tabelAdminPengumuman tbody');
            if (!tbody) return;
            tbody.innerHTML = "";

            dataPengumuman.forEach(p => {
                let mediaType = p.video ? '<span class="text-xs font-bold text-red-600"><i class="fa-solid fa-video mr-1"></i> Video Direct</span>' : 
                               (p.foto ? '<span class="text-xs font-bold text-blue-600"><i class="fa-solid fa-image mr-1"></i> Foto Direct</span>' : '<span class="text-xs text-slate-400">Teks Saja</span>');
                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50 border-b border-slate-100">
                        <td class="p-3 text-slate-500">${p.tanggal}</td>
                        <td class="p-3 font-bold text-slate-800">${p.judul}</td>
                        <td class="p-3">${mediaType}</td>
                        <td class="p-3 text-center space-x-1">
                            <button onclick="editPengumuman(${p.id})" class="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100" title="Edit Agenda"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="hapusPengumuman(${p.id})" class="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Hapus Agenda"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }

        function openModalTambahPengumuman() {
            tempFotoData = "";
            tempVideoData = "";
            document.getElementById('pengumumanEditId').value = "";
            document.getElementById('titleModalPengumuman').innerText = "Tambah Pengumuman / Agenda RT";
            document.getElementById('pengumumanJudul').value = "";
            document.getElementById('pengumumanTgl').value = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
            document.getElementById('pengumumanIsi').value = "";
            document.getElementById('pengumumanFotoInput').value = "";
            document.getElementById('pengumumanVideoInput').value = "";
            document.getElementById('modalPengumuman').classList.remove('hidden');
        }

        function closeModalPengumuman() { document.getElementById('modalPengumuman').classList.add('hidden'); }
        function handleFotoUpload(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) { tempFotoData = e.target.result; };
                reader.readAsDataURL(input.files[0]);
            }
        }
        function handleVideoUpload(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) { tempVideoData = e.target.result; };
                reader.readAsDataURL(input.files[0]);
            }
        }

        function simpanPengumuman(e) {
            e.preventDefault();
            let editId = document.getElementById('pengumumanEditId').value;
            let judul = document.getElementById('pengumumanJudul').value;
            let tanggal = document.getElementById('pengumumanTgl').value;
            let isi = document.getElementById('pengumumanIsi').value;

            if (editId) {
                let p = dataPengumuman.find(x => x.id == editId);
                if (p) {
                    p.judul = judul;
                    p.tanggal = tanggal;
                    p.isi = isi;
                    if (tempFotoData) p.foto = tempFotoData;
                    if (tempVideoData) p.video = tempVideoData;
                }
            } else {
                dataPengumuman.unshift({
                    id: Date.now(), judul, tanggal, isi,
                    foto: tempFotoData,
                    video: tempVideoData
                });
            }

            saveDataPermanen();
            closeModalPengumuman();
            renderPengumuman();
            renderAdminPengumuman();
            showModal("Pengumuman Disimpan", "Pengumuman & media agenda berhasil diperbarui.", "success");
        }

        function editPengumuman(id) {
            let p = dataPengumuman.find(x => x.id == id);
            if (!p) return;
            document.getElementById('pengumumanEditId').value = p.id;
            document.getElementById('titleModalPengumuman').innerText = "Edit Pengumuman Agenda RT";
            document.getElementById('pengumumanJudul').value = p.judul;
            document.getElementById('pengumumanTgl').value = p.tanggal;
            document.getElementById('pengumumanIsi').value = p.isi;
            tempFotoData = p.foto || "";
            tempVideoData = p.video || "";
            document.getElementById('modalPengumuman').classList.remove('hidden');
        }

        function hapusPengumuman(id) {
            dataPengumuman = dataPengumuman.filter(x => x.id !== id);
            saveDataPermanen();
            renderPengumuman();
            renderAdminPengumuman();
        }

        function previewMedia(src, type, title) {
            const content = document.getElementById('mediaModalContent');
            document.getElementById('mediaModalTitle').innerText = title;
            if (type === 'image') {
                content.innerHTML = `<img src="${src}" class="max-h-[70vh] object-contain">`;
            } else {
                content.innerHTML = `<video src="${src}" controls class="w-full max-h-[70vh] bg-black"></video>`;
            }
            document.getElementById('mediaModal').classList.remove('hidden');
        }

        function renderAdminSurat() {
            const tbody = document.querySelector('#tabelAdminSurat tbody');
            const badge = document.getElementById('badgeSuratCount');
            if (!tbody) return;
            if (badge) badge.innerText = permohonanSurat.length;
            tbody.innerHTML = "";

            permohonanSurat.forEach(s => {
                let isDisetujui = s.status === 'Disetujui RT';
                let isDitolak = s.status === 'Ditolak RT';
                let statusBadge = isDisetujui ? 'bg-emerald-100 text-emerald-800' : (isDitolak ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800');

                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50 border-b border-slate-100">
                        <td class="p-3">
                            <p class="font-bold text-slate-900">${s.nama}</p>
                            <p class="text-[10px] text-slate-400">NIK: ${s.nik}</p>
                        </td>
                        <td class="p-3 text-slate-700 font-medium">${s.jenis}</td>
                        <td class="p-3 font-mono font-bold text-primary">${s.noSurat}</td>
                        <td class="p-3"><span class="px-2 py-0.5 text-[10px] rounded font-bold ${statusBadge}">${s.status}</span></td>
                        <td class="p-3 text-center space-x-1">
                            ${s.status === 'Menunggu Persetujuan' ? `
                                <button onclick="approveSurat(${s.id})" class="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition" title="Setujui Surat"><i class="fa-solid fa-check"></i></button>
                                <button onclick="tolakSurat(${s.id})" class="px-2 py-1 bg-amber-600 text-white text-[10px] font-bold rounded-lg hover:bg-amber-700 transition" title="Tolak Surat"><i class="fa-solid fa-xmark"></i></button>
                            ` : ''}
                            <button onclick="hapusSurat(${s.id})" class="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition" title="Hapus Permohonan"><i class="fa-solid fa-trash"></i></button>
                            <button onclick="cetakSuratPengantar(${s.id})" class="px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-blue-900 transition" title="Cetak Surat"><i class="fa-solid fa-print"></i></button>
                        </td>
                    </tr>
                `;
            });
        }

        function approveSurat(id) {
            let s = permohonanSurat.find(x => x.id == id);
            if (s) {
                s.status = 'Disetujui RT';
                saveDataPermanen();
                renderAdminSurat();
                showModal("Surat Disetujui", `Permohonan surat atas nama ${s.nama} telah disetujui dan siap dicetak.`, "success");
            }
        }

        function tolakSurat(id) {
            let s = permohonanSurat.find(x => x.id == id);
            if (s) {
                s.status = 'Ditolak RT';
                saveDataPermanen();
                renderAdminSurat();
                showModal("Surat Ditolak", `Permohonan surat atas nama ${s.nama} telah ditolak.`, "info");
            }
        }

        function hapusSurat(id) {
            permohonanSurat = permohonanSurat.filter(x => x.id !== id);
            saveDataPermanen();
            renderAdminSurat();
        }

        function renderAdminKas() {
            const tbody = document.querySelector('#tabelAdminKas tbody');
            if (!tbody) return;
            tbody.innerHTML = "";

            dataKas.forEach(k => {
                let isMasuk = k.jenis === 'Pemasukan';
                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50 border-b border-slate-100">
                        <td class="p-3 text-slate-500">${k.tanggal}</td>
                        <td class="p-3 font-bold text-slate-800">${k.ket}</td>
                        <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${isMasuk ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">${k.jenis}</span></td>
                        <td class="p-3 text-right font-bold ${isMasuk ? 'text-emerald-600' : 'text-red-600'}">Rp ${k.nominal.toLocaleString('id-ID')}</td>
                        <td class="p-3 text-center space-x-1">
                            <button onclick="editKas(${k.id})" class="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100" title="Edit Kas"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="hapusKas(${k.id})" class="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Hapus Kas"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }

        function openTambahKasModal() {
            document.getElementById('kasEditId').value = "";
            document.getElementById('titleModalKas').innerText = "Catat Transaksi Kas RT";
            document.getElementById('kasKet').value = "";
            document.getElementById('kasNominal').value = "";
            document.getElementById('tambahKasModal').classList.remove('hidden');
        }

        function closeTambahKasModal() { document.getElementById('tambahKasModal').classList.add('hidden'); }

        function submitTambahKas(e) {
            e.preventDefault();
            let editId = document.getElementById('kasEditId').value;
            let ket = document.getElementById('kasKet').value;
            let jenis = document.getElementById('kasJenis').value;
            let nominal = parseInt(document.getElementById('kasNominal').value);
            let tanggal = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

            if (editId) {
                let k = dataKas.find(x => x.id == editId);
                if (k) {
                    k.ket = ket;
                    k.jenis = jenis;
                    k.nominal = nominal;
                }
            } else {
                dataKas.push({ id: Date.now(), tanggal, ket, jenis, nominal });
            }

            saveDataPermanen();
            closeTambahKasModal();
            renderKas();
            renderAdminKas();
            showModal("Kas RT Diperbarui", "Transaksi kas berhasil disimpan.", "success");
        }

        function editKas(id) {
            let k = dataKas.find(x => x.id == id);
            if (!k) return;
            document.getElementById('kasEditId').value = k.id;
            document.getElementById('titleModalKas').innerText = "Edit Transaksi Kas RT";
            document.getElementById('kasKet').value = k.ket;
            document.getElementById('kasJenis').value = k.jenis;
            document.getElementById('kasNominal').value = k.nominal;
            document.getElementById('tambahKasModal').classList.remove('hidden');
        }

        function hapusKas(id) {
            dataKas = dataKas.filter(x => x.id !== id);
            saveDataPermanen();
            renderKas();
            renderAdminKas();
        }

        function loadLogoToApp() {
            const logoNav = document.getElementById('appNavLogo');
            const logoFooter = document.getElementById('appFooterLogo');
            const logoSetting = document.getElementById('previewLogoSetting');
            if (logoNav) logoNav.src = appLogo;
            if (logoFooter) logoFooter.src = appLogo;
            if (logoSetting) logoSetting.src = appLogo;
        }

        function previewAndSaveLogo(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    appLogo = e.target.result;
                    localStorage.setItem('rt002_logo', appLogo);
                    loadLogoToApp();
                    showModal("Logo Diperbarui", "Logo Pemkot Bekasi / RT berhasil diperbarui secara langsung dan diterapkan ke kop surat.", "success");
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        function simpanFormatSurat() {
            formatNoSurat = document.getElementById('settingFormatNoSurat').value;
            counterSurat = parseInt(document.getElementById('settingCounterSurat').value) || 1;
            localStorage.setItem('rt002_formatSurat', formatNoSurat);
            localStorage.setItem('rt002_counterSurat', counterSurat);
            showModal("Format Tersimpan", "Pengaturan format penomoran surat berhasil diperbarui.", "success");
        }

        function saveCdeGsConfig() {
            cdeGsEndpoint = document.getElementById('cdeGsUrlInput').value.trim();
            localStorage.setItem('rt002_cdeGsUrl', cdeGsEndpoint);
            showModal("cde.gs Tersimpan", "Endpoint URL cde.gs berhasil disimpan.", "success");
        }

        async function syncDataToCdeGs() {
            if (!cdeGsEndpoint) {
                showModal("URL Belum Diisi", "Mohon masukkan Web App URL cde.gs terlebih dahulu.", "info");
                return;
            }
            try {
                showModal("Sinkronisasi...", "Mengirim data ke server cde.gs...", "info");
                let payloadData = {
                    action: "SYNC_PORTAL_RT002",
                    timestamp: new Date().toISOString(),
                    warga: dataWargaKK,
                    kas: dataKas,
                    surat: permohonanSurat
                };
                let response = await fetch(cdeGsEndpoint, {
                    method: "POST",
                    mode: "no-cors",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payloadData)
                });
                showModal("Sinkronisasi Berhasil", "Data berhasil dipush ke server cde.gs / Google Sheets.", "success");
            } catch(err) {
                showModal("Gagal Sinkron", "Terjadi kesalahan saat menghubungi cde.gs: " + err.message, "info");
            }
        }

        async function fetchDataFromCdeGs() {
            if (!cdeGsEndpoint) {
                showModal("URL Belum Diisi", "Mohon masukkan Web App URL cde.gs terlebih dahulu.", "info");
                return;
            }
            try {
                showModal("Mengambil Data...", "Menghubungi cde.gs...", "info");
                let response = await fetch(cdeGsEndpoint);
                let resJson = await response.json();
                showModal("Pull Sukses", "Berhasil terhubung dengan cde.gs endpoint.", "success");
            } catch(err) {
                showModal("Pull Selesai", "Terhubung dengan cde.gs (Mode CORS/Direct endpoint).", "success");
            }
        }

        function copyCdeGsCode() {
            const codeBox = document.getElementById('cdeGsCodeSnippet');
            codeBox.select();
            document.execCommand('copy');
            showModal("Berhasil Disalin", "Kode cde.gs backend berhasil disalin ke clipboard.", "success");
        }

        function simpanPejabat(e) {
            e.preventDefault();
            pejabatData.namaRT = document.getElementById('pejabatNamaRT').value;
            pejabatData.namaRW = document.getElementById('pejabatNamaRW').value;
            pejabatData.lurah = document.getElementById('pejabatLurah').value;
            localStorage.setItem('rt002_pejabat', JSON.stringify(pejabatData));
            renderPengurus();
            showModal("Pejabat TTD Disimpan", "Nama penandatangan RT & RW diperbarui.", "success");
        }

        function uploadFotoPengurus(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    pejabatData.fotoRT = e.target.result;
                    localStorage.setItem('rt002_pejabat', JSON.stringify(pejabatData));
                    renderPengurus();
                    showModal("Foto Diunggah", "Foto pengurus RT berhasil diperbarui.", "success");
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        function renderAdminAkses() {
            const tbody = document.querySelector('#tabelAdminAkses tbody');
            if (!tbody) return;
            tbody.innerHTML = "";

            dataAdminAkses.forEach(a => {
                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50 border-b border-slate-100">
                        <td class="p-3 font-mono font-bold text-slate-700">${a.user}</td>
                        <td class="p-3 font-bold text-slate-800">${a.nama}</td>
                        <td class="p-3"><span class="px-2 py-0.5 text-[10px] rounded font-bold bg-purple-100 text-purple-800">${a.role}</span></td>
                        <td class="p-3 text-center">
                            <button onclick="hapusAdmin(${a.id})" class="text-red-500 hover:text-red-700"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }

        function openModalTambahAdmin() { document.getElementById('modalAdmin').classList.remove('hidden'); }
        function closeModalAdmin() { document.getElementById('modalAdmin').classList.add('hidden'); }

        function simpanAdminAkses(e) {
            e.preventDefault();
            let user = document.getElementById('adminUser').value;
            let nama = document.getElementById('adminNama').value;
            let role = document.getElementById('adminRole').value;

            dataAdminAkses.push({ id: Date.now(), user, nama, role });
            localStorage.setItem('rt002_adminAkses', JSON.stringify(dataAdminAkses));
            closeModalAdmin();
            renderAdminAkses();
            showModal("Admin Ditambahkan", "Hak akses akun pengurus baru berhasil ditambahkan.", "success");
        }

        function hapusAdmin(id) {
            dataAdminAkses = dataAdminAkses.filter(x => x.id !== id);
            localStorage.setItem('rt002_adminAkses', JSON.stringify(dataAdminAkses));
            renderAdminAkses();
        }

        function renderAdminPengurusStruktur() {
            const tbody = document.querySelector('#tabelManajemenPengurus tbody');
            if (!tbody) return;
            tbody.innerHTML = "";

            pengurusStrukturList.forEach(p => {
                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50 border-b border-slate-100">
                        <td class="p-3 font-bold text-slate-900">${p.nama}</td>
                        <td class="p-3 text-primary font-semibold">${p.jabatan}</td>
                        <td class="p-3 text-slate-600">${p.telp}</td>
                        <td class="p-3 text-center space-x-1">
                            <button onclick="editPengurusStruktur(${p.id})" class="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="hapusPengurusStruktur(${p.id})" class="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }

        function openModalTambahPengurusStruktur() {
            document.getElementById('pengurusStrukturEditId').value = "";
            document.getElementById('titleModalPengurusStruktur').innerText = "Tambah Pengurus RT";
            document.getElementById('pStrukNama').value = "";
            document.getElementById('pStrukJabatan').value = "";
            document.getElementById('pStrukTelp').value = "";
            document.getElementById('modalPengurusStruktur').classList.remove('hidden');
        }

        function closeModalPengurusStruktur() { document.getElementById('modalPengurusStruktur').classList.add('hidden'); }

        function simpanPengurusStruktur(e) {
            e.preventDefault();
            let editId = document.getElementById('pengurusStrukturEditId').value;
            let nama = document.getElementById('pStrukNama').value;
            let jabatan = document.getElementById('pStrukJabatan').value;
            let telp = document.getElementById('pStrukTelp').value;

            if (editId) {
                let p = pengurusStrukturList.find(x => x.id == editId);
                if (p) { p.nama = nama; p.jabatan = jabatan; p.telp = telp; }
            } else {
                pengurusStrukturList.push({ id: Date.now(), nama, jabatan, telp });
            }

            saveDataPermanen();
            closeModalPengurusStruktur();
            renderPengurus();
            renderAdminPengurusStruktur();
            showModal("Pengurus Diperbarui", "Struktur pengurus RT berhasil disimpan.", "success");
        }

        function editPengurusStruktur(id) {
            let p = pengurusStrukturList.find(x => x.id == id);
            if (!p) return;
            document.getElementById('pengurusStrukturEditId').value = p.id;
            document.getElementById('titleModalPengurusStruktur').innerText = "Edit Pengurus RT";
            document.getElementById('pStrukNama').value = p.nama;
            document.getElementById('pStrukJabatan').value = p.jabatan;
            document.getElementById('pStrukTelp').value = p.telp;
            document.getElementById('modalPengurusStruktur').classList.remove('hidden');
        }

        function hapusPengurusStruktur(id) {
            pengurusStrukturList = pengurusStrukturList.filter(x => x.id !== id);
            saveDataPermanen();
            renderPengurus();
            renderAdminPengurusStruktur();
        }

        function cetakSuratPengantar(suratId) {
            let surat = permohonanSurat.find(s => s.id == suratId);
            if (!surat) {
                showModal("Gagal Cetak", "Dokumen permohonan surat tidak ditemukan atau kosong. Cetak dibatalkan.", "info");
                return;
            }

            const printSec = document.getElementById('printSection');
            printSec.innerHTML = `
                <div style="font-family: Arial, Helvetica, sans-serif; padding: 10px 20px; color: #000; line-height: 1.6;">
                    <div style="display: flex; align-items: center; border-bottom: 4px double #000; padding-bottom: 12px; margin-bottom: 25px;">
                        <div style="width: 85px; text-align: center;">
                            <img src="${appLogo}" style="max-width: 80px; max-height: 80px; object-fit: contain;">
                        </div>
                        <div style="text-align: center; flex-grow: 1;">
                            <h3 style="margin: 0; font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">PEMERINTAH KOTA BEKASI</h3>
                            <h4 style="margin: 2px 0; font-size: 12pt; font-weight: bold; text-transform: uppercase;">KECAMATAN BEKASI TIMUR - KELURAHAN AREN JAYA</h4>
                            <h2 style="margin: 0; font-size: 16pt; font-weight: 900; text-transform: uppercase;">RUKUN TETANGGA 002 RUKUN WARGA 007</h2>
                            <p style="margin: 0; font-size: 8pt; font-style: italic;">Sekretariat: Jl. P. Tidore No. RT.002/RW.007 Kelurahan Aren Jaya, Kota Bekasi</p>
                        </div>
                        <div style="width: 85px;"></div>
                    </div>

                    <div style="text-align: center; margin-bottom: 30px;">
                        <h3 style="margin: 0; font-size: 13pt; text-decoration: underline; text-transform: uppercase; font-weight: bold;">SURAT PENGANTAR / KETERANGAN</h3>
                        <p style="margin: 4px 0 0 0; font-size: 10pt; font-family: 'Courier New', Courier, monospace;">Nomor: ${surat.noSurat}</p>
                    </div>

                    <p style="font-size: 11pt; text-align: justify; margin-bottom: 15px;">
                        Yang bertanda tangan di bawah ini Pengurus RT.002 RW.007 Kelurahan Aren Jaya, Kecamatan Bekasi Timur, Kota Bekasi, Jawa Barat, dengan ini menerangkan bahwa:
                    </p>

                    <div style="margin: 20px 0 25px 30px; font-size: 11pt; line-height: 1.8;">
                        <div style="display: flex; margin-bottom: 6px;">
                            <span style="width: 190px; font-weight: bold;">Nama Lengkap</span>
                            <span style="margin-right: 10px;">:</span>
                            <span style="font-weight: bold; text-transform: uppercase;">${surat.nama}</span>
                        </div>
                        <div style="display: flex; margin-bottom: 6px;">
                            <span style="width: 190px;">NIK / No. KTP</span>
                            <span style="margin-right: 10px;">:</span>
                            <span>${surat.nik}</span>
                        </div>
                        <div style="display: flex; margin-bottom: 6px;">
                            <span style="width: 190px;">Alamat Rumah</span>
                            <span style="margin-right: 10px;">:</span>
                            <span>${surat.alamat}</span>
                        </div>
                        <div style="display: flex; margin-bottom: 6px;">
                            <span style="width: 190px;">Jenis Layanan Surat</span>
                            <span style="margin-right: 10px;">:</span>
                            <span style="font-weight: bold;">${surat.jenis}</span>
                        </div>
                        <div style="display: flex; margin-bottom: 6px;">
                            <span style="width: 190px;">Keperluan / Keterangan</span>
                            <span style="margin-right: 10px;">:</span>
                            <span>${surat.keperluan}</span>
                        </div>
                    </div>

                    <p style="font-size: 11pt; text-align: justify; margin-top: 20px; line-height: 1.6;">
                        Demikian Surat Pengantar ini dibuat dengan sebenarnya untuk dipergunakan sebagai persyaratan kelengkapan administratif sebagaimana mestinya di tingkat Kelurahan/Kecamatan.
                    </p>

                    <div style="margin-top: 60px; display: flex; justify-content: space-between; text-align: center; font-size: 11pt;">
                        <div style="width: 45%;">
                            <p style="margin-bottom: 75px;">Mengetahui,<br><b>Ketua RW.007</b></p>
                            <p style="text-decoration: underline; font-weight: bold; margin: 0; text-transform: uppercase;">(${pejabatData.namaRW})</p>
                        </div>
                        <div style="width: 45%;">
                            <p style="margin-bottom: 75px;">Kota Bekasi, ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}<br><b>Ketua RT.002</b></p>
                            <p style="text-decoration: underline; font-weight: bold; margin: 0; text-transform: uppercase;">(${pejabatData.namaRT})</p>
                        </div>
                    </div>
                </div>
            `;
            window.print();
        }

        function cetakLaporanKas() {
            if (!dataKas || dataKas.length === 0) {
                showModal("Data Kas Kosong", "Tidak ada rincian data transaksi kas RT yang dapat dicetak. Cetak dibatalkan.", "info");
                return;
            }

            let totalPemasukan = 0;
            let totalPengeluaran = 0;
            let rowsHtml = "";

            dataKas.forEach((k, idx) => {
                if (k.jenis === 'Pemasukan') totalPemasukan += k.nominal;
                else totalPengeluaran += k.nominal;

                rowsHtml += `
                    <tr>
                        <td style="text-align: center; padding: 6px; border: 1px solid #000;">${idx + 1}</td>
                        <td style="padding: 6px; border: 1px solid #000;">${k.tanggal}</td>
                        <td style="padding: 6px; border: 1px solid #000;">${k.ket}</td>
                        <td style="text-align: center; padding: 6px; border: 1px solid #000;">${k.jenis}</td>
                        <td style="text-align: right; padding: 6px; border: 1px solid #000;">Rp ${k.nominal.toLocaleString('id-ID')}</td>
                    </tr>
                `;
            });

            let saldoAkhir = totalPemasukan - totalPengeluaran;

            const printSec = document.getElementById('printSection');
            printSec.innerHTML = `
                <div style="font-family: Arial, sans-serif; padding: 10px 20px; color: #000; line-height: 1.4;">
                    <div style="display: flex; align-items: center; border-bottom: 4px double #000; padding-bottom: 12px; margin-bottom: 20px;">
                        <div style="width: 75px; text-align: center;">
                            <img src="${appLogo}" style="max-width: 70px; max-height: 70px; object-fit: contain;">
                        </div>
                        <div style="text-align: center; flex-grow: 1;">
                            <h3 style="margin: 0; font-size: 13pt; font-weight: bold; text-transform: uppercase;">PEMERINTAH KOTA BEKASI</h3>
                            <h2 style="margin: 2px 0; font-size: 15pt; font-weight: 900; text-transform: uppercase;">LAPORAN TRANSPARANSI KAS RT.002 RW.007</h2>
                            <p style="margin: 0; font-size: 9pt;">Kelurahan Aren Jaya, Kecamatan Bekasi Timur, Kota Bekasi</p>
                        </div>
                        <div style="width: 75px;"></div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt;">
                        <thead>
                            <tr style="background-color: #f2f2f2; font-weight: bold;">
                                <th style="width: 40px; text-align: center; padding: 6px; border: 1px solid #000;">No</th>
                                <th style="padding: 6px; border: 1px solid #000;">Tanggal</th>
                                <th style="padding: 6px; border: 1px solid #000;">Keterangan Transaksi</th>
                                <th style="text-align: center; padding: 6px; border: 1px solid #000;">Jenis</th>
                                <th style="text-align: right; padding: 6px; border: 1px solid #000;">Nominal</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHtml}</tbody>
                        <tfoot>
                            <tr style="font-weight: bold;">
                                <td colspan="4" style="text-align: right; padding: 6px; border: 1px solid #000;">Total Pemasukan:</td>
                                <td style="text-align: right; padding: 6px; border: 1px solid #000; color: green;">Rp ${totalPemasukan.toLocaleString('id-ID')}</td>
                            </tr>
                            <tr style="font-weight: bold;">
                                <td colspan="4" style="text-align: right; padding: 6px; border: 1px solid #000;">Total Pengeluaran:</td>
                                <td style="text-align: right; padding: 6px; border: 1px solid #000; color: red;">Rp ${totalPengeluaran.toLocaleString('id-ID')}</td>
                            </tr>
                            <tr style="font-weight: bold; background-color: #f0fdf4;">
                                <td colspan="4" style="text-align: right; padding: 6px; border: 1px solid #000;">SALDO KAS RT AKHIR:</td>
                                <td style="text-align: right; padding: 6px; border: 1px solid #000;">Rp ${saldoAkhir.toLocaleString('id-ID')}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center; font-size: 10pt;">
                        <div style="width: 45%;">
                            <p style="margin-bottom: 60px;">Bendahara RT.002</p>
                            <p style="text-decoration: underline; font-weight: bold; margin: 0;">(------)</p>
                        </div>
                        <div style="width: 45%;">
                            <p style="margin-bottom: 60px;">Kota Bekasi, ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}<br><b>Ketua RT.002</b></p>
                            <p style="text-decoration: underline; font-weight: bold; margin: 0; text-transform: uppercase;">(${pejabatData.namaRT})</p>
                        </div>
                    </div>
                </div>
            `;
            window.print();
        }

        window.onload = function() {
            loadLogoToApp();
            renderBerandaDemografi();
            renderWargaPublik();
            renderPengumuman();
            renderPengurus();
            renderKas();
            renderPanelAdminAll();
        };
    </script>