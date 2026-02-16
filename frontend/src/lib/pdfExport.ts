import type { Booking } from '../types';

export async function generateBookingPdf(booking: Booking): Promise<void> {
  const html2pdf = (await import('html2pdf.js')).default;

  const container = document.createElement('div');
  container.style.cssText = 'font-family: Helvetica, sans-serif; padding: 40px; max-width: 600px;';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'text-align: center; margin-bottom: 30px;';
  const h1 = document.createElement('h1');
  h1.style.cssText = 'color: #1152d4; font-size: 24px; margin: 0;';
  h1.textContent = 'Grand Hotel';
  const subtitle = document.createElement('p');
  subtitle.style.cssText = 'color: #666; font-size: 12px;';
  subtitle.textContent = 'Booking Confirmation';
  header.append(h1, subtitle);

  // Reference ID
  const refBox = document.createElement('div');
  refBox.style.cssText = 'border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;';
  const refLabel = document.createElement('p');
  refLabel.style.cssText = 'font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;';
  refLabel.textContent = 'Reference ID';
  const refValue = document.createElement('p');
  refValue.style.cssText = 'font-size: 18px; font-weight: bold; margin: 0;';
  refValue.textContent = `#${booking.id.slice(0, 8).toUpperCase()}`;
  refBox.append(refLabel, refValue);

  // Details table
  const table = document.createElement('table');
  table.style.cssText = 'width: 100%; border-collapse: collapse;';
  const rows = [
    ['Room Type', booking.roomType],
    ['Check-in', booking.checkIn],
    ['Check-out', booking.checkOut],
    ['Guest', booking.guestName],
  ];
  for (const [label, value] of rows) {
    const tr = document.createElement('tr');
    const tdLabel = document.createElement('td');
    tdLabel.style.cssText = 'padding: 8px 0; color: #666;';
    tdLabel.textContent = label;
    const tdValue = document.createElement('td');
    tdValue.style.cssText = 'padding: 8px 0; font-weight: 600; text-align: right;';
    tdValue.textContent = value;
    tr.append(tdLabel, tdValue);
    table.appendChild(tr);
  }
  // Total row
  const totalTr = document.createElement('tr');
  totalTr.style.cssText = 'border-top: 1px solid #e5e7eb;';
  const totalLabel = document.createElement('td');
  totalLabel.style.cssText = 'padding: 12px 0; font-weight: bold;';
  totalLabel.textContent = 'Total Amount';
  const totalValue = document.createElement('td');
  totalValue.style.cssText = 'padding: 12px 0; font-weight: bold; text-align: right; color: #1152d4;';
  totalValue.textContent = `$${booking.totalAmount.toFixed(2)}`;
  totalTr.append(totalLabel, totalValue);
  table.appendChild(totalTr);

  // Payment badge
  const badge = document.createElement('div');
  badge.style.cssText = 'margin-top: 30px; padding: 12px; background: #f0fdf4; border-radius: 8px; text-align: center;';
  const badgeText = document.createElement('p');
  badgeText.style.cssText = 'color: #16a34a; font-size: 12px; font-weight: bold; margin: 0;';
  badgeText.textContent = 'PAID VIA CREDIT CARD';
  badge.appendChild(badgeText);

  // Footer
  const footer = document.createElement('p');
  footer.style.cssText = 'text-align: center; color: #999; font-size: 10px; margin-top: 30px;';
  footer.textContent = 'Grand Hotel - Thank you for your reservation';

  container.append(header, refBox, table, badge, footer);

  await html2pdf()
    .from(container)
    .set({
      margin: 10,
      filename: `booking-${booking.id.slice(0, 8)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .save();
}
