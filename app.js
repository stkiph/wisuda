const API_URL = "https://script.google.com/macros/s/AKfycbxELFCp39E4seT_44DtaDomemP7j2D8viRZF68wUk5Jn89pDHUCwKyZYGdQcQAtsuYr/exec";

let chart1 = null;
let chart2 = null;

async function loadDashboardData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Format data yang diterima bukan array:", data);
      return;
    }

    let totalTamu = data.length;
    let totalKonfirmasi = 0;
    let totalHadir = 0;
    let vipHadir = 0;
    let regulerHadir = 0;

    const tbody = document.getElementById("tabelDataTamu");
    if (tbody) tbody.innerHTML = "";

    data.forEach(tamu => {
      // Pembacaan kunci object yang fleksibel
      const keys = Object.keys(tamu);
      const getKeyVal = (target) => {
        const foundKey = keys.find(k => k.trim().toLowerCase() === target.toLowerCase());
        return foundKey ? tamu[foundKey] : '';
      };

      const id = getKeyVal("ID_Tamu") || getKeyVal("id_tamu") || '-';
      const nama = getKeyVal("Nama") || getKeyVal("nama") || '-';
      const kategori = getKeyVal("Kategori") || getKeyVal("kategori") || 'Reguler';
      const rsvp = getKeyVal("Konfirmasi_RSVP") || getKeyVal("konfirmasi_rsvp") || '-';
      const statusHadir = getKeyVal("Status_Kehadiran") || getKeyVal("status_kehadiran") || 'Belum Datang';
      const waktuCheckin = getKeyVal("Waktu_Checkin") || getKeyVal("waktu_checkin") || '-';

      const isHadir = String(statusHadir).trim().toLowerCase() === "hadir";
      const isVip = String(kategori).trim().toUpperCase() === "VIP";

      if (String(rsvp).trim().toLowerCase() === "hadir") totalKonfirmasi++;
      if (isHadir) {
        totalHadir++;
        if (isVip) vipHadir++;
        else regulerHadir++;
      }

      if (tbody) {
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
      }
    });

    // Update Angka Ringkasan
    const elTotalTamu = document.getElementById("totalTamu");
    const elTotalKonfirmasi = document.getElementById("totalKonfirmasi");
    const elTotalHadir = document.getElementById("totalHadir");
    const elTotalVipHadir = document.getElementById("totalVipHadir");

    if (elTotalTamu) elTotalTamu.innerText = totalTamu;
    if (elTotalKonfirmasi) elTotalKonfirmasi.innerText = totalKonfirmasi;
    if (elTotalHadir) elTotalHadir.innerText = totalHadir;
    if (elTotalVipHadir) elTotalVipHadir.innerText = vipHadir;

    // Render Diagram
    drawCharts(totalHadir, (totalTamu - totalHadir), vipHadir, regulerHadir);

  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }
}
// Variable untuk menyimpan ID VVIP yang sudah disambut agar tidak muncul terus saat auto-refresh
let lastWelcomedId = "";

// Tambahkan logika ini di dalam loop data.forEach pada loadDashboardData():
const urlFoto = getKeyVal("URL_Foto") || getKeyVal("url_foto") || "https://via.placeholder.com/150";
const jabatan = getKeyVal("Jabatan") || getKeyVal("jabatan") || ""; // Opsional jika ada kolom Jabatan

// Jika Tamu VVIP/VIP dan baru saja Check-in
if (isVip && isHadir && id !== lastWelcomedId) {
  showVipWelcome(nama, jabatan, urlFoto);
  lastWelcomedId = id; // Simpan ID agar popup hanya muncul sekali
}

// Fungsi untuk Memunculkan & Menutup Banner
function showVipWelcome(nama, jabatan, foto) {
  document.getElementById("vipNama").innerText = nama;
  document.getElementById("vipJabatan").innerText = jabatan || "Tamu Kehormatan";
  document.getElementById("vipFoto").src = foto;
  
  const banner = document.getElementById("welcomeBanner");
  banner.classList.remove("hidden");

  // Otomatis menutup banner setelah 7 detik
  setTimeout(() => {
    closeWelcome();
  }, 7000);
}

function closeWelcome() {
  document.getElementById("welcomeBanner").classList.add("hidden");
}
function drawCharts(sudahHadir, belumHadir, vipHadir, regulerHadir) {
  const ctx1 = document.getElementById('chartKehadiran');
  const ctx2 = document.getElementById('chartKategori');

  if (!ctx1 || !ctx2 || typeof Chart === 'undefined') return;

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
