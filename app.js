// Ganti tautan di bawah ini dengan URL Web App dari Google Apps Script Anda
const API_URL = "https://script.googleusercontent.com/a/macros/hikmahuniversity.ac.id/echo?user_content_key=AUkAhnRXE8CYokQIXVJPMIiKulq6wA1iKuz_5Obp1vFSWyegw2dhKPun7zPHwr0t179j3WM0c3aKeEahQLMNfBmqvYFnHKhy6Gf2yRO3SNytXBbBvgk0lyEC6Qack-J4XPWfgHe5sLRJaTqqJtNZkbK_qk529JQcYw9b9kYeM6LSsImKdFOwwLqtkGNgwsv25tgOJz-k90SoXMMjPvRH2HwEZlzm1G7jh4uRSALcZLbUpnLDNAYG-hHyZCrnlgu46fYHhv5bBloSVCDds1ko9olSBfxGhlJmR3cc-H2k_juhkrhz9yVRMpXfVtX5u1r60w&lib=MPcaUPQ2SMA6xqXuh1xK6W3vfmDgUTCal";

async function loadDashboardData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    // Hitung Statistik
    const totalTamu = data.length;
    const totalKonfirmasi = data.filter(row => row.Konfirmasi_RSVP === "Hadir").length;
    const totalHadir = data.filter(row => row.Status_Kehadiran === "Hadir").length;
    const totalVipHadir = data.filter(row => row.Kategori === "VIP" && row.Status_Kehadiran === "Hadir").length;

    // Tampilkan di Ringkasan Kartu
    document.getElementById("totalTamu").innerText = totalTamu;
    document.getElementById("totalKonfirmasi").innerText = totalKonfirmasi;
    document.getElementById("totalHadir").innerText = totalHadir;
    document.getElementById("totalVipHadir").innerText = totalVipHadir;

    // Render Tabel
    const tbody = document.getElementById("tabelDataTamu");
    tbody.innerHTML = "";

    data.forEach(tamu => {
      const tr = document.createElement("tr");
      tr.className = "border-b hover:bg-gray-50";

      const statusBadge = tamu.Status_Kehadiran === "Hadir" 
        ? `<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">Hadir</span>`
        : `<span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Belum Datang</span>`;

      const kategoriBadge = tamu.Kategori === "VIP"
        ? `<span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-bold">VIP</span>`
        : `<span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">Reguler</span>`;

      tr.innerHTML = `
        <td class="p-3 text-sm font-mono">${tamu.ID_Tamu || '-'}</td>
        <td class="p-3 text-sm font-semibold text-gray-800">${tamu.Nama || '-'}</td>
        <td class="p-3 text-sm">${kategoriBadge}</td>
        <td class="p-3 text-sm">${tamu.Konfirmasi_RSVP || '-'}</td>
        <td class="p-3 text-sm">${statusBadge}</td>
        <td class="p-3 text-sm text-gray-500 font-mono">${tamu.Waktu_Checkin || '-'}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }
}

// Jalankan saat pertama kali dibuka
loadDashboardData();

// Opsi: Refresh otomatis data setiap 10 detik
setInterval(loadDashboardData, 10000);
