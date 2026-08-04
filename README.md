# Weekly Jersey Sales & Point Record

A web-based form for tracking weekly jersey sales and point records. This application allows you to record sales data for each day of the week and automatically calculate totals and summaries.

## Features

- **Daily Sales Tracking**: Record sales data for up to 2 staff members per day across 8 days
- **Automatic Calculations**: 
  - Calculates total pieces sold per transaction
  - Calculates total points based on quantity (3-point, 2-point, 1-point items)
  - Daily totals
  - Weekly summaries
- **Sales Target Tracking**: Set and track sales targets with automatic calculation of surplus/deficit
- **PDF Export**: Download the completed form as a PDF file
- **Clean Interface**: Professional design with a navy and red color scheme
- **Responsive Design**: Works on desktop and tablet devices

## How to Use

1. Open `index.html` in a web browser
2. Fill in the outlet name and team leader information
3. Update the week title if needed
4. Enter staff names and sales data for each day:
   - **3-Point Qty**: Number of 3-point items sold
   - **2-Point Qty**: Number of 2-point items sold
   - **1-Point Qty**: Number of 1-point items sold
   - **Sales (RM)**: Sales amount in Malaysian Ringgit
5. Set your **Sales Target** in the summary box
6. All totals and calculations will update automatically
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