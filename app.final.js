function handleBayar() {
  const walletAddress = Telegram.WebApp.initDataUnsafe.user?.id || "unknown";
  const tonURL = "https://wallet.ton.org/transfer/EQCd123abc456...?amount=500000000";

  document.getElementById('status').textContent = "Mengalihkan ke dompet...";

  // Simpan transaksi ke Google Sheets
  fetch("https://script.google.com/macros/s/AKfycbx-sOgpMhPreDOCH6uqaHT5PB15f-AYhMgR7p4fNB9iClu2V9e7Leu7-jqJvyZl1yDT-g/exec", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      wallet: walletAddress,
      amount: "0.5 TON",
      status: "Pending"
    })
  }).then(() => {
    window.open(tonURL, "_blank");
  }).catch(err => {
    document.getElementById('status').textContent = "Gagal menyimpan data transaksi.";
    console.error(err);
  });
}

function checkStatus() {
  const walletAddress = Telegram.WebApp.initDataUnsafe.user?.id || "unknown";
  fetch("https://script.google.com/macros/s/AKfycbx-sOgpMhPreDOCH6uqaHT5PB15f-AYhMgR7p4fNB9iClu2V9e7Leu7-jqJvyZl1yDT-g/exec?wallet=" + walletAddress)
    .then(res => res.json())
    .then(data => {
      const status = data.status || "Belum ada pembayaran";
      document.getElementById('status').textContent = "Status pembayaran: " + status;
    })
    .catch(err => {
      document.getElementById('status').textContent = "Gagal memuat status.";
      console.error(err);
    });
}

window.onload = () => {
  if (window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    document.getElementById('user-name').textContent = tg.initDataUnsafe.user?.first_name || "Pengguna";
    checkStatus(); // otomatis cek status saat dibuka
  }
};