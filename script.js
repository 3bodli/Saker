document.getElementById('paymentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const amount = document.getElementById('amount').value;

  // إرسال الطلب للـ backend لإنشاء عملية دفع
  const response = await fetch('https://YOUR_RENDER_BACKEND_URL/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });

  const data = await response.json();

  // فتح رابط الدفع (NOWPayments / CoinGate)
  if(data.paymentUrl) {
    window.open(data.paymentUrl, '_blank');
  } else {
    alert('Payment creation failed.');
  }
});