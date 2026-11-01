/**
 * ==============================================================================
 * PORTAL KEPENDUDUKAN DIGITAL (SIDUDI) RT.002 RW.007 KELURAHAN AREN JAYA
 * KOTA BEKASI - JAWA BARAT
 * ==============================================================================
 * File: Code.gs (Google Apps Script Backend & Database Synchronizer)
 * Description: Backend script untuk mengelola database Google Spreadsheet, 
 *              melakukan auto-setup struktur tabel/sheet, dan melayani REST API 
 *              (doGet & doPost) untuk sinkronisasi web portal kependudukan.
 * ==============================================================================
 */

// Global Config Sheet Names
const SHEET_WARGA = "Data_Warga_KK";
const SHEET_ANGGOTA = "Anggota_Keluarga";
const SHEET_KAS = "Laporan_Kas_RT";
const SHEET_SURAT = "Permohonan_Surat";
const SHEET_PENGADUAN = "Pengaduan_Warga";
const SHEET_PENGUMUMAN = "Pengumuman_Agenda";
const SHEET_ADMIN = "Hak_Akses_Admin";
const SHEET_PENGURUS = "Struktur_Pengurus";
const SHEET_CONFIG = "Konfigurasi_Sistem";

/**
 * Funsi Inisialisasi Database (Setup Spreadsheet & Sheet otomatis)
 * Jalankan fungsi ini sekali di Google Apps Script Editor untuk membuat semua tabel.
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Array skema Sheet dan Header Kolom
  const schemas = [
    {
      name: SHEET_WARGA,
      headers: ["ID KK", "No. KK", "Nama Kepala Keluarga", "Alamat Rumah", "Kategori Desil", "Dokumen File", "Tanggal Buat"]
    },
    {
      name: SHEET_ANGGOTA,
      headers: ["ID KK", "No. KK", "Nama Anggota", "Hubungan Keluarga", "Usia (Thn)", "Kategori Usia"]
    },
    {
      name: SHEET_KAS,
      headers: ["ID Transaksi", "Tanggal", "Keterangan", "Jenis (Pemasukan/Pengeluaran)", "Nominal (Rp)"]
    },
    {
      name: SHEET_SURAT,
      headers: ["ID Surat", "Nomor Referensi Surat", "Nama Pemohon", "NIK", "No. WhatsApp", "Jenis Surat", "Alamat Pemohon", "Keperluan", "Status Approval", "Tanggal Pengajuan"]
    },
    {
      name: SHEET_PENGADUAN,
      headers: ["ID Pengaduan", "Tanggal", "Nama Pelapor", "Alamat / No. Rumah", "Pesan Pengaduan", "Status Penanganan", "Tanggapan Pengurus"]
    },
    {
      name: SHEET_PENGUMUMAN,
      headers: ["ID Pengumuman", "Tanggal Kegiatan", "Judul Agenda / Pengumuman", "Isi Keterangan", "Foto Base64 / URL", "Video Base64 / URL"]
    },
    {
      name: SHEET_ADMIN,
      headers: ["ID Admin", "Username", "Nama Pengurus", "Role Akses"]
    },
    {
      name: SHEET_PENGURUS,
      headers: ["ID Pengurus", "Nama Lengkap & Gelar", "Jabatan", "No. Telepon / WA"]
    },
    {
      name: SHEET_CONFIG,
      headers: ["Key", "Value"]
    }
  ];

  schemas.forEach(schema => {
    let sheet = ss.getSheetByName(schema.name);
    if (!sheet) {
      sheet = ss.insertSheet(schema.name);
    }
    
    // Set Header jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, schema.headers.length).setValues([schema.headers]);
      
      // Styling Header
      const headerRange = sheet.getRange(1, 1, 1, schema.headers.length);
      headerRange.setBackground("#1e3a8a")
                 .setFontColor("#ffffff")
                 .setFontWeight("bold")
                 .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
  });

  // Hapus 'Sheet1' default jika ada
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  // Masukkan Seed Data Awal ke Config jika kosong
  const configSheet = ss.getSheetByName(SHEET_CONFIG);
  if (configSheet.getLastRow() <= 1) {
    const defaultConfig = [
      ["FORMAT_NO_SURAT", "470/{NO}/RT.002/RW.007/2026"],
      ["COUNTER_SURAT", "15"],
      ["NAMA_KETUA_RT", "Bpk. H. Ahmad Santoso"],
      ["NAMA_KETUA_RW", "Bpk. Drs. M. Ridwan"],
      ["LURAH_PEMBINA", "Lurah Aren Jaya, Kota Bekasi"]
    ];
    configSheet.getRange(2, 1, defaultConfig.length, 2).setValues(defaultConfig);
  }

  // Seed Data Awal Kas jika kosong
  const kasSheet = ss.getSheetByName(SHEET_KAS);
  if (kasSheet.getLastRow() <= 1) {
    const defaultKas = [
      [1, "01 Nov 2026", "Iuran Bulanan Warga RT.002", "Pemasukan", 2500000],
      [2, "05 Nov 2026", "Pembelian Lampu LED Jalan Gang A", "Pengeluaran", 350000],
      [3, "10 Nov 2026", "Honor Petugas Keamanan & Kebersihan", "Pengeluaran", 1200000]
    ];
    kasSheet.getRange(2, 1, defaultKas.length, 5).setValues(defaultKas);
  }

  Logger.log("SETUP DATABASE BERHASIL: Semua Sheet dan struktur tabel telah siap!");
}

/**
 * GET API Endpoint: Mengambil seluruh data portal dalam format JSON yang terstruktur
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Ambil data warga dan rekonsiliasi anggota keluarga ke dalamnya
    const rawWarga = readSheetData(ss.getSheetByName(SHEET_WARGA));
    const rawAnggota = readSheetData(ss.getSheetByName(SHEET_ANGGOTA));
    
    const wargaFormatted = rawWarga.map(w => {
      const anggotaList = rawAnggota
        .filter(a => String(a["ID KK"]) === String(w["ID KK"]) || String(a["No. KK"]) === String(w["No. KK"]))
        .map(a => ({
          nama: a["Nama Anggota"],
          hub: a["Hubungan Keluarga"],
          usia: Number(a["Usia (Thn)"]) || 0
        }));
      
      return {
        id: w["ID KK"],
        noKk: String(w["No. KK"]),
        nama: w["Nama Kepala Keluarga"],
        alamat: w["Alamat Rumah"],
        desil: w["Kategori Desil"],
        fileDoc: w["Dokumen File"],
        anggota: anggotaList
      };
    });

    // Formatting Kas
    const rawKas = readSheetData(ss.getSheetByName(SHEET_KAS));
    const kasFormatted = rawKas.map(k => ({
      id: k["ID Transaksi"],
      tanggal: k["Tanggal"],
      ket: k["Keterangan"],
      jenis: k["Jenis (Pemasukan/Pengeluaran)"],
      nominal: Number(k["Nominal (Rp)"]) || 0
    }));

    // Formatting Surat
    const rawSurat = readSheetData(ss.getSheetByName(SHEET_SURAT));
    const suratFormatted = rawSurat.map(s => ({
      id: s["ID Surat"],
      noSurat: s["Nomor Referensi Surat"],
      nama: s["Nama Pemohon"],
      nik: String(s["NIK"]),
      wa: String(s["No. WhatsApp"]),
      jenis: s["Jenis Surat"],
      alamat: s["Alamat Pemohon"],
      keperluan: s["Keperluan"],
      status: s["Status Approval"]
    }));

    // Formatting Pengaduan
    const rawAduan = readSheetData(ss.getSheetByName(SHEET_PENGADUAN));
    const aduanFormatted = rawAduan.map(a => ({
      id: a["ID Pengaduan"],
      tanggal: a["Tanggal"],
      nama: a["Nama Pelapor"],
      rumah: a["Alamat / No. Rumah"],
      pesan: a["Pesan Pengaduan"],
      status: a["Status Penanganan"],
      tanggapan: a["Tanggapan Pengurus"]
    }));

    // Formatting Pengumuman
    const rawPengumuman = readSheetData(ss.getSheetByName(SHEET_PENGUMUMAN));
    const pengumumanFormatted = rawPengumuman.map(p => ({
      id: p["ID Pengumuman"],
      tanggal: p["Tanggal Kegiatan"],
      judul: p["Judul Agenda / Pengumuman"],
      isi: p["Isi Keterangan"],
      foto: p["Foto Base64 / URL"],
      video: p["Video Base64 / URL"]
    }));

    const result = {
      status: "success",
      timestamp: new Date().toISOString(),
      warga: wargaFormatted,
      kas: kasFormatted,
      surat: suratFormatted,
      aduan: aduanFormatted,
      pengumuman: pengumumanFormatted
    };

    return ContentService.createTextOutput(JSON.stringify(result))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * POST API Endpoint: Menerima Sync / Push Data dari Website SIDUDI RT.002
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = postData.action || "SYNC_ALL";

    if (action === "SYNC_PORTAL_RT002" || action === "SYNC_ALL") {
      // 1. Sync Data Warga & Anggota
      if (postData.warga && Array.isArray(postData.warga)) {
        saveDataWargaAndAnggota(ss, postData.warga);
      }

      // 2. Sync Kas RT
      if (postData.kas && Array.isArray(postData.kas)) {
        saveDataKas(ss, postData.kas);
      }

      // 3. Sync Permohonan Surat
      if (postData.surat && Array.isArray(postData.surat)) {
        saveDataSurat(ss, postData.surat);
      }

      // 4. Sync Pengaduan Warga
      if (postData.aduan && Array.isArray(postData.aduan)) {
        saveDataAduan(ss, postData.aduan);
      }

      // 5. Sync Pengumuman
      if (postData.pengumuman && Array.isArray(postData.pengumuman)) {
        saveDataPengumuman(ss, postData.pengumuman);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data SIDUDI RT.002 berhasil disinkronisasi ke Google Sheets secara menyeluruh."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "warning",
      message: "Aksi tidak dikenali."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==============================================================================
// HELPER FUNCTIONS UNTUK READ & WRITE SPREADSHEET
// ==============================================================================

function readSheetData(sheet) {
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];
  
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const dataRows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  
  return dataRows.map(row => {
    let obj = {};
    headers.forEach((h, index) => {
      obj[h] = row[index];
    });
    return obj;
  });
}

function clearDataRows(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
}

function saveDataWargaAndAnggota(ss, wargaList) {
  const sheetWarga = ss.getSheetByName(SHEET_WARGA);
  const sheetAnggota = ss.getSheetByName(SHEET_ANGGOTA);
  
  clearDataRows(sheetWarga);
  clearDataRows(sheetAnggota);

  let rowsWarga = [];
  let rowsAnggota = [];
  const now = new Date().toLocaleDateString('id-ID');

  wargaList.forEach(w => {
    rowsWarga.push([
      w.id || Date.now(),
      w.noKk || "",
      w.nama || "",
      w.alamat || "",
      w.desil || "Nondesil",
      w.fileDoc || "",
      now
    ]);

    if (w.anggota && Array.isArray(w.anggota)) {
      w.anggota.forEach(a => {
        let usia = parseInt(a.usia) || 0;
        let katUsia = usia <= 5 ? 'Balita' : (usia <= 17 ? 'Anak/Remaja' : (usia <= 59 ? 'Dewasa' : 'Lansia'));
        rowsAnggota.push([
          w.id || Date.now(),
          w.noKk || "",
          a.nama || "",
          a.hub || "",
          usia,
          katUsia
        ]);
      });
    }
  });

  if (rowsWarga.length > 0) {
    sheetWarga.getRange(2, 1, rowsWarga.length, 7).setValues(rowsWarga);
  }
  if (rowsAnggota.length > 0) {
    sheetAnggota.getRange(2, 1, rowsAnggota.length, 6).setValues(rowsAnggota);
  }
}

function saveDataKas(ss, kasList) {
  const sheet = ss.getSheetByName(SHEET_KAS);
  clearDataRows(sheet);
  let rows = [];

  kasList.forEach(k => {
    rows.push([
      k.id || Date.now(),
      k.tanggal || new Date().toLocaleDateString('id-ID'),
      k.ket || "",
      k.jenis || "Pemasukan",
      k.nominal || 0
    ]);
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 5).setValues(rows);
  }
}

function saveDataSurat(ss, suratList) {
  const sheet = ss.getSheetByName(SHEET_SURAT);
  clearDataRows(sheet);
  let rows = [];

  suratList.forEach(s => {
    rows.push([
      s.id || Date.now(),
      s.noSurat || "",
      s.nama || "",
      s.nik || "",
      s.wa || "",
      s.jenis || "",
      s.alamat || "",
      s.keperluan || "",
      s.status || "Menunggu Persetujuan",
      new Date().toLocaleDateString('id-ID')
    ]);
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 10).setValues(rows);
  }
}

function saveDataAduan(ss, aduanList) {
  const sheet = ss.getSheetByName(SHEET_PENGADUAN);
  clearDataRows(sheet);
  let rows = [];

  aduanList.forEach(a => {
    rows.push([
      a.id || Date.now(),
      a.tanggal || new Date().toLocaleDateString('id-ID'),
      a.nama || "",
      a.rumah || "",
      a.pesan || "",
      a.status || "Menunggu",
      a.tanggapan || "-"
    ]);
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 7).setValues(rows);
  }
}

function saveDataPengumuman(ss, pengumumanList) {
  const sheet = ss.getSheetByName(SHEET_PENGUMUMAN);
  clearDataRows(sheet);
  let rows = [];

  pengumumanList.forEach(p => {
    rows.push([
      p.id || Date.now(),
      p.tanggal || "",
      p.judul || "",
      p.isi || "",
      p.foto || "",
      p.video || ""
    ]);
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }
}