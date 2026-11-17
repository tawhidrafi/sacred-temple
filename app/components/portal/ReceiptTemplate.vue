<script setup lang="ts">
import { computed } from "vue";

interface ReceiptProps {
  receiptNumber?: string | null;
  donationRef: string;
  donorName: string;
  phone?: string | null;
  email?: string | null;
  categoryName: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string | null;
  issuedAt?: number | null;
  isAnonymous?: boolean;
  message?: string | null;
}

const props = defineProps<ReceiptProps>();

const formattedDate = computed(() => {
  const ts = props.issuedAt || Date.now();
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

const formatMethodName = (method: string): string => {
  switch (method) {
    case "offline_cash":
      return "Cash at Temple Counter";
    case "offline_bank":
      return "Bank Transfer";
    case "offline_mfs":
      return "bKash / Nagad (MFS)";
    default:
      return method;
  }
};
</script>

<template>
  <div class="receipt-container">
    <!-- Outer Ornamental Border -->
    <div class="receipt-inner">
      <!-- Temple Header -->
      <header class="receipt-header">
        <div class="temple-om-symbol">ॐ</div>
        <h1 class="temple-bn-title">শ্রী শ্রী গোলপাহাড় মহাশ্মশান কালী মন্দির</h1>
        <h2 class="temple-en-title">Golpahar Mohashoshan Kali Mandir</h2>
        <p class="temple-address">
          Golpahar, GEC Circle, Chattogram, Bangladesh • Established 1883
        </p>
        <div class="receipt-type-badge">
          OFFICIAL DONATION RECEIPT
        </div>
      </header>

      <!-- Receipt Meta Bar -->
      <div class="receipt-meta-bar">
        <div class="meta-item">
          <span class="meta-label">Receipt Number:</span>
          <strong class="meta-val highlight">{{ receiptNumber || 'REC-PENDING' }}</strong>
        </div>
        <div class="meta-item">
          <span class="meta-label">Donation Ref:</span>
          <span class="meta-val font-mono">{{ donationRef }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Date of Issuance:</span>
          <span class="meta-val">{{ formattedDate }}</span>
        </div>
      </div>

      <!-- Main Receipt Body -->
      <div class="receipt-body">
        <table class="receipt-details-table">
          <tbody>
            <tr>
              <th scope="row">Received with thanks from</th>
              <td class="bold-value">
                {{ isAnonymous ? 'Anonymous Devotee (শ্রীভক্ত)' : donorName }}
              </td>
            </tr>
            <tr v-if="phone && !isAnonymous">
              <th scope="row">Contact Number</th>
              <td>{{ phone }}</td>
            </tr>
            <tr v-if="email && !isAnonymous">
              <th scope="row">Email Address</th>
              <td>{{ email }}</td>
            </tr>
            <tr>
              <th scope="row">Donation Purpose / Seva</th>
              <td class="category-value">{{ categoryName }}</td>
            </tr>
            <tr>
              <th scope="row">Mode of Remittance</th>
              <td>{{ formatMethodName(paymentMethod) }}</td>
            </tr>
            <tr v-if="transactionReference">
              <th scope="row">Transaction / Slip Ref</th>
              <td class="font-mono">{{ transactionReference }}</td>
            </tr>
            <tr v-if="message">
              <th scope="row">Devotee Dedication / Prayer</th>
              <td class="prayer-value">{{ message }}</td>
            </tr>
            <tr class="amount-row">
              <th scope="row">Total Amount Received</th>
              <td class="amount-cell">
                <span class="bdt-amount">৳ {{ amount.toLocaleString() }} BDT</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Blessing & Authorized Signature -->
      <footer class="receipt-footer">
        <div class="blessing-quote">
          <p class="bn-mantra">
            "ওঁ ক্রীং কাল্যৈ নমঃ • মায়ের কৃপায় আপনার ও আপনার পরিবারের সর্বাঙ্গীন মঙ্গল ও শান্তি বর্ষিত হোক।"
          </p>
          <p class="en-blessing">
            May Sri Sri Karunamoyi Kali bestow divine peace, health, and prosperity upon your family.
          </p>
        </div>

        <div class="signature-section">
          <div class="seal-placeholder">
            <div class="seal-inner">
              <span>MANDIR</span>
              <span>SEAL</span>
            </div>
          </div>
          <div class="sig-line">
            <div class="line"></div>
            <span class="sig-title">Authorized Signatory</span>
            <span class="sig-sub">Temple Management Committee</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.receipt-container {
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  max-width: 760px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.receipt-inner {
  border: 2px solid #7f1d2d;
  border-radius: 8px;
  padding: 2.5rem 2rem;
  position: relative;
  background-color: #fffdfa;
}

/* Header */
.receipt-header {
  text-align: center;
  border-bottom: 2px solid #fed7aa;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
}

.temple-om-symbol {
  font-size: 2.25rem;
  color: #d97706;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.temple-bn-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #7f1d2d;
  margin: 0 0 0.25rem 0;
}

.temple-en-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #292524;
  margin: 0 0 0.25rem 0;
  letter-spacing: 0.02em;
}

.temple-address {
  font-size: 0.8125rem;
  color: #78716c;
  margin: 0 0 1rem 0;
}

.receipt-type-badge {
  display: inline-block;
  padding: 0.25rem 1.25rem;
  font-size: 0.8125rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #7f1d2d;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 20px;
}

/* Meta Bar */
.receipt-meta-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #faf7f0;
  border: 1px solid #e7e5e4;
  border-radius: 6px;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.meta-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #78716c;
  letter-spacing: 0.05em;
}

.meta-val {
  font-size: 0.875rem;
  font-weight: 600;
  color: #292524;
}

.meta-val.highlight {
  color: #7f1d2d;
  font-weight: 800;
}

.font-mono {
  font-family: monospace;
}

/* Details Table */
.receipt-details-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}

.receipt-details-table th,
.receipt-details-table td {
  padding: 0.75rem 0.5rem;
  font-size: 0.9375rem;
  border-bottom: 1px solid #f5f5f4;
  text-align: left;
}

.receipt-details-table th {
  width: 38%;
  color: #57534e;
  font-weight: 500;
}

.receipt-details-table td {
  color: #292524;
}

.bold-value {
  font-weight: 700;
  font-size: 1.0625rem;
  color: #7f1d2d;
}

.category-value {
  font-weight: 600;
  color: #b45309;
}

.prayer-value {
  font-style: italic;
  color: #44403c;
  line-height: 1.4;
}

.amount-row th,
.amount-row td {
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 2px solid #7f1d2d;
  border-top: 2px solid #7f1d2d;
}

.amount-row th {
  font-weight: 700;
  font-size: 1.0625rem;
  color: #292524;
}

.amount-cell {
  text-align: right;
}

.bdt-amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: #7f1d2d;
}

/* Footer & Signatures */
.receipt-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
  margin-top: 1rem;
}

@media (max-width: 640px) {
  .receipt-footer {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

.blessing-quote {
  flex: 1;
}

.bn-mantra {
  font-size: 0.875rem;
  font-weight: 600;
  color: #7f1d2d;
  margin: 0 0 0.25rem 0;
  line-height: 1.4;
}

.en-blessing {
  font-size: 0.75rem;
  color: #78716c;
  margin: 0;
}

.signature-section {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
}

.seal-placeholder {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 1.5px dashed #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seal-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.625rem;
  font-weight: 700;
  color: #d97706;
  letter-spacing: 0.05em;
  line-height: 1.1;
}

.sig-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 150px;
}

.sig-line .line {
  width: 100%;
  height: 1px;
  background-color: #292524;
  margin-bottom: 0.375rem;
}

.sig-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #292524;
}

.sig-sub {
  font-size: 0.6875rem;
  color: #78716c;
}

/* Print Styles */
@media print {
  .receipt-container {
    box-shadow: none;
    padding: 0;
    max-width: 100%;
  }

  .receipt-inner {
    border: 2px solid #000000;
    background-color: #ffffff;
  }
}
</style>
