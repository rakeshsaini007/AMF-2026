/**
 * ==============================================================================
 * 🗳️ बूथ सुविधा दर्पण (Polling Station Facilities AMF Dashboard) - Google Apps Script
 * ==============================================================================
 * 
 * 📌 तैनात करने के निर्देश (Deployment Instructions):
 * --------------------------------------------------
 * 1. अपनी गूगल शीट खोलें जिसमें बूथों का डेटा है।
 * 2. मेन्यू बार से 'Extensions' (एक्सटेंशन) -> 'Apps Script' पर क्लिक करें।
 * 3. इस फाइल (code.js) के सभी कोड को कॉपी करके Apps Script एडिटर (Code.gs) में पेस्ट करें।
 * 4. ऊपर दाईं ओर नीले बटन 'Deploy' (तैनात करें) -> 'New deployment' (नई तैनाती) चुनें।
 * 5. गियर आइकन ⚙️ पर क्लिक करके 'Web app' (वेब ऐप) चुनें।
 * 6. कॉन्फ़िगरेशन सेट करें:
 *    - Description: "Booth Facilities API"
 *    - Execute as: "Me (आपका ईमेल)"
 *    - Who has access: "Anyone" (कोई भी - महत्वपूर्ण: इससे डैशबोर्ड डेटा फेच कर सकेगा)
 * 7. 'Deploy' पर क्लिक करें और अगर अनुमति (Authorization) मांगे तो 'Review Permissions' 
 *    -> अपना गूगल खाता चुनें -> 'Advanced' -> 'Go to Untitled project (unsafe)' -> 'Allow' करें।
 * 8. आपको एक 'Web app URL' मिलेगा (जैसे https://script.google.com/macros/s/.../exec)।
 * 9. इस URL को कॉपी करें और अपने डैशबोर्ड में दर्ज करें या src/config.ts में VITE_APPS_SCRIPT_URL में सेट करें।
 * ==============================================================================
 */

// शीट का नाम (यदि खाली छोड़ा तो पहली सक्रिय शीट ली जाएगी)
const SHEET_NAME = ""; 

/**
 * GET अनुरोध संभालें (डैशबोर्ड द्वारा डेटा प्राप्त करने के लिए)
 * Handles GET requests: returns all polling booth data, unique villages, and stats.
 */
function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
    
    if (!sheet) {
      return createJsonResponse({
        status: "error",
        message: "Sheet not found in the spreadsheet."
      });
    }

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    if (values.length < 2) {
      return createJsonResponse({
        status: "success",
        total: 0,
        villages: [],
        data: []
      });
    }

    const headers = values[0].map(h => String(h).trim());
    
    // हेडर इंडेक्स ढूंढना (Flexible Header Mapping)
    const findIndex = (possibleNames) => {
      return headers.findIndex(h => {
        const clean = h.toLowerCase().replace(/[\s\-_.]/g, "");
        return possibleNames.some(p => clean.includes(p.toLowerCase().replace(/[\s\-_.]/g, "")));
      });
    };

    const idxBoothNo = findIndex(["बूथ सं", "बूथ नं", "booth no", "booth_no", "booth"]);
    const idxVillage = findIndex(["गांव का नाम", "गाँव का नाम", "ग्राम", "village name", "village"]);
    const idxBoothName = findIndex(["बूथ का नाम", "मतदान केंद्र", "polling station", "booth name"]);
    const idxRamp = findIndex(["रैम्प", "रैंप", "ramp"]);
    const idxWater = findIndex(["पीने का पानी", "पेयजल", "drinking water", "water"]);
    const idxElectricity = findIndex(["पर्याप्त विद्युत", "विद्युत व्यवस्था", "बिजली", "electricity", "power"]);
    const idxFurniture = findIndex(["पर्याप्त फर्नीचर", "फर्नीचर", "furniture"]);
    const idxToilet = findIndex(["शौचालय", "टॉयलेट", "toilet"]);
    const idxShed = findIndex(["शेड", "छाया", "shed"]);
    const idxSignage = findIndex(["प्रॉपर साइनेज", "साइनेज", "signage", "direction"]);

    const rows = [];
    const villageSet = new Set();

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      // खाली पंक्ति छोड़ें
      const isRowEmpty = row.every(cell => cell === "" || cell === null || cell === undefined);
      if (isRowEmpty) continue;

      const boothNo = idxBoothNo !== -1 ? row[idxBoothNo] : (i);
      const village = idxVillage !== -1 && row[idxVillage] ? String(row[idxVillage]).trim() : "अज्ञात गांव";
      const boothName = idxBoothName !== -1 && row[idxBoothName] ? String(row[idxBoothName]).trim() : `बूथ सं० ${boothNo}`;

      if (village) {
        villageSet.add(village);
      }

      // सुविधा जांच हेल्पर (उपलब्ध / हां / yes / 1 / टिक)
      const parseStatus = (val) => {
        if (val === true || val === 1 || val === "1") return "उपलब्ध";
        if (!val) return "अनुपलब्ध";
        const str = String(val).trim().toLowerCase();
        if (["उपलब्ध", "हाँ", "हा", "yes", "y", "ok", "true", "पूर्ण", "सत्य", "✓", "✔"].includes(str)) {
          return "उपलब्ध";
        }
        if (["कार्य प्रगति पर", "मरम्मत योग्य", "आंशिक", "partial", "repair"].includes(str)) {
          return "मरम्मत योग्य";
        }
        if (["अनुपलब्ध", "नहीं", "no", "n", "false", "शून्य", "✗", "✘", "-"].includes(str)) {
          return "अनुपलब्ध";
        }
        return String(val).trim();
      };

      // क्या पहले से डेटा मौजूद है (जांच)
      const rawCells = row.slice(3);
      const hasExistingData = rawCells.some(c => c !== "" && c !== null && c !== undefined && String(c).trim() !== "");

      const record = {
        rowIndex: i + 1,
        boothNo: String(boothNo).trim(),
        village: village,
        boothName: boothName,
        ramp: idxRamp !== -1 ? parseStatus(row[idxRamp]) : "अनुपलब्ध",
        water: idxWater !== -1 ? parseStatus(row[idxWater]) : "अनुपलब्ध",
        electricity: idxElectricity !== -1 ? parseStatus(row[idxElectricity]) : "अनुपलब्ध",
        furniture: idxFurniture !== -1 ? parseStatus(row[idxFurniture]) : "अनुपलब्ध",
        toilet: idxToilet !== -1 ? parseStatus(row[idxToilet]) : "अनुपलब्ध",
        shed: idxShed !== -1 ? parseStatus(row[idxShed]) : "अनुपलब्ध",
        signage: idxSignage !== -1 ? parseStatus(row[idxSignage]) : "अनुपलब्ध",
        hasExistingData: hasExistingData,
        raw: row
      };

      // गणना: कितनी सुविधाएं उपलब्ध हैं
      const facilities = [record.ramp, record.water, record.electricity, record.furniture, record.toilet, record.shed, record.signage];
      const availableCount = facilities.filter(f => f === "उपलब्ध").length;
      record.readinessPercent = Math.round((availableCount / facilities.length) * 100);
      record.isFullyEquipped = availableCount === facilities.length;

      rows.push(record);
    }

    // फ़िल्टर यदि गांव का नाम पैरामीटर में दिया गया हो (?village=...)
    let filteredRows = rows;
    if (params.village && params.village !== "all" && params.village !== "सभी") {
      filteredRows = rows.filter(r => r.village.toLowerCase() === params.village.toLowerCase());
    }

    // आँकड़े तैयार करना (Summary Statistics)
    const summary = {
      totalBooths: rows.length,
      totalVillages: villageSet.size,
      fullyEquippedBooths: rows.filter(r => r.isFullyEquipped).length,
      facilityTotals: {
        ramp: rows.filter(r => r.ramp === "उपलब्ध").length,
        water: rows.filter(r => r.water === "उपलब्ध").length,
        electricity: rows.filter(r => r.electricity === "उपलब्ध").length,
        furniture: rows.filter(r => r.furniture === "उपलब्ध").length,
        toilet: rows.filter(r => r.toilet === "उपलब्ध").length,
        shed: rows.filter(r => r.shed === "उपलब्ध").length,
        signage: rows.filter(r => r.signage === "उपलब्ध").length,
      }
    };

    return createJsonResponse({
      status: "success",
      sheetTitle: ss.getName(),
      lastUpdated: new Date().toISOString(),
      villages: Array.from(villageSet).sort(),
      summary: summary,
      data: filteredRows
    });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString(),
      stack: err.stack
    });
  }
}

/**
 * POST अनुरोध संभालें (डैशबोर्ड से सीधे Google Sheet में सुविधा स्थिति अपडेट करने के लिए)
 * Allows updating a polling booth facility directly in Google Sheet from the UI.
 */
function doPost(e) {
  try {
    const postData = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : null;
    if (!postData) {
      return createJsonResponse({ status: "error", message: "No data payload received" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
    
    const { boothNo, facilityKey, newStatus, rowIndex, facilities, remarks } = postData;

    if (rowIndex && rowIndex > 1) {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const colMap = {
        ramp: ["रैम्प", "रैंप", "ramp"],
        water: ["पीने का पानी", "पेयजल", "drinking water"],
        electricity: ["पर्याप्त विद्युत व्यवस्था", "विद्युत व्यवस्था", "electricity"],
        furniture: ["पर्याप्त फर्नीचर", "furniture"],
        toilet: ["शौचालय", "toilet"],
        shed: ["शेड", "shed"],
        signage: ["प्रॉपर साइनेज", "साइनेज", "signage"],
        remarks: ["टिप्पणी", "रिमार्क", "remarks", "note"]
      };

      const findCol = (targetAliases) => {
        return headers.findIndex(h => {
          const clean = String(h).toLowerCase().replace(/[\s\-_.]/g, "");
          return targetAliases.some(p => clean.includes(p.toLowerCase().replace(/[\s\-_.]/g, "")));
        });
      };

      // क्या इस पंक्ति में पहले से डेटा मौजूद था
      const checkIndices = Object.keys(colMap).map(k => findCol(colMap[k])).filter(i => i !== -1);
      const currentRowVals = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
      const wasExisting = checkIndices.some(idx => {
        const v = currentRowVals[idx];
        return v !== "" && v !== null && v !== undefined && String(v).trim() !== "";
      });

      // 1. एकल सुविधा अपडेट (Single facility update)
      if (facilityKey && newStatus) {
        const colIdx = findCol(colMap[facilityKey] || [facilityKey]);
        if (colIdx !== -1) {
          sheet.getRange(rowIndex, colIdx + 1).setValue(newStatus);
        }
      }

      // 2. समस्त सुविधाएं अपडेट (Batch facilities update)
      if (facilities && typeof facilities === 'object') {
        const mandatoryKeys = ["ramp", "water", "electricity", "furniture", "toilet", "shed", "signage"];
        const missing = mandatoryKeys.filter(k => !facilities[k] || String(facilities[k]).trim() === "");
        
        if (missing.length > 0) {
          return createJsonResponse({
            status: "error",
            message: `सभी 7 सुविधाएं अनिवार्य हैं (All fields are mandatory)! अपूर्ण फ़ील्ड्स: ${missing.join(", ")}`
          });
        }

        for (const [key, val] of Object.entries(facilities)) {
          const colIdx = findCol(colMap[key] || [key]);
          if (colIdx !== -1) {
            sheet.getRange(rowIndex, colIdx + 1).setValue(val);
          }
        }
      }

      // 3. टिप्पणी अपडेट (Remarks update)
      if (remarks !== undefined) {
        let colIdx = findCol(colMap.remarks);
        if (colIdx === -1) {
          const lastCol = sheet.getLastColumn();
          sheet.getRange(1, lastCol + 1).setValue("टिप्पणी");
          colIdx = lastCol;
        }
        sheet.getRange(rowIndex, colIdx + 1).setValue(remarks);
      }

      const action = wasExisting ? "update" : "save";
      return createJsonResponse({
        status: "success",
        action: action,
        message: action === "update"
          ? `बूथ #${boothNo} का डेटा सफलतापूर्वक अपडेट (Update) किया गया`
          : `बूथ #${boothNo} का डेटा सफलतापूर्वक सुरक्षित (Save) किया गया`
      });
    }

    return createJsonResponse({
      status: "error",
      message: "Row index or column matching failed"
    });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * JSON रिस्पॉन्स हेल्पर (CORS फ्रेंडली)
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
