// Ganti tautan di bawah ini dengan URL Web App dari Google Apps Script Anda
const API_URL = "https://script.google.com/macros/s/AKfycbxELFCp39E4seT_44DtaDomemP7j2D8viRZF68wUk5Jn89pDHUCwKyZYGdQcQAtsuYr/exec";

let isProcessing = false;

function onScanSuccess(decodedText, decodedResult) {
  // Cegah scan ganda berturut-turut dalam rentang detik yang sama
  if (isProcessing) return;
  isProcessing = true;

  const resultBox = document.getElementById("resultBox");
  const resultStatus = document.getElementById("resultStatus");
  const resultNama = document.getElementById("resultNama");
  const resultKategori = document.getElementById("resultKategori");

  // Tampilkan UI Loading
  resultBox.classList.remove("hidden", "bg-green-600", "bg-yellow-600", "bg-red-600");
  resultBox.classList.add("bg-gray-700");
  resultStatus.innerText = "Memverifikasi...";
  resultNama.innerText = decodedText;
  resultKategori.innerText = "";

  // Kirim ID Tamu dari hasil Scan ke Google Apps Script
// Kirim ID Tamu dari hasil Scan ke Google Apps Script
  fetch(API_URL, {
    method: "POST",
    mode: "cors",
    headers: { 
      "Content-Type": "text/plain;charset=utf-8" 
    },
    body: JSON.stringify({ id_tamu: decodedText })
  })
  .then(res => res.json())
  .then(data => {
    resultBox.classList.remove("bg-gray-700");

    if (data.status === "success") {
      // HIJAU: Berhasil Check-in
      resultBox.classList.add("bg-green-600");
      resultStatus.innerText = "✅ BERHASIL CHECK-IN";
      resultNama.innerText = data.nama;
      resultKategori.innerText = `Kategori: ${data.kategori}`;
    } else if (data.status === "already_checked_in") {
      // KUNING: Sudah Pernah Scan
      resultBox.classList.add("bg-yellow-600");
      resultStatus.innerText = "⚠️ SUDAH CHECK-IN SEBELUMNYA";
      resultNama.innerText = data.nama;
      resultKategori.innerText = "Tamu ini sudah ada di dalam ruangan!";
    } else {
      // MERAH: Tidak Ditemukan
      resultBox.classList.add("bg-red-600");
      resultStatus.innerText = "❌ TIDAK DITEMUKAN";
      resultNama.innerText = decodedText;
      resultKategori.innerText = "ID Tamu tidak terdaftar di sistem!";
    }

    // Berikan jeda 3 detik sebelum siap scan tamu berikutnya
    setTimeout(() => {
      isProcessing = false;
      resultBox.classList.add("hidden");
    }, 3000);
  })
  .catch(err => {
    console.error(err);
    resultBox.classList.remove("bg-gray-700");
    resultBox.classList.add("bg-red-600");
    resultStatus.innerText = "❌ ERROR KONEKSI";
    resultNama.innerText = "Gagal terhubung ke server";
    
    setTimeout(() => {
      isProcessing = false;
      resultBox.classList.add("hidden");
    }, 3000);
  });
}

// Inisialisasi Kamera HTML5 QR Code Scanner
const html5QrcodeScanner = new Html5QrcodeScanner(
  "reader", 
  { fps: 10, qrbox: { width: 250, height: 250 } }, 
  /* verbose= */ false
);

html5QrcodeScanner.render(onScanSuccess);
