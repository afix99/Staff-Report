# Weekly Jersey Sales & Point Record

A web-based form for tracking weekly jersey sales and point records. This application allows you to record sales data for each day of the week and automatically calculate totals and summaries.

## Features

- **Daily Sales Tracking**: Record sales data for up to 2 staff members per day across 8 days
- **Automatic Calculations**: 
  - Calculates total pieces sold per transaction
  - Calculates total points based on quantity (3-point, 2-point, 1-point items)
  - Daily totals for pieces and points
  - Weekly Total Pcs Sold figures, accumulated across all eight days
  - Extra / Balance, derived from your Sales Target and Actual Sales
- **Manual Sales Entry**: Sales (RM) figures — per transaction and per day, plus Sales Target and Actual Sales — are entered by hand rather than auto-summed, so staff can reconcile against till receipts
- **Forgiving Number Entry**: Amounts written with thousands separators or currency text (`10,500`, `RM 10 500`) are read correctly
- **PDF Export**: Download the completed form as a PDF file
- **Clean Interface**: Professional design with a navy and red color scheme
- **Responsive Design**: Works on desktop, tablet and phone. The PDF is always captured at the sheet's full design width, so the exported page looks the same whichever device it was filled in on

## How to Use

1. Open `index.html` in a web browser
2. Fill in the outlet name and team leader information
3. Update the week title if needed
4. Enter staff names and sales data for each day:
   - **3-Point Qty**: Number of 3-point items sold
   - **2-Point Qty**: Number of 2-point items sold
   - **1-Point Qty**: Number of 1-point items sold
   - **Sales (RM)**: Sales amount in Malaysian Ringgit (entered manually per transaction and per day)
5. Enter your **Sales Target** and **Actual Sales** in the summary box
6. Everything else updates automatically — row and daily totals, the weekly **Total Pcs Sold** figures, and **Extra** / **Balance**
7. Click **Download as PDF** to export the form

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
- The form is pre-configured for an 8-day week (2 Aug - 9 Aug) with 2 staff entries per day
- Data is not automatically saved; save your work using the PDF export feature