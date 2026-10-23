// Ganti tautan di bawah ini dengan URL Web App dari Google Apps Script Anda
const API_URL = "URL_WEB_APP_ANDA_DI_SINI";

let chartKehadiranInstance = null;
let chartKategoriInstance = null;

async function loadDashboardData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    // Hitung Statistik
    const totalTamu = data.length;
    const totalKonfirmasi = data.filter(row => row.Konfirmasi_RSVP === "Hadir").length;
    const totalHadir = data.filter(row => row.Status_Kehadiran === "Hadir").length;
    const totalBelumHadir = totalTamu - totalHadir;

    const vipHadir = data.filter(row => row.Kategori === "VIP" && row.Status_Kehadiran === "Hadir").length;
    const regulerHadir = data.filter(row => row.Kategori === "Reguler" && row.Status_Kehadiran === "Hadir").length;

    // Tampilkan Ringkasan Kartu
    document.getElementById("totalTamu").innerText = totalTamu;
    document.getElementById("totalKonfirmasi").innerText = totalKonfirmasi;
    document.getElementById("totalHadir").innerText = totalHadir;
    document.getElementById("totalVipHadir").innerText = vipHadir;

    // Render / Update Diagram
    renderCharts(totalHadir, totalBelumHadir, vipHadir, regulerHadir);

    // Render Tabel (Di Paling Bawah)
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

function renderCharts(sudahHadir, belumHadir, vipHadir, regulerHadir) {
  // Chart 1: Donut Chart Kehadiran Overall
  const ctx1 = document.getElementById('chartKehadiran').getContext('2d');
  if (chartKehadiranInstance) chartKehadiranInstance.destroy();
  chartKehadiranInstance = new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: ['Sudah Hadir', 'Belum Datang'],
      datasets: [{
        data: [sudahHadir, belumHadir],
        backgroundColor: ['#22c55e', '#e5e7eb']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // Chart 2: Pie Chart VIP vs Reguler
  const ctx2 = document.getElementById('chartKategori').getContext('2d');
  if (chartKategoriInstance) chartKategoriInstance.destroy();
  chartKategoriInstance = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: ['VIP Hadir', 'Reguler Hadir'],
      datasets: [{
        data: [vipHadir, regulerHadir],
        backgroundColor: ['#a855f7', '#3b82f6']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// Jalankan pertama kali & auto-refresh tiap 10 detik
loadDashboardData();
setInterval(loadDashboardData, 10000);
