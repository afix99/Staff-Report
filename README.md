# Weekly Jersey Sales & Point Record

A web-based form for tracking weekly jersey sales and point records. This application allows you to record sales data for each day of the week and automatically calculate totals and summaries.

## Features

- **Week Picker**: Choose the week's starting date and the eight day rows relabel themselves automatically
- **Daily Sales Tracking**: Record sales data for up to 2 staff members per day across 8 days
- **Running Totals Bar**: A bar pinned to the top of the screen shows Target, Actual, Total Pcs and the Extra/Balance difference while you scroll
- **Faster Entry**:
  - Arrow keys and Enter move between cells, staying in the same column vertically
  - Paste a block of cells straight from Excel or Google Sheets
  - Staff names you have already typed are offered as autocomplete suggestions
  - **Copy names** pulls the previous day's staff names into the next day
- **Reconciliation Check**: If a day's TOTAL Sales figure doesn't match the sum of that day's rows, the cell is highlighted in red
- **Earnings Per Row**: The Sales column reads `RM 256 / RM 14` — you type the actual sale, and the second figure is what that row earns: RM0.60 a piece once the day qualifies, plus the point reward on top
- **Automatic Calculations**: 
  - Calculates total pieces sold per transaction
  - Calculates total points based on quantity (3-point, 2-point, 1-point items)
  - Daily totals for pieces and points
  - Weekly Total Pcs Sold figures, accumulated across all eight days
  - Extra / Balance, derived from your Sales Target and Actual Sales
- **Manual Sales Entry**: Sales (RM) figures — per transaction and per day, plus Sales Target and Actual Sales — are entered by hand rather than auto-summed, so staff can reconcile against till receipts
- **Forgiving Number Entry**: Amounts written with thousands separators or currency text (`10,500`, `RM 10 500`) are read correctly
- **PDF Export**: Download the completed form as a PDF file
- **Hand Off Between People**: The exported PDF quietly carries the week's figures inside it. Send it to whoever is on duty next and they click **Import from PDF** to load everything already entered, then just add their own day — nobody retypes the earlier days
- **Clean Interface**: Professional design with a navy and red color scheme
- **Automatic Local Save**: Everything typed into the sheet is stored in the browser as you go, so a refresh, a closed tab or an accidental back button doesn't lose the week's work. Each week is saved separately, so switching weeks with the picker keeps both
- **Responsive Design**: Works on desktop, tablet and phone. The PDF is always captured at the sheet's full design width, so the exported page looks the same whichever device it was filled in on

## How to Use

1. Open `index.html` in a web browser
2. Set **Week starting** to the first day of the week (it defaults to this week's Monday)
3. Fill in the outlet name and team leader information
4. Enter staff names and sales data for each day:
   - **3-Point Qty**: Number of 3-point items sold
   - **2-Point Qty**: Number of 2-point items sold
   - **1-Point Qty**: Number of 1-point items sold
   - **Sales (RM) / Earnings**: type the actual sale amount; the figure after the slash is the piece commission plus point reward for that row
5. Enter your **Sales Target** and **Actual Sales** in the summary box
6. Everything else updates automatically — row and daily totals, the weekly **Total Pcs Sold** figures, and **Extra** / **Balance**
7. Click **Download as PDF** to export the form

### Passing the report to the next person

1. Finish your day and click **Download as PDF**
2. Send that PDF to whoever fills in the next day (WhatsApp, email, anything that keeps the file intact)
3. They open the form, click **Import from PDF** and pick the file
4. The whole week so far appears, on the right week — they add their day and export a fresh PDF for the person after them

The data travels inside the PDF itself, so no account, server or shared drive is needed. The PDF still prints and reads exactly as before.

## Earnings Rules

From the Lokalteez *New Points Commission* team briefing, August 2026. The sheet is configured for **Tier 2** outlets, and treats **Friday, Saturday and Sunday** as weekend.

**Points per piece**, from the hanger price card — black hanger `1`, grey & gold hanger `2`, Merdeka Special `3`. Free items are excluded.

Everything below is worked out **per staff member, per day**. The figure after the slash in the Sales column is the two parts added together.

### 1. Piece commission — RM0.60 a piece

Paid only once the day reaches the qualifying piece count:

| | Pieces needed |
| --- | --- |
| Weekday (Mon–Thu) | 10 pieces |
| Weekend (Fri–Sun) | 15 pieces |

Once the day qualifies, **every** piece pays RM0.60 — including the ones above the threshold, with no second block to reach. So 10 pieces on a weekday pays RM6.00 and 11 pieces pays RM6.60. Below the threshold it pays nothing.

### 2. Point reward — paid on top

| Weekday (Mon–Thu) | Weekend (Fri–Sun) |
| --- | --- |
| 15 points → RM8 | 25 points → RM18 |
| 25 points → RM18 | 35 points → RM28 |
| 35 points → RM28 | 45 points → RM38 |

The reward holds at the highest threshold reached, so selling more can never pay less than selling fewer. The point reward does **not** depend on qualifying for the piece commission — a staff member on 5 pieces with 15 points still earns the RM8.

### Worked example

10 pieces and 15 points on a weekday: RM6.00 piece commission + RM8 point reward = **RM14**, matching the briefing's own example on page 6.

The date decides which column applies, so weekend days are tinted and show their day name. Each row is worked out from its own pieces and points, because staff qualify separately — the day's TOTAL row shows those earnings added together.

## File Structure

- `index.html` - Main HTML structure and styling
- `script.js` - JavaScript for calculations and PDF generation
- `README.md` - This file

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- [html2canvas](https://html2canvas.hertzen.com/) - For canvas rendering
- [jsPDF](https://github.com/parallax/jsPDF) - For PDF generation

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Notes

- All currency values are in Malaysian Ringgit (RM)
- Each week runs for 8 days from the date chosen in the picker, with 2 staff entries per day
- Your entries are saved automatically in the browser on the device you filled them in on, so refreshing or closing the page will not lose them. Each week has its own saved copy, keyed on the starting date. **Clear All** erases the saved copy for the week currently shown
- The saved copy is per-device and per-browser: it is not synced, and clearing your browser's site data removes it. Export the PDF for anything you need to keep or share
- Importing a PDF **replaces** what is on screen for that week, rather than merging into it, so the sheet ends up matching the PDF exactly. You are asked to confirm first
- Only PDFs exported by this form can be imported. One saved before this feature existed, or produced by any other program, has no data to read
- Send the PDF as a file/document. Anything that turns it into a picture first (for example printing and rescanning it) drops the embedded data