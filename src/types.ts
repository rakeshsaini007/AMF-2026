export type FacilityStatus = "उपलब्ध" | "अनुपलब्ध" | "मरम्मत योग्य" | "कार्य प्रगति पर";

export type FacilityKey = 
  | "ramp" 
  | "water" 
  | "electricity" 
  | "furniture" 
  | "toilet" 
  | "shed" 
  | "signage";

export interface FacilityDefinition {
  key: FacilityKey;
  hindiName: string;
  englishName: string;
  icon: string;
  description: string;
}

export interface PollingBooth {
  rowIndex?: number;
  boothNo: string; // बूथ सं०
  village: string; // गांव का नाम
  boothName: string; // बूथ का नाम
  // 7 Assured Minimum Facilities (एएमएफ):
  ramp: FacilityStatus; // रैम्प
  water: FacilityStatus; // पीने का पानी
  electricity: FacilityStatus; // पर्याप्त विद्युत व्यवस्था
  furniture: FacilityStatus; // पर्याप्त फर्नीचर
  toilet: FacilityStatus; // शौचालय
  shed: FacilityStatus; // शेड
  signage: FacilityStatus; // प्रॉपर साइनेज
  
  // Extra election details
  totalVoters?: number;
  maleVoters?: number;
  femaleVoters?: number;
  pwdVoters?: number;
  bloName?: string;
  bloPhone?: string;
  sectorMagistrate?: string;
  remarks?: string;
  isVerified?: boolean;
  lastUpdated?: string;
  readinessPercent?: number;
  isFullyEquipped?: boolean;
  hasExistingData?: boolean; // True if data was already present in the sheet
}

export interface DashboardSummary {
  totalBooths: number;
  totalVillages: number;
  fullyEquippedBooths: number;
  partiallyEquippedBooths: number;
  criticalDeficientBooths: number;
  facilityCounts: Record<FacilityKey, { available: number; deficient: number; repair: number }>;
}

export interface AppsScriptResponse {
  status: "success" | "error";
  message?: string;
  sheetTitle?: string;
  lastUpdated?: string;
  villages?: string[];
  summary?: any;
  data?: any[];
}
