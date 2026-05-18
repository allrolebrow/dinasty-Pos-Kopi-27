// =============================================
//  DYNASTY POS KOPI 27 - Google Apps Script
//  Copy-paste ke Google Apps Script Editor
//  script.google.com
// =============================================

// ID Google Spreadsheet kamu - isi setelah buat spreadsheet baru
const SPREADSHEET_ID = 'ISI_ID_SPREADSHEET_KAMU_DISINI';

// Nama sheet
const SHEET_TRANSAKSI = 'Transaksi';
const SHEET_REKAP_HARIAN = 'Rekap Harian';
const SHEET_MENU_TERLARIS = 'Menu Terlaris';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'addTransaction') {
      return addTransaction(data.data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Dynasty POS API Active ✅' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function addTransaction(trx) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // ===== SHEET: TRANSAKSI =====
  let sheet = ss.getSheetByName(SHEET_TRANSAKSI);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_TRANSAKSI);
    // Header
    sheet.getRange(1, 1, 1, 15).setValues([[
      'ID Transaksi', 'Tanggal', 'Jam', 'Kasir', 
      'Item Dibeli', 'Jumlah Item', 
      'Subtotal', 'Diskon (%)', 'Total Penjualan',
      'HPP / Modal', 'Keuntungan',
      'Metode Bayar', 'Catatan', 'Status Sync', 'Detail Item'
    ]]);
    // Format header
    const headerRange = sheet.getRange(1, 1, 1, 15);
    headerRange.setBackground('#1a1a1a');
    headerRange.setFontColor('#D4A017');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(10);
    sheet.setFrozenRows(1);
    
    // Column widths
    sheet.setColumnWidth(1, 130);
    sheet.setColumnWidth(2, 90);
    sheet.setColumnWidth(3, 60);
    sheet.setColumnWidth(4, 100);
    sheet.setColumnWidth(5, 250);
    sheet.setColumnWidth(6, 80);
    sheet.setColumnWidth(7, 110);
    sheet.setColumnWidth(8, 70);
    sheet.setColumnWidth(9, 110);
    sheet.setColumnWidth(10, 110);
    sheet.setColumnWidth(11, 110);
    sheet.setColumnWidth(12, 90);
    sheet.setColumnWidth(13, 120);
  }
  
  const lastRow = sheet.getLastRow() + 1;
  sheet.getRange(lastRow, 1, 1, 15).setValues([[
    trx.id,
    trx.date,
    trx.time,
    trx.kasir,
    trx.items,
    trx.itemCount,
    trx.subtotal,
    trx.discount,
    trx.total,
    trx.cost,
    trx.profit,
    trx.payMethod,
    trx.note,
    '✅ Synced',
    trx.details
  ]]);
  
  // Format currency cells
  const currRange = sheet.getRange(lastRow, 7, 1, 5);
  currRange.setNumberFormat('"Rp "#,##0');
  
  // Alternating row colors
  if (lastRow % 2 === 0) {
    sheet.getRange(lastRow, 1, 1, 15).setBackground('#f9f6ee');
  }
  
  // ===== SHEET: REKAP HARIAN =====
  updateRekapHarian(ss, trx);
  
  // ===== SHEET: MENU TERLARIS =====
  updateMenuTerlaris(ss, trx);
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, row: lastRow }))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateRekapHarian(ss, trx) {
  let sheet = ss.getSheetByName(SHEET_REKAP_HARIAN);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_REKAP_HARIAN);
    sheet.getRange(1, 1, 1, 8).setValues([[
      'Tanggal', 'Total Transaksi', 'Total Item Terjual',
      'Total Omset', 'Total Modal/HPP', 'Total Keuntungan',
      'Margin (%)', 'Metode Bayar Terbanyak'
    ]]);
    const headerRange = sheet.getRange(1, 1, 1, 8);
    headerRange.setBackground('#1a1a1a');
    headerRange.setFontColor('#D4A017');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 100);
    sheet.setColumnWidth(2, 110);
    sheet.setColumnWidth(3, 110);
    sheet.setColumnWidth(4, 130);
    sheet.setColumnWidth(5, 130);
    sheet.setColumnWidth(6, 130);
    sheet.setColumnWidth(7, 90);
    sheet.setColumnWidth(8, 150);
  }
  
  // Check if date row exists
  const data = sheet.getDataRange().getValues();
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === trx.date) { rowIdx = i + 1; break; }
  }
  
  if (rowIdx === -1) {
    // New day
    const newRow = sheet.getLastRow() + 1;
    sheet.getRange(newRow, 1, 1, 8).setValues([[
      trx.date, 1, trx.itemCount,
      trx.total, trx.cost, trx.profit,
      trx.total > 0 ? Math.round(trx.profit / trx.total * 100) : 0,
      trx.payMethod
    ]]);
    sheet.getRange(newRow, 4, 1, 3).setNumberFormat('"Rp "#,##0');
    sheet.getRange(newRow, 7).setNumberFormat('0"%"');
  } else {
    // Update existing
    const row = data[rowIdx - 1];
    const newTrx = row[1] + 1;
    const newItems = row[2] + trx.itemCount;
    const newOmset = row[3] + trx.total;
    const newModal = row[4] + trx.cost;
    const newProfit = row[5] + trx.profit;
    const newMargin = newOmset > 0 ? Math.round(newProfit / newOmset * 100) : 0;
    
    sheet.getRange(rowIdx, 2, 1, 6).setValues([[
      newTrx, newItems, newOmset, newModal, newProfit, newMargin
    ]]);
  }
}

function updateMenuTerlaris(ss, trx) {
  let sheet = ss.getSheetByName(SHEET_MENU_TERLARIS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_MENU_TERLARIS);
    sheet.getRange(1, 1, 1, 5).setValues([[
      'Nama Menu', 'Total Terjual', 'Total Pendapatan', 'Total Modal', 'Total Keuntungan'
    ]]);
    const headerRange = sheet.getRange(1, 1, 1, 5);
    headerRange.setBackground('#1a1a1a');
    headerRange.setFontColor('#D4A017');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  const details = JSON.parse(trx.details || '[]');
  const data = sheet.getDataRange().getValues();
  
  details.forEach(item => {
    let rowIdx = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === item.name) { rowIdx = i + 1; break; }
    }
    
    const itemProfit = (item.price - item.cost) * item.qty;
    
    if (rowIdx === -1) {
      const newRow = sheet.getLastRow() + 1;
      sheet.getRange(newRow, 1, 1, 5).setValues([[
        item.name, item.qty, item.subtotal, item.cost * item.qty, itemProfit
      ]]);
      sheet.getRange(newRow, 3, 1, 3).setNumberFormat('"Rp "#,##0');
    } else {
      const row = data[rowIdx - 1];
      sheet.getRange(rowIdx, 2, 1, 4).setValues([[
        row[1] + item.qty,
        row[2] + item.subtotal,
        row[3] + item.cost * item.qty,
        row[4] + itemProfit
      ]]);
    }
  });
  
  // Sort by total sold (descending)
  if (sheet.getLastRow() > 2) {
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5);
    dataRange.sort({ column: 2, ascending: false });
  }
}

// ===== SETUP FUNCTION =====
// Jalankan fungsi ini SATU KALI untuk setup spreadsheet
function setupSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Rename Sheet1 to Transaksi
  const defaultSheet = ss.getSheets()[0];
  defaultSheet.setName(SHEET_TRANSAKSI);
  
  // Create summary sheet
  let summarySheet = ss.getSheetByName('Ringkasan');
  if (!summarySheet) {
    summarySheet = ss.insertSheet('Ringkasan', 0);
  }
  
  summarySheet.clear();
  summarySheet.getRange('A1').setValue('DYNASTY POS KOPI 27');
  summarySheet.getRange('A1').setFontSize(20);
  summarySheet.getRange('A1').setFontWeight('bold');
  summarySheet.getRange('A1').setFontColor('#D4A017');
  
  summarySheet.getRange('A2').setValue('Dashboard Penjualan Otomatis');
  summarySheet.getRange('A2').setFontColor('#666');
  
  summarySheet.getRange('A4').setValue('Sheet "Transaksi" = Semua transaksi detail');
  summarySheet.getRange('A5').setValue('Sheet "Rekap Harian" = Omset & profit per hari');
  summarySheet.getRange('A6').setValue('Sheet "Menu Terlaris" = Ranking penjualan tiap menu');
  
  Logger.log('Setup selesai! Spreadsheet ID: ' + SPREADSHEET_ID);
}
