// ==========================================
// CONFIGURATION v7 (All-in-One System)
// ==========================================
const SPREADSHEET_ID = '1KLJMaZ3eLrgijBcPzDxNOsjvJBcvke1v8Fk-KvM8Yaw'; 
const SLIP_FOLDER_ID = '1iZN5-ILCCqRUltRpGzvWwXYqo6dqocEL'; 

// Admin password check
const ADMIN_PASSWORD = '12399';

function checkAdminAuth(params) {
  return params.password === ADMIN_PASSWORD;
}

function doGet(e) {
  const action = e.parameter.action;
  const lineId = e.parameter.lineId;
  
  if (action === 'getDashboard') return responseJSON({ status: 'success', data: getDashboardData(lineId) });
  if (action === 'getAdminData') {
    if (!checkAdminAuth(e.parameter)) return responseJSON({ status: 'error', message: 'Unauthorized' });
    return responseJSON({ status: 'success', data: getAdminData() });
  }
  return ContentService.createTextOutput("API v7 Online");
}

function doPost(e) {
  const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type" };
  try {
    const payload = JSON.parse(e.postData.contents);
    if (!checkAdminAuth(payload)) return responseJSON({ status: 'error', message: 'Unauthorized' }, headers);
    
    if (payload.action === 'createOrder') return responseJSON({ status: 'success', data: createOrder(payload.data) }, headers);
    if (payload.action === 'updateStatus') return responseJSON({ status: 'success', data: updateStatus(payload.data) }, headers);
    if (payload.action === 'manageProduct') return responseJSON({ status: 'success', data: manageProduct(payload.data) }, headers);
  } catch (error) {
    return responseJSON({ status: 'error', message: error.toString() }, headers);
  }
}

// --- สรุปข้อมูลหน้าบ้าน (Dashboard & My Orders) ---
function getDashboardData(lineId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const pmSheet = ss.getSheetByName('seller (1)') || ss.getSheets()[0];
  const orderSheet = ss.getSheetByName('orderz') || ss.getSheets()[1];
  
  const pmData = pmSheet.getDataRange().getValues();
  const orderData = orderSheet.getDataRange().getValues();
  const today = new Date(); today.setHours(0,0,0,0);
  
  let bookings = {}; 
  let myOrders = [];

  for (let i = 1; i < orderData.length; i++) {
    const rowDate = new Date(orderData[i][1]);
    const prodName = orderData[i][3];
    const qty = parseInt(orderData[i][4]) || 0;
    const customer = orderData[i][2];
    const currentLineId = orderData[i][8];

    if (rowDate >= today) {
      if (!bookings[prodName]) bookings[prodName] = { totalQty: 0, buyers: [] };
      bookings[prodName].totalQty += qty;
      bookings[prodName].buyers.push(customer);
      
      // ดักจับออเดอร์ของตัวเอง (ถ้า LineId ตรงกัน)
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
    const quota = parseInt(pmData[i][3]) || 0;
    if (quota > 0) {
      const name = pmData[i][1];
      products.push({
        name: name, price: pmData[i][2], quota: quota,
        remaining: Math.max(0, quota - (bookings[name] ? bookings[name].totalQty : 0)),
        buyers: bookings[name] ? bookings[name].buyers : [],
        imageUrl: pmData[i][6] || ""
      });
    }
  }
  return { products, myOrders };
}

// --- สรุปข้อมูลหลังบ้าน (Admin & Monthly Stats) ---
function getAdminData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const orderSheet = ss.getSheetByName('orderz') || ss.getSheets()[1];
  const data = orderSheet.getDataRange().getValues();
  
  const today = new Date(); today.setHours(0,0,0,0);
  let summary = {}; let ordersMap = {}; 
  let finance = { total: 0, transfer: 0, cash: 0 };
  let monthlyStats = {}; // เก็บยอดขายรายเดือน { "2024-04": 5000 }

  for (let i = 1; i < data.length; i++) {
    const rowDate = new Date(data[i][1]);
    const monthKey = Utilities.formatDate(rowDate, "GMT+7", "yyyy-MM");
    const rowPrice = parseInt(data[i][5]) || 0;

    // สถิติรายเดือน (Overall)
    monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + rowPrice;

    if (rowDate >= today) {
      const orderId = data[i][0];
      const product = data[i][3];
      const qty = parseInt(data[i][4]) || 0;
      const payStatus = data[i][6];
      const payMethod = data[i][11];

      if (!summary[product]) summary[product] = { total: 0 };
      summary[product].total += qty;

      finance.total += rowPrice;
      if (payMethod === 'โอนเงิน' || payStatus === 'ชำระเงินแล้ว') finance.transfer += rowPrice;
      else if (payMethod === 'เงินสด') finance.cash += rowPrice;

      if (!ordersMap[orderId]) {
        ordersMap[orderId] = {
          orderId: orderId, customer: data[i][2], items: [],
          deliveryMethod: data[i][9], deliveryStatus: data[i][10], payMethod: payMethod
        };
      }
      ordersMap[orderId].items.push(`${product} x${qty}`);
    }
  }

  return {
    summary: Object.keys(summary).map(k => ({ name: k, total: summary[k].total })),
    orders: Object.values(ordersMap),
    finance: finance,
    monthlyStats: monthlyStats
  };
}

function responseJSON(data, headers = {"Access-Control-Allow-Origin": "*"}) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// --- ฟังก์ชันอื่นๆ (manageProduct, createOrder, updateStatus) ให้ใช้ตามเดิมจาก v6 ---
function createOrder(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('orderz') || ss.getSheets()[1];
  const folder = DriveApp.getFolderById(SLIP_FOLDER_ID);
  
  const orderId = Utilities.getUuid();
  const timestamp = new Date();
  
  data.cart.forEach(item => {
    const row = [
      orderId,
      timestamp,
      data.customerName,
      item.name,
      item.qty,
      item.price * item.qty,
      'รอชำระเงิน',
      '', // slipUrl
      '', // lineId
      data.deliveryMethod,
      'ยังไม่ได้ส่ง',
      data.paymentMethod
    ];
    sheet.appendRow(row);
  });
  
  return { orderId: orderId };
}

function updateStatus(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('orderz') || ss.getSheets()[1];
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.orderId) {
      if (data.type === 'delivery') {
        sheet.getRange(i + 1, 11).setValue(data.value); // Column K (deliveryStatus)
      } else if (data.type === 'payment') {
        sheet.getRange(i + 1, 12).setValue(data.value); // Column L (payMethod)
      }
    }
  }
  return { success: true };
}

function manageProduct(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('seller (1)') || ss.getSheets()[0];
  const values = sheet.getDataRange().getValues();
  
  if (data.mode === 'create') {
    const newRow = ['', data.name, data.price, data.stock, '', '', data.imageUrl || ''];
    sheet.appendRow(newRow);
  } else if (data.mode === 'update') {
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.id || values[i][1] === data.oldName) {
        sheet.getRange(i + 1, 2).setValue(data.name); // Name
        sheet.getRange(i + 1, 3).setValue(data.price); // Price
        sheet.getRange(i + 1, 4).setValue(data.stock); // Stock
        sheet.getRange(i + 1, 7).setValue(data.imageUrl || ''); // Image
        break;
      }
    }
  } else if (data.mode === 'delete') {
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.id || values[i][1] === data.oldName) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
  }
  return { success: true };
}