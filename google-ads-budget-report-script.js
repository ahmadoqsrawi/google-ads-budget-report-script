function main() {
  // Retrieve the managed account IDs
  var accountIds = getManagedAccountIds();
  
  // Generate the campaign budget report for the account IDs
  var report = generateCampaignBudgetReport(accountIds);
  
  // Create a new spreadsheet
  var spreadsheet = createSpreadsheet();
  
  // Write the report to the spreadsheet
  writeReportToSpreadsheet(report, spreadsheet);
}

function getManagedAccountIds() {
  // Get the iterator for managed accounts
  var accountIterator = MccApp.accounts().get();
  var accountIds = [];
  
  // Iterate over the accounts and collect the account IDs
  while (accountIterator.hasNext()) {
    var account = accountIterator.next();
    accountIds.push(account.getCustomerId());
  }
  
  return accountIds;
}

function generateCampaignBudgetReport(accountIds) {
  // Generate the campaign budget report for each account ID
  return accountIds.map(function(accountId) {
    var lastDaySpend = getCampaignBudgetSpend(accountId, getLastNDays(1));
    var lastWeekSpend = getCampaignBudgetSpend(accountId, getLastNDays(7));
    var lastMonthSpend = getCampaignBudgetSpend(accountId, getLastNMonths(1));
    
    // Return an object containing the account ID and spend data
    return {
      cid: accountId,
      lastDaySpend: lastDaySpend,
      lastWeekSpend: lastWeekSpend,
      lastMonthSpend: lastMonthSpend
    };
  });
}

function getCampaignBudgetSpend(accountId, dateRange) {
  // Retrieve the campaign budget spend for the specified account and date range
  var accountSelector = AdsApp.accounts().withIds([accountId]);
  var accountReport = accountSelector.forDateRange(dateRange.start, dateRange.end).getReport(
    "SELECT Cost " +
    "FROM CAMPAIGN_PERFORMANCE_REPORT " +
    "WHERE CampaignStatus = ENABLED");
  
  var rows = accountReport.rows();
  var spend = 0;
  
  // Iterate over the report rows and calculate the total spend
  while (rows.hasNext()) {
    var row = rows.next();
    spend += parseFloat(row["Cost"]);
  }
  
  return spend.toFixed(2);
}

function getLastNDays(n) {
  // Get the start and end dates for the last N days
  var endDate = new Date();
  var startDate = new Date(endDate.getTime() - (n * 24 * 60 * 60 * 1000));
  
  return {
    start: formatDate(startDate),
    end: formatDate(endDate)
  };
}

function getLastNMonths(n) {
  // Get the start and end dates for the last N months
  var endDate = new Date();
  var startDate = new Date(endDate.getFullYear(), endDate.getMonth() - n, 1);
  
  return {
    start: formatDate(startDate),
    end: formatDate(endDate)
  };
}

function formatDate(date) {
  // Format the date as "YYYY-MM-DD"
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);
  
  return year + "-" + month + "-" + day;
}

function createSpreadsheet() {
  // Create a new spreadsheet for the campaign budget report
  var spreadsheet = SpreadsheetApp.create("Campaign Budget Report");
  var sheet = spreadsheet.getActiveSheet();
  
  // Set column headers
  sheet.getRange("A1:D1").setValues([["CID", "Last Day Spend", "Last Week Spend", "Last Month Spend"]]);
  
  return spreadsheet;
}

function writeReportToSpreadsheet(report, spreadsheet) {
  var sheet = spreadsheet.getActiveSheet();
  
  // Prepare the report data as a 2D array
  var data = report.map(function(row) {
    return [row.cid, row.lastDaySpend, row.lastWeekSpend, row.lastMonthSpend];
  });
  
  // Write the report data to the spreadsheet
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
}
