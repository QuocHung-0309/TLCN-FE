// Types for passenger information

export type PassengerType = 'adult' | 'child';
export type GenderType = 'male' | 'female' | 'other';

/** Used when submitting to API (from checkout form) */
export interface PassengerInput {
  fullName: string;
  dateOfBirth: string; // ISO date string "YYYY-MM-DD"
  gender?: GenderType;
  idNumber?: string; // Required if age >= 14
  type: PassengerType; // auto-computed from dateOfBirth
}

/** Displayed to User (CCCD masked) */
export interface PassengerDisplay {
  fullName: string;
  dateOfBirth?: string;
  gender?: GenderType;
  idNumber?: string | null; // masked e.g. "****5678"
  type: PassengerType;
}

/** Full data - Admin only (CCCD decrypted) */
export interface PassengerFull extends PassengerDisplay {
  idNumber?: string | null; // full plain text
}

/** Form state per passenger in checkout */
export interface PassengerFormState {
  fullName: string;
  dateOfBirth: string;
  gender: GenderType | '';
  idNumber: string;
  // computed
  _age?: number;
  _type?: PassengerType;
  _requireId?: boolean;
}

/** Compute age from dateOfBirth string */
export function computeAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  const birth = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

/** Get passenger type from age */
export function getPassengerType(age: number): PassengerType {
  return age < 12 ? 'child' : 'adult';
}

/** Check if CCCD is required based on age */
export function requiresCCCD(age: number): boolean {
  return age >= 14;
}

/** Create a blank passenger form state */
export function createBlankPassenger(): PassengerFormState {
  return { fullName: '', dateOfBirth: '', gender: '', idNumber: '' };
}

/** Validate CCCD logic (12 digits, century/gender code, birth year) */
export function validateCCCD(cccd: string, dateOfBirth: string, gender: GenderType | ''): string | null {
  if (!cccd) return 'Vui lòng nhập CCCD';
  if (!/^\d{12}$/.test(cccd)) return 'CCCD phải bao gồm đúng 12 chữ số';

  if (!dateOfBirth) return null; // Can't validate logic without DOB

  const dob = new Date(dateOfBirth);
  const year = dob.getFullYear();
  const shortYear = String(year).slice(-2);
  
  // Validate birth year (digits 5 and 6)
  const cccdYear = cccd.substring(4, 6);
  if (cccdYear !== shortYear) {
    return 'Số CCCD không khớp với năm sinh (2 số ở vị trí 5,6 phải là năm sinh)';
  }

  // Validate century and gender (digit 4)
  if (gender === 'male' || gender === 'female') {
    const cccdGender = parseInt(cccd.substring(3, 4), 10);
    let expectedGenderCode = -1;
    
    if (year >= 1900 && year <= 1999) {
      expectedGenderCode = gender === 'male' ? 0 : 1;
    } else if (year >= 2000 && year <= 2099) {
      expectedGenderCode = gender === 'male' ? 2 : 3;
    } else if (year >= 2100 && year <= 2199) {
      expectedGenderCode = gender === 'male' ? 4 : 5;
    } else if (year >= 2200 && year <= 2299) {
      expectedGenderCode = gender === 'male' ? 6 : 7;
    } else if (year >= 2300 && year <= 2399) {
      expectedGenderCode = gender === 'male' ? 8 : 9;
    }

    if (expectedGenderCode !== -1 && cccdGender !== expectedGenderCode) {
      return 'Số CCCD không khớp với thế kỷ sinh và giới tính';
    }
  }

  return null;
}
