const API_URL = "https://script.google.com/macros/s/AKfycbxELFCp39E4seT_44DtaDomemP7j2D8viRZF68wUk5Jn89pDHUCwKyZYGdQcQAtsuYr/exec";

let chart1 = null;
let chart2 = null;

async function loadDashboardData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    let totalTamu = data.length;
    let totalKonfirmasi = 0;
    let totalHadir = 0;
    let vipHadir = 0;
    let regulerHadir = 0;

    const tbody = document.getElementById("tabelDataTamu");
    tbody.innerHTML = "";

    data.forEach(tamu => {
      // Pembacaan properti fleksibel
      const id = tamu.ID_Tamu || tamu.id_tamu || '-';
      const nama = tamu.Nama || tamu.nama || '-';
      const kategori = tamu.Kategori || tamu.kategori || 'Reguler';
      const rsvp = tamu.Konfirmasi_RSVP || tamu.konfirmasi_rsvp || '-';
      const statusHadir = tamu.Status_Kehadiran || tamu.status_kehadiran || 'Belum Datang';
      const waktuCheckin = tamu.Waktu_Checkin || tamu.waktu_checkin || '-';

      const isHadir = String(statusHadir).trim().toLowerCase() === "hadir";
      const isVip = String(kategori).trim().toUpperCase() === "VIP";

      if (String(rsvp).trim().toLowerCase() === "hadir") totalKonfirmasi++;
      if (isHadir) {
        totalHadir++;
        if (isVip) vipHadir++;
        else regulerHadir++;
      }

      // Render Baris Tabel
      const tr = document.createElement("tr");
      tr.className = "border-b hover:bg-gray-50";

      const statusBadge = isHadir 
        ? `<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">Hadir</span>`
        : `<span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Belum Datang</span>`;

      const kategoriBadge = isVip
        ? `<span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-bold">VIP</span>`
        : `<span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">Reguler</span>`;

      tr.innerHTML = `
        <td class="p-3 text-sm font-mono">${id}</td>
        <td class="p-3 text-sm font-semibold text-gray-800">${nama}</td>
        <td class="p-3 text-sm">${kategoriBadge}</td>
        <td class="p-3 text-sm">${rsvp}</td>
        <td class="p-3 text-sm">${statusBadge}</td>
        <td class="p-3 text-sm text-gray-500 font-mono">${waktuCheckin}</td>
      `;
      tbody.appendChild(tr);
    });

    // Ringkasan Kartu
    document.getElementById("totalTamu").innerText = totalTamu;
    document.getElementById("totalKonfirmasi").innerText = totalKonfirmasi;
    document.getElementById("totalHadir").innerText = totalHadir;
    document.getElementById("totalVipHadir").innerText = vipHadir;

    // Render Chart
    drawCharts(totalHadir, (totalTamu - totalHadir), vipHadir, regulerHadir);

  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }
}

function drawCharts(sudahHadir, belumHadir, vipHadir, regulerHadir) {
  const ctx1 = document.getElementById('chartKehadiran');
  const ctx2 = document.getElementById('chartKategori');

  if (!ctx1 || !ctx2) return;

  if (chart1) chart1.destroy();
  chart1 = new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: ['Sudah Hadir', 'Belum Datang'],
      datasets: [{
        data: [sudahHadir, belumHadir],
        backgroundColor: ['#22c55e', '#e5e7eb']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  if (chart2) chart2.destroy();
  chart2 = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: ['VIP Hadir', 'Reguler Hadir'],
      datasets: [{
        data: [vipHadir, regulerHadir],
        backgroundColor: ['#a855f7', '#3b82f6']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

loadDashboardData();
setInterval(loadDashboardData, 10000);
