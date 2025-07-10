function handleBayar() {
  const walletAddress = Telegram.WebApp.initDataUnsafe.user?.id || "unknown";
  const tonURL = "https://wallet.ton.org/transfer/UQDbqcFDvWYejLZFvaKd0geHIGd2jhi412aR-A5QVfxDBk7u?amount=500000000";

  document.getElementById('status').textContent = "Mengalihkan ke dompet...";

  fetch("https://script.google.com/macros/s/AKfycbx-sOgpMhPreDOCH6uqaHT5PB15f-AYhMgR7p4fNB9iClu2V9e7Leu7-jqJvyZl1yDT-g/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

async function verifyPayment() {
  const walletAddress = Telegram.WebApp.initDataUnsafe.user?.id || "unknown";

  try {
    const res = await fetch("https://toncenter.com/api/v2/getTransactions?address=UQDbqcFDvWYejLZFvaKd0geHIGd2jhi412aR-A5QVfxDBk7u&limit=10");
    const json = await res.json();

    const tx = json.result.find(tx =>
      tx.in_msg?.source === walletAddress &&
      parseInt(tx.in_msg.value) >= 490000000
    );

    if (tx) {
      document.getElementById('status').textContent = "Pembayaran ditemukan ✅";

      await fetch("https://script.google.com/macros/s/AKfycbx-sOgpMhPreDOCH6uqaHT5PB15f-AYhMgR7p4fNB9iClu2V9e7Leu7-jqJvyZl1yDT-g/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: walletAddress,
          amount: "0.5 TON",
          status: "Success"
        })
      });
    } else {
      document.getElementById('status').textContent = "Belum ada pembayaran yang terdeteksi.";
    }
  } catch (err) {
    document.getElementById('status').textContent = "Gagal verifikasi pembayaran.";
    console.error(err);
  }
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
    checkStatus();
  }
};
