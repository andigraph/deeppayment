function handleBayar() {
  const tonURL = "https://wallet.ton.org/transfer/EQCd123abc456...?amount=500000000";
  document.getElementById('status').textContent = "Mengalihkan ke dompet...";
  window.open(tonURL, "_blank");
}
window.onload = () => {
  if (window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    document.getElementById('user-name').textContent = tg.initDataUnsafe.user?.first_name || "Pengguna";
  }
};
