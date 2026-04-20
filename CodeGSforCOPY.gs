// ==========================================
// CONFIGURATION v7 (All-in-One System) - STITCH DESIGN
// ==========================================
const SPREADSHEET_ID = '1KLJMaZ3eLrgijBcPzDxNOsjvJBcvke1v8Fk-KvM8Yaw'; 
const SLIP_FOLDER_ID = '1iZN5-ILCCqRUltRpGzvWwXYqo6dqocEL'; 
const ADMIN_PASSWORD = '12399';

function checkAdminAuth(params) {
  return params && params.password === ADMIN_PASSWORD;
}

function doGet(e) {
  const action = e.parameter.action;
  const lineId = e.parameter.lineId;
  
  if (action === 'getDashboard') return responseJSON({ status: 'success', data: getDashboardData(lineId) });
  if (action === 'getAdminData') {
    if (!checkAdminAuth(e.parameter)) return responseJSON({ status: 'error', message: 'Unauthorized' });
    return responseJSON({ status: 'success', data: getAdminData() });
  }
  return ContentService.createTextOutput("🔐 API v7 STITCH Online");
}

function doPost(e) {
  const headers = { "Access-Control-Allow-Origin": "*" };
  try {
    const payload = JSON.parse(e.postData.contents);
    if (payload.action !== 'createOrder' && !checkAdminAuth(payload)) {
      return responseJSON({ status: 'error', message: 'Unauthorized' }, headers);
    }
    
    if (payload.action === 'createOrder') return responseJSON({ status: 'success', data: createOrder(payload.data) }, headers);
    if (payload.action === 'updateStatus') return responseJSON({ status: 'success', data: updateStatus(payload.data) }, headers);
    if (payload.action === 'manageProduct') return responseJSON({ status: 'success', data: manageProduct(payload.data) }, headers);
    if (payload.action === 'setDailyMenu') return responseJSON({ status: 'success', data: setDailyMenu(payload.data) }, headers);
  } catch (error) {
    return responseJSON({ status: 'error', message: error.toString() }, headers);
  }
}

// --- รอบการขาย (16.00 น. วันก่อน ถึง 16.00 น. วันนี้) ---
function getCycleStart() {
  const now = new Date();
  let cycleStart = new Date(now);
  if (now.getHours() < 16) {
    cycleStart.setDate(cycleStart.getDate() - 1);
  }
  cycleStart.setHours(16, 0, 0, 0);
  return cycleStart;
}

// --- สรุปข้อมูลหน้าบ้าน (Dashboard & My Orders) ---
function getDashboardData(lineId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const pmSheet = ss.getSheetByName('seller (1)') || ss.getSheets()[0];
  const orderSheet = ss.getSheetByName('orderz') || ss.getSheets()[1];
  
  const pmData = pmSheet.getDataRange().getValues();
  const orderData = orderSheet.getDataRange().getValues();
  const cycleStart = getCycleStart();
  const cycleEnd = new Date(cycleStart);
  cycleEnd.setDate(cycleEnd.getDate() + 1);
  
  let bookings = {}; 
  let myOrders = [];

  for (let i = 1; i < orderData.length; i++) {
    const rowDate = new Date(orderData[i][1]);
    const prodName = orderData[i][3];
    const qty = parseInt(orderData[i][4]) || 0;
    const customer = orderData[i][2];
    const currentLineId = orderData[i][8];

    // เช็คออเดอร์ในรอบ 16.00 เป็นต้นไป
    if (rowDate >= cycleStart) {
      if (!bookings[prodName]) bookings[prodName] = { totalQty: 0, buyers: [] };
      bookings[prodName].totalQty += qty;
      bookings[prodName].buyers.push({ name: customer, qty: qty });
      
      // ดักจับออเดอร์ของตัวเอง
      if (lineId && currentLineId === lineId) {
        myOrders.push({
          id: orderData[i][0],
          name: prodName,
          qty: qty,
          total: orderData[i][5],
          payStatus: orderData[i][6],
          delStatus: orderData[i][10]
        });
      }
    }
  }
  
  let products = [];
  for (let i = 1; i < pmData.length; i++) {
    const isActive = pmData[i][4] === true || pmData[i][4] === 'TRUE';
    if (isActive) {
      const quota = parseInt(pmData[i][3]) || 0;
      const name = pmData[i][1];
      products.push({
        name: name, price: pmData[i][2], quota: quota,
        remaining: Math.max(0, quota - (bookings[name] ? bookings[name].totalQty : 0)),
        buyers: bookings[name] ? bookings[name].buyers : [],
        imageUrl: pmData[i][6] || ""
      });
    }
  }
  
  // จัดเตรียมข้อมูลสำหรับหน้าสรุปวันนี้ (bookings list)
  let todaySummary = [];
  for (const [prodName, data] of Object.entries(bookings)) {
    todaySummary.push({
      name: prodName,
      totalQty: data.totalQty,
      buyers: data.buyers
    });
  }

  return { 
    products, 
    myOrders,
    todaySummary,
    cycleDateText: Utilities.formatDate(cycleEnd, "GMT+7", "d MMM")
  };
}

// --- สรุปข้อมูลหลังบ้าน (Admin Dashboard) ---
function getAdminData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const pmSheet = ss.getSheetByName('seller (1)') || ss.getSheets()[0];
  const orderSheet = ss.getSheetByName('orderz') || ss.getSheets()[1];
  
  const pmData = pmSheet.getDataRange().getValues();
  const orderData = orderSheet.getDataRange().getValues();
  
  const cycleStart = getCycleStart();
  let summary = {}; let ordersMap = {}; 
  let finance = { total: 0, transfer: 0, cash: 0, unpaid: 0 };
  let monthlyStats = {};
  let products = [];

  // Build products list with IDs
  for (let i = 1; i < pmData.length; i++) {
    if (pmData[i][1]) {
      products.push({
        id: pmData[i][0] || ('product_' + i),
        name: pmData[i][1],
        price: pmData[i][2],
        stock: parseInt(pmData[i][3]) || 0,
        isActive: pmData[i][4] === true || pmData[i][4] === 'TRUE',
        cost: parseFloat(pmData[i][5]) || 0,
        imageUrl: pmData[i][6] || ""
      });
    }
  }

  // Create a map for product costs for faster lookup during order processing
  const costMap = {};
  products.forEach(p => costMap[p.name] = p.cost);

  // Process orders
  for (let i = 1; i < orderData.length; i++) {
    const rowDate = new Date(orderData[i][1]);
    const monthKey = Utilities.formatDate(rowDate, "GMT+7", "yyyy-MM");
    const rowPrice = parseInt(orderData[i][5]) || 0;

    // Monthly stats
    monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + rowPrice;

    if (rowDate >= cycleStart) {
      const orderId = orderData[i][0];
      const product = orderData[i][3];
      const qty = parseInt(orderData[i][4]) || 0;
      const payStatus = orderData[i][6];
      const payMethod = orderData[i][11];
      const deliveryStatus = orderData[i][10];
      const deliveryMethod = orderData[i][9];

      if (!summary[product]) summary[product] = { total: 0 };
      summary[product].total += qty;

      finance.total += rowPrice;
      
      // Calculate Profit: (Price - Cost) * Qty
      const itemCost = costMap[product] || 0;
      finance.totalProfit = (finance.totalProfit || 0) + (rowPrice - (itemCost * qty));

      if (payMethod === 'จ่ายก่อน(แนบสลิป)' || payStatus === 'ชำระเงินแล้ว') {
        finance.transfer += rowPrice;
      } else if (payMethod === 'เงินสด') {
        finance.cash += rowPrice;
      } else {
        finance.unpaid += rowPrice;
      }

      if (!ordersMap[orderId]) {
        ordersMap[orderId] = {
          orderId: orderId, customer: orderData[i][2], items: [],
          deliveryMethod: deliveryMethod, deliveryStatus: deliveryStatus, payMethod: payMethod
        };
      }
      ordersMap[orderId].items.push(`${product} x${qty}`);
    }
  }

  return {
    products: products,
    summary: Object.keys(summary).map(k => ({ name: k, total: summary[k].total })),
    orders: Object.values(ordersMap),
    finance: finance,
    monthlyStats: monthlyStats
  };
}

function responseJSON(data, headers = {"Access-Control-Allow-Origin": "*"}) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function saveSlipToDrive(base64, orderId) {
  if (!base64) return '';
  const matches = base64.match(/^data:(image\/[a-zA-Z]+);base64,(.*)$/);
  if (!matches) return '';
  const contentType = matches[1];
  const imageData = matches[2];
  const bytes = Utilities.base64Decode(imageData);
  const extension = contentType.split('/')[1] || 'jpg';
  const blob = Utilities.newBlob(bytes, contentType, `${orderId}_slip.${extension}`);
  const folder = DriveApp.getFolderById(SLIP_FOLDER_ID);
  const file = folder.createFile(blob);
  return file.getUrl();
}

// --- CREATE ORDER ---
function createOrder(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('orderz') || ss.getSheets()[1];
  
  const orderId = Utilities.getUuid();
  const timestamp = new Date();
  const slipUrl = data.slipBase64 ? saveSlipToDrive(data.slipBase64, orderId) : '';
  
  data.cart.forEach(item => {
    const row = [
      orderId,
      timestamp,
      data.customerName,
      item.name,
      item.qty,
      item.price * item.qty,
      'รอชำระเงิน',
      slipUrl,
      data.lineId || '',
      data.deliveryMethod,
      'ยังไม่ได้ส่ง',
      data.paymentMethod
    ];
    sheet.appendRow(row);
  });
  
  return { orderId: orderId, slipUrl: slipUrl };
}

// --- UPDATE ORDER STATUS ---
function updateStatus(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('orderz') || ss.getSheets()[1];
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.orderId) {
      if (data.type === 'delivery') {
        sheet.getRange(i + 1, 11).setValue(data.value); // Column K
      } else if (data.type === 'payment') {
        sheet.getRange(i + 1, 12).setValue(data.value); // Column L
      }
    }
  }
  return { success: true };
}

// --- MANAGE PRODUCTS (CRUD) ---
function manageProduct(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('seller (1)') || ss.getSheets()[0];
  const values = sheet.getDataRange().getValues();
  
  if (data.mode === 'create') {
    const newId = Utilities.getUuid();
    const newRow = [newId, data.name, data.price, data.stock || 0, false, data.cost || 0, data.imageUrl || ''];
    sheet.appendRow(newRow);
  } else if (data.mode === 'update') {
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.id || values[i][1] === data.oldName) {
        sheet.getRange(i + 1, 2).setValue(data.name);
        sheet.getRange(i + 1, 3).setValue(data.price);
        if (data.stock !== undefined) sheet.getRange(i + 1, 4).setValue(data.stock);
        if (data.cost !== undefined) sheet.getRange(i + 1, 6).setValue(data.cost); // Index 5 = Column F
        sheet.getRange(i + 1, 7).setValue(data.imageUrl || '');
        break;
      }
    }
  } else if (data.mode === 'delete') {
    for (let i = values.length - 1; i >= 1; i--) {
      if (values[i][0] === data.id || values[i][1] === data.oldName) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
  }
  return { success: true };
}

// --- SET DAILY MENU (Bulk update isActive and stock) ---
function setDailyMenu(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('seller (1)') || ss.getSheets()[0];
  const values = sheet.getDataRange().getValues();
  // data.menus is an array of { id, stock, isActive }
  const menuMap = {};
  data.menus.forEach(m => menuMap[m.id] = m);

  for (let i = 1; i < values.length; i++) {
    const rowId = values[i][0];
    if (menuMap[rowId]) {
      sheet.getRange(i + 1, 4).setValue(menuMap[rowId].stock);
      sheet.getRange(i + 1, 5).setValue(menuMap[rowId].isActive);
    } else {
      // If a product is not in the active list passed, turn it off. (optional, depending on payload)
      // Actually usually we just rely on passing EVERYTHING back.
      if (data.menus.find(m => true)) { // if we have list, make others inactive
        sheet.getRange(i + 1, 5).setValue(false);
      }
    }
  }
  return { success: true };
}
