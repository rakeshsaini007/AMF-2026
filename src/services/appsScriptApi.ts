import { AppsScriptResponse, FacilityStatus, PollingBooth } from '../types';
import { INITIAL_BOOTHS } from '../data/initialData';

/**
 * Fetch live data from Google Apps Script Web App
 */
export async function fetchBoothsFromAppsScript(
  scriptUrl: string, 
  village?: string
): Promise<{ booths: PollingBooth[]; villages: string[]; sheetTitle?: string; lastUpdated: string; isLive: boolean; error?: string }> {
  
  if (!scriptUrl || scriptUrl.trim() === '') {
    // Return sample offline data when URL is not configured
    const allVillages = Array.from(new Set(INITIAL_BOOTHS.map(b => b.village))).sort();
    return {
      booths: village && village !== 'all' ? INITIAL_BOOTHS.filter(b => b.village === village) : INITIAL_BOOTHS,
      villages: allVillages,
      sheetTitle: 'स्थानीय डेटा (Sample Sheet: Rampur / Swar)',
      lastUpdated: new Date().toLocaleTimeString('hi-IN'),
      isLive: false
    };
  }

  try {
    const urlObj = new URL(scriptUrl);
    urlObj.searchParams.set('action', 'getData');
    urlObj.searchParams.set('_t', Date.now().toString()); // prevent browser cache
    if (village && village !== 'all') {
      urlObj.searchParams.set('village', village);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const response = await fetch(urlObj.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const json: AppsScriptResponse = await response.json();

    if (json.status !== 'success') {
      throw new Error(json.message || 'Google Apps Script returned an error.');
    }

    const rawData = Array.isArray(json.data) ? json.data : [];
    
    // Normalize into PollingBooth format
    const booths: PollingBooth[] = rawData.map((row: any, idx: number) => {
      const normalizeStatus = (val: any): FacilityStatus => {
        if (!val) return 'अनुपलब्ध';
        const str = String(val).trim().toLowerCase();
        if (['उपलब्ध', 'हाँ', 'हा', 'yes', 'y', '1', 'true', 'सत्य', 'पूर्ण'].includes(str)) return 'उपलब्ध';
        if (['मरम्मत योग्य', 'कार्य प्रगति पर', 'repair', 'partial', 'आंशिक'].includes(str)) return 'मरम्मत योग्य';
        return 'अनुपलब्ध';
      };

      const boothNo = String(row.boothNo || row['बूथ सं०'] || (idx + 1)).trim();
      const villageName = String(row.village || row['गांव का नाम'] || 'अज्ञात गांव').trim();
      const boothName = String(row.boothName || row['बूथ का नाम'] || `बूथ सं० ${boothNo}`).trim();

      const ramp = normalizeStatus(row.ramp || row['रैम्प']);
      const water = normalizeStatus(row.water || row['पीने का पानी']);
      const electricity = normalizeStatus(row.electricity || row['पर्याप्त विद्युत व्यवस्था']);
      const furniture = normalizeStatus(row.furniture || row['पर्याप्त फर्नीचर']);
      const toilet = normalizeStatus(row.toilet || row['शौचालय']);
      const shed = normalizeStatus(row.shed || row['शेड']);
      const signage = normalizeStatus(row.signage || row['प्रॉपर साइनेज']);

      const facilities = [ramp, water, electricity, furniture, toilet, shed, signage];
      const availableCount = facilities.filter(s => s === 'उपलब्ध').length;
      const readinessPercent = Math.round((availableCount / facilities.length) * 100);

      // Preserve or mock extra election details if missing
      const baseMatch = INITIAL_BOOTHS.find(b => b.boothNo === boothNo);

      // Determine if data was already present in the sheet
      const raw = row.raw || [];
      const hasExistingData = row.hasExistingData ?? (
        Array.isArray(raw) && raw.length > 3
          ? raw.slice(3).some((cell: any) => cell !== "" && cell !== null && cell !== undefined && String(cell).trim() !== "")
          : (row.ramp && row.ramp !== 'अनुपलब्ध') || (row.water && row.water !== 'अनुपलब्ध') || (row.electricity && row.electricity !== 'अनुपलब्ध') || (row.furniture && row.furniture !== 'अनुपलब्ध') || (row.toilet && row.toilet !== 'अनुपलब्ध') || (row.shed && row.shed !== 'अनुपलब्ध') || (row.signage && row.signage !== 'अनुपलब्ध') || !!row.remarks
      );

      return {
        rowIndex: row.rowIndex || (idx + 2),
        boothNo,
        village: villageName,
        boothName,
        ramp,
        water,
        electricity,
        furniture,
        toilet,
        shed,
        signage,
        totalVoters: row.totalVoters || baseMatch?.totalVoters || 950,
        maleVoters: row.maleVoters || baseMatch?.maleVoters || 510,
        femaleVoters: row.femaleVoters || baseMatch?.femaleVoters || 440,
        pwdVoters: row.pwdVoters || baseMatch?.pwdVoters || 12,
        bloName: row.bloName || baseMatch?.bloName || 'बीएलओ नियुक्त',
        bloPhone: row.bloPhone || baseMatch?.bloPhone || '98765-XXXXX',
        sectorMagistrate: row.sectorMagistrate || baseMatch?.sectorMagistrate || 'सेक्टर अधिकारी',
        remarks: row.remarks || baseMatch?.remarks || '',
        isVerified: row.isVerified ?? (baseMatch?.isVerified ?? true),
        lastUpdated: json.lastUpdated || new Date().toISOString().split('T')[0],
        readinessPercent,
        isFullyEquipped: availableCount === facilities.length,
        hasExistingData: Boolean(hasExistingData)
      };
    });

    const villages = json.villages && json.villages.length > 0 
      ? json.villages 
      : Array.from(new Set(booths.map(b => b.village))).sort();

    return {
      booths,
      villages,
      sheetTitle: json.sheetTitle || 'Google Spreadsheet (Live)',
      lastUpdated: new Date().toLocaleTimeString('hi-IN'),
      isLive: true
    };

  } catch (err: any) {
    console.warn('Apps Script fetch failed, falling back to cached/initial data:', err);
    
    // Provide a graceful fallback with initial data so app never breaks
    const allVillages = Array.from(new Set(INITIAL_BOOTHS.map(b => b.village))).sort();
    return {
      booths: village && village !== 'all' ? INITIAL_BOOTHS.filter(b => b.village === village) : INITIAL_BOOTHS,
      villages: allVillages,
      sheetTitle: 'ऑफलाइन / स्थानीय कैश डेटा',
      lastUpdated: new Date().toLocaleTimeString('hi-IN'),
      isLive: false,
      error: err.message || 'गूगल ऐप्स स्क्रिप्ट से कनेक्शन में असमर्थ'
    };
  }
}

/**
 * Save or Update polling booth data directly to Google Sheet via Apps Script
 */
export async function saveOrUpdateBoothInAppsScript(
  scriptUrl: string,
  payload: {
    rowIndex: number;
    boothNo: string;
    facilities?: Record<string, string>;
    facilityKey?: string;
    newStatus?: string;
    remarks?: string;
    wasExisting?: boolean;
  }
): Promise<{ success: boolean; action: 'save' | 'update'; message: string }> {
  const defaultAction = payload.wasExisting ? 'update' : 'save';

  if (!scriptUrl) {
    return { 
      success: true, 
      action: defaultAction, 
      message: defaultAction === 'update' 
        ? `बूथ सं० ${payload.boothNo} का डेटा सफलतापूर्वक अपडेट (Update) किया गया!` 
        : `बूथ सं० ${payload.boothNo} का डेटा सफलतापूर्वक सुरक्षित (Save) किया गया!` 
    };
  }

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8' // avoids CORS preflight blocking in Apps Script
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return { 
        success: false, 
        action: defaultAction, 
        message: `सर्वर त्रुटि: ${response.status}` 
      };
    }

    const res = await response.json();
    const action = res.action || defaultAction;
    return {
      success: res.status === 'success',
      action: action,
      message: res.message || (
        action === 'update' 
          ? `बूथ सं० ${payload.boothNo} का डेटा सफलतापूर्वक अपडेट (Update) किया गया!` 
          : `बूथ सं० ${payload.boothNo} का डेटा सफलतापूर्वक सुरक्षित (Save) किया गया!`
      )
    };
  } catch (err: any) {
    return {
      success: false,
      action: defaultAction,
      message: err.message || 'डेटा प्रेषित करने में विफल'
    };
  }
}

/**
 * Update facility status directly to Google Sheet via Apps Script
 */
export async function updateFacilityInAppsScript(
  scriptUrl: string,
  payload: {
    rowIndex: number;
    boothNo: string;
    facilityKey: string;
    newStatus: string;
    wasExisting?: boolean;
  }
): Promise<{ success: boolean; action: 'save' | 'update'; message: string }> {
  return saveOrUpdateBoothInAppsScript(scriptUrl, payload);
}
