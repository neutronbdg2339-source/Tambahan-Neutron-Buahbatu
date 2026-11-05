/**
 * NEUTRON BANDUNG 2 BUAH BATU — API KELAS TAMBAHAN
 * Setup:
 * 1) Buat Google Sheet, tab bernama "Tambahan"
 * 2) Extensions > Apps Script, tempel kode ini
 * 3) Isi SHEET_ID dan API_KEY
 * 4) Deploy > New deployment > Web app
 *    Execute as: Me | Who has access: Anyone
 */
const SHEET_ID = "PASTE_ID_GOOGLE_SHEET";
const SHEET_NAME = "Tambahan";
const API_KEY = "GANTI_DENGAN_TOKEN_RAHASIA_PANJANG";

const HEADERS = [
  "ID", "Nama Siswa", "Kelompok Kelas", "Asal Sekolah",
  "Mata Pelajaran", "Materi yang dibahas", "Tanggal Tambahan",
  "Hari", "Jam Tambahan", "Pengerjaan", "Deadline Tugas",
  "Jam Pulang Sekolah", "Dibuat", "Diperbarui"
];

function sheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function authorize_(e) {
  const key = (e && e.parameter && e.parameter.key) || "";
  if (key !== API_KEY) throw new Error("Unauthorized: API key tidak valid.");
}

function doGet(e) {
  try {
    authorize_(e);
    const action = (e.parameter.action || "list").toLowerCase();
    const sh = sheet_();
    const values = sh.getDataRange().getValues();
    const headers = values.shift() || HEADERS;
    let rows = values.filter(r => r[0] !== "");
    let data = rows.map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i] instanceof Date
        ? Utilities.formatDate(r[i], Session.getScriptTimeZone(), "yyyy-MM-dd")
        : r[i]);
      return obj;
    });

    if (action === "list") return json_({ success: true, data });
    if (action === "get") {
      const id = e.parameter.id;
      const found = data.find(x => String(x.ID) === String(id));
      return json_({ success: !!found, data: found || null });
    }
    return json_({ success: false, message: "Action GET tidak dikenal." });
  } catch (err) {
    return json_({ success: false, message: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    if (body.key !== API_KEY) throw new Error("Unauthorized: API key tidak valid.");
    const action = (body.action || "").toLowerCase();
    const sh = sheet_();
    const now = new Date();

    if (action === "create") {
      const id = Utilities.getUuid();
      const fields = HEADERS.slice(1, 12).map(h => body.data[h] || "");
      sh.appendRow([id, ...fields, now, now]);
      return json_({ success: true, id, message: "Data berhasil ditambahkan." });
    }

    const all = sh.getDataRange().getValues();
    const idCol = all[0].indexOf("ID");
    const rowIndex = all.findIndex((r, i) => i > 0 && String(r[idCol]) === String(body.id));
    if (rowIndex < 1) throw new Error("Data dengan ID tersebut tidak ditemukan.");

    if (action === "update") {
      const row = all[rowIndex];
      HEADERS.slice(1, 12).forEach((h, i) => row[i + 1] = body.data[h] ?? "");
      row[HEADERS.indexOf("Diperbarui")] = now;
      sh.getRange(rowIndex + 1, 1, 1, HEADERS.length).setValues([row]);
      return json_({ success: true, message: "Data berhasil diperbarui." });
    }

    if (action === "delete") {
      sh.deleteRow(rowIndex + 1);
      return json_({ success: true, message: "Data berhasil dihapus." });
    }
    return json_({ success: false, message: "Action POST tidak dikenal." });
  } catch (err) {
    return json_({ success: false, message: String(err.message || err) });
  }
}
