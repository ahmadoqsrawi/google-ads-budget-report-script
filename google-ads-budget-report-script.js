function main() {
  const spreadsheetName = "Budget Report";

  // Get the last day, last week, and last month dates
  const lastDay = getLastDay();
  const lastWeek = getLastWeek();
  const lastMonth = getLastMonth();

  // Get the budget data for each date range
  const budgetDataLastDay = getBudgetData(lastDay, lastDay);
  const budgetDataLastWeek = getBudgetData(lastWeek, lastDay);
  const budgetDataLastMonth = getBudgetData(lastMonth, lastDay);

  // Create a new Google Sheet
  const spreadsheet = SpreadsheetApp.create(spreadsheetName);
  const sheet = spreadsheet.getActiveSheet();

  // Write headers to the sheet
  sheet.getRange(1, 1).setValue("Date Range");
  sheet.getRange(1, 2).setValue("Campaign");
  sheet.getRange(1, 3).setValue("Budget");
  sheet.getRange(1, 4).setValue("Spent");

  // Write budget data for last day to the sheet
  writeBudgetDataToSheet(sheet, 2, "Last Day", budgetDataLastDay);

  // Write budget data for last week to the sheet
  writeBudgetDataToSheet(sheet, budgetDataLastDay.length + 3, "Last Week", budgetDataLastWeek);

  // Write budget data for last month to the sheet
  writeBudgetDataToSheet(sheet, budgetDataLastDay.length + budgetDataLastWeek.length + 4, "Last Month", budgetDataLastMonth);

  Logger.log("Budget report created. Spreadsheet ID: " + spreadsheet.getId());
}

function getLastDay() {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  return formatDate(lastDay);
}

function getLastWeek() {
  const today = new Date();
  const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
  return formatDate(lastWeek);
}

function getLastMonth() {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  return formatDate(lastMonth);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return year + month + day;
}

function getBudgetData(startDate, endDate) {
  const campaignIterator = AdsApp.campaigns().get();
  const budgetData = [];

  while (campaignIterator.hasNext()) {
    const campaign = campaignIterator.next();
    const campaignName = campaign.getName();
    const budget = campaign.getBudget().getAmount();
    const stats = campaign.getStatsFor(startDate, endDate);
    const spent = stats.getCost();

    budgetData.push({
      campaign: campaignName,
      budget: budget,
      spent: spent
    });
  }

  return budgetData;
}

function writeBudgetDataToSheet(sheet, startRow, dateRange, budgetData) {
  sheet.getRange(startRow, 1).setValue(dateRange);

  for (let i = 0; i < budgetData.length; i++) {
    const row = startRow + i;
    const campaign = budgetData[i].campaign;
    const budget = budgetData[i].budget;
    const spent = budgetData[i].spent;

    sheet.getRange(row, 2).setValue(campaign);
    sheet.getRange(row, 3).setValue(budget);
    sheet.getRange(row, 4).setValue(spent);
  }
}
