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
   - **Sales (RM)**: Sales amount in Malaysian Ringgit (entered manually per transaction and per day)
5. Enter your **Sales Target** and **Actual Sales** in the summary box
6. Everything else updates automatically — row and daily totals, the weekly **Total Pcs Sold** figures, and **Extra** / **Balance**
7. Click **Download as PDF** to export the form

### Passing the report to the next person

1. Finish your day and click **Download as PDF**
2. Send that PDF to whoever fills in the next day (WhatsApp, email, anything that keeps the file intact)
3. They open the form, click **Import from PDF** and pick the file
4. The whole week so far appears, on the right week — they add their day and export a fresh PDF for the person after them

The data travels inside the PDF itself, so no account, server or shared drive is needed. The PDF still prints and reads exactly as before.

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