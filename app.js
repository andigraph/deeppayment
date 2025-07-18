
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: 'https://andigraph.github.io/deeppayment/tonconnect-manifest.json',
  buttonRootId: 'connect-wallet-btn'
});

let connectedWallet = null;

async function connectWallet() {
  try {
    await tonConnect.restoreConnection();
    if (!tonConnect.connected) {
      await tonConnect.connectWallet();
    }
    connectedWallet = tonConnect.account?.address;
    if (connectedWallet) {
      document.getElementById("status").textContent = "Wallet terhubung: " + connectedWallet;
    } else {
      document.getElementById("status").textContent = "Gagal menghubungkan wallet.";
    }
  } catch (err) {
    document.getElementById("status").textContent = "Gagal koneksi wallet.";
    console.error(err);
  }
}

  async function handleBayar() {
    const connectedWallet = await tonConnectUI.connectedWallet();

    if (!connectedWallet?.account?.address) {
      document.getElementById("status").textContent = "Harap hubungkan wallet terlebih dahulu.";
      return;
    }

    const walletAddress = connectedWallet.account.address;
    document.getElementById("status").textContent = "Mengalihkan ke Tonkeeper...";

    // Simpan status transaksi ke Google Sheets
    await fetch("https://script.google.com/macros/s/AKfycbx-sOgpMhPreDOCH6uqaHT5PB15f-AYhMgR7p4fNB9iClu2V9e7Leu7-jqJvyZl1yDT-g/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: walletAddress,
        amount: "0.5 TON",
        status: "Pending"
      })
    });

    // Redirect langsung ke link Tonkeeper
    const paymentUrl = "https://wallet.tonkeeper.com/transfer/0QCzyrSNbHbash569LIGTG_UcgZoJWRtnpljEQbLW_qyA0Of?amount=500000000";
    window.open(paymentUrl, "_blank");
  }

  try {
    await tonConnectUI.sendTransaction(tx);
    document.getElementById('status').textContent = "Menunggu konfirmasi transaksi...";
    setTimeout(verifyPayment, 15000);
  } catch (err) {
    document.getElementById('status').textContent = "Transaksi dibatalkan atau gagal.";
    console.error(err);
  }
}

async function verifyPayment() {
  try {
    const res = await fetch("https://toncenter.com/api/v2/getTransactions?address=0QCzyrSNbHbash569LIGTG_UcgZoJWRtnpljEQbLW_qyA0Of&limit=10");
    const json = await res.json();
    const tx = json.result.find(tx => tx.in_msg?.source === connectedWallet && parseInt(tx.in_msg.value) >= 490000000);

    if (tx) {
      document.getElementById('status').textContent = "Pembayaran ditemukan ✅";
      await fetch("https://script.google.com/macros/s/AKfycbx-sOgpMhPreDOCH6uqaHT5PB15f-AYhMgR7p4fNB9iClu2V9e7Leu7-jqJvyZl1yDT-g/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: connectedWallet, amount: "0.5 TON", status: "Success" })
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
  if (!connectedWallet) return;
  fetch("https://script.google.com/macros/s/AKfycbx-sOgpMhPreDOCH6uqaHT5PB15f-AYhMgR7p4fNB9iClu2V9e7Leu7-jqJvyZl1yDT-g/exec?wallet=" + connectedWallet)
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
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    document.getElementById('user-name').textContent = tg.initDataUnsafe.user?.first_name || "Pengguna";
  }
};
