export type UserRole = 'aggregator' | 'officer' | 'enforcement';

export interface AuthState {
  isLoggedIn: boolean;
  role: UserRole;
  user: { name: string; company?: string; designation?: string } | null;
}

export const mockCompanies = [
  { id: 'ola', name: 'Ola', type: 'Aggregator' as const, licenseNo: 'DL/AGG/2024/001', licenseStatus: 'Active', licenseGranted: '01/04/2024', licenseExpiry: '31/03/2029', fleetSize: 12450, evPercent: 34, walletBalance: 245000, complianceRate: 78, contactName: 'Bhavish Aggarwal', contactEmail: 'ops@olacabs.com', contactPhone: '+91 98100 12345', address: 'Koramangala, Bengaluru → Delhi: Connaught Place', categories: ['4W-Passenger', '3W-Passenger', '2W'], fleetBreakdown: { '2W': 1800, '3W': 2650, '4W': 8000 }, fuelBreakdown: { Electric: 4233, CNG: 5600, Petrol: 2617 }, history: [
      { date: '01/04/2024', event: 'License Granted', detail: 'Aggregator license DL/AGG/2024/001 issued for 5 years' },
      { date: '15/06/2024', event: 'Fleet Declared', detail: 'Initial fleet of 8,200 vehicles declared' },
      { date: '01/10/2024', event: 'EV Milestone', detail: 'Crossed 20% EV adoption for 4W category' },
      { date: '15/12/2025', event: 'Penalty Issued', detail: 'Late fortnightly declaration — ₹50,000 fine' },
      { date: '01/03/2026', event: 'Fleet Update', detail: 'Fleet expanded to 12,450 vehicles' },
    ]},
  { id: 'uber', name: 'Uber', type: 'Aggregator' as const, licenseNo: 'DL/AGG/2024/002', licenseStatus: 'Active', licenseGranted: '15/04/2024', licenseExpiry: '14/04/2029', fleetSize: 9800, evPercent: 28, walletBalance: 189000, complianceRate: 65, contactName: 'Prabhjeet Singh', contactEmail: 'delhi-ops@uber.com', contactPhone: '+91 98200 67890', address: 'Cybercity, Gurugram → Delhi: Nehru Place', categories: ['4W-Passenger', '3W-Passenger'], fleetBreakdown: { '2W': 0, '3W': 1960, '4W': 7840 }, fuelBreakdown: { Electric: 2744, CNG: 4900, Petrol: 2156 }, history: [
      { date: '15/04/2024', event: 'License Granted', detail: 'Aggregator license issued' },
      { date: '01/07/2024', event: 'Fleet Declared', detail: 'Initial 6,500 vehicles declared' },
      { date: '20/03/2026', event: 'Penalty Issued', detail: 'Insurance lapse for 3 vehicles — ₹25,000 fine' },
    ]},
  { id: 'rapido', name: 'Rapido', type: 'Aggregator' as const, licenseNo: 'DL/AGG/2024/003', licenseStatus: 'Active', licenseGranted: '01/05/2024', licenseExpiry: '30/04/2029', fleetSize: 8200, evPercent: 45, walletBalance: 156000, complianceRate: 82, contactName: 'Aravind Sanka', contactEmail: 'aravind@rapido.bike', contactPhone: '+91 96320 11111', address: 'Banjara Hills, Hyderabad → Delhi: Rajiv Chowk', categories: ['2W', '3W-Passenger'], fleetBreakdown: { '2W': 5740, '3W': 2460, '4W': 0 }, fuelBreakdown: { Electric: 3690, CNG: 2460, Petrol: 2050 }, history: [
      { date: '01/05/2024', event: 'License Granted', detail: 'Aggregator license issued' },
      { date: '28/03/2026', event: 'Penalty Issued', detail: 'Fleet count mismatch — ₹75,000 fine' },
    ]},
  { id: 'zomato', name: 'Zomato', type: 'DSP' as const, licenseNo: 'DL/AGG/2024/004', licenseStatus: 'Pending Renewal', licenseGranted: '10/05/2024', licenseExpiry: '09/05/2029', fleetSize: 15600, evPercent: 22, walletBalance: 312000, complianceRate: 55, contactName: 'Deepinder Goyal', contactEmail: 'fleet@zomato.com', contactPhone: '+91 95550 22222', address: 'Sector 10A, Gurugram → Delhi: Janpath', categories: ['2W', '3W-LCV', '4W-Carrier'], fleetBreakdown: { '2W': 10920, '3W': 3120, '4W': 1560 }, fuelBreakdown: { Electric: 3432, CNG: 6240, Petrol: 5928 }, history: [
      { date: '10/05/2024', event: 'License Granted', detail: 'DSP license issued for delivery operations' },
      { date: '15/03/2026', event: 'Penalty Issued', detail: 'Late declaration — ₹50,000 fine' },
      { date: '25/03/2026', event: 'Renewal Requested', detail: 'License renewal application submitted (pending)' },
    ]},
  { id: 'swiggy', name: 'Swiggy', type: 'DSP' as const, licenseNo: 'DL/AGG/2024/005', licenseStatus: 'Active', licenseGranted: '20/05/2024', licenseExpiry: '19/05/2029', fleetSize: 14200, evPercent: 19, walletBalance: 287000, complianceRate: 48, contactName: 'Sriharsha Majety', contactEmail: 'fleet@swiggy.in', contactPhone: '+91 90010 33333', address: 'RMZ Infinity, Bengaluru → Delhi: Saket', categories: ['2W', '3W-LCV'], fleetBreakdown: { '2W': 11360, '3W': 2840, '4W': 0 }, fuelBreakdown: { Electric: 2698, CNG: 4260, Petrol: 7242 }, history: [
      { date: '20/05/2024', event: 'License Granted', detail: 'DSP license issued' },
      { date: '01/03/2026', event: 'Penalty Issued', detail: 'EV non-compliance — ₹2,00,000 fine (appealed)' },
    ]},
  { id: 'shadowfax', name: 'Shadowfax', type: 'DSP' as const, licenseNo: 'DL/AGG/2024/006', licenseStatus: 'Active', licenseGranted: '01/06/2024', licenseExpiry: '31/05/2029', fleetSize: 6800, evPercent: 52, walletBalance: 98000, complianceRate: 88, contactName: 'Abhishek Bansal', contactEmail: 'ops@shadowfax.in', contactPhone: '+91 87650 44444', address: 'HSR Layout, Bengaluru → Delhi: Okhla Phase-I', categories: ['2W', '3W-LCV', '4W-Carrier'], fleetBreakdown: { '2W': 3400, '3W': 2040, '4W': 1360 }, fuelBreakdown: { Electric: 3536, CNG: 2040, Petrol: 1224 }, history: [
      { date: '01/06/2024', event: 'License Granted', detail: 'DSP license issued' },
      { date: '15/01/2026', event: 'EV Milestone', detail: 'Crossed 50% EV adoption — industry leader' },
    ]},
];


export const mockFleet = [
  { regNo: 'DL1CAB1234', category: '4W Sedan', fuelType: 'CNG', status: 'Active', isEV: false },
  { regNo: 'DL1CAB1235', category: '4W Sedan', fuelType: 'Electric', status: 'Active', isEV: true },
  { regNo: 'DL1CAB1236', category: '4W SUV', fuelType: 'Petrol', status: 'Active', isEV: false },
  { regNo: 'DL2EV0001', category: '2W Scooter', fuelType: 'Electric', status: 'Active', isEV: true },
  { regNo: 'DL2EV0002', category: '2W Scooter', fuelType: 'Electric', status: 'Active', isEV: true },
  { regNo: 'DL3RK0001', category: '3W Auto', fuelType: 'CNG', status: 'Active', isEV: false },
  { regNo: 'DL3RK0002', category: '3W Auto', fuelType: 'Electric', status: 'Active', isEV: true },
  { regNo: 'DL1CAB1237', category: '4W Sedan', fuelType: 'Electric', status: 'Inactive', isEV: true },
  { regNo: 'DL2PT0003', category: '2W Bike', fuelType: 'Petrol', status: 'Active', isEV: false },
  { regNo: 'DL1CAB1238', category: '4W Hatchback', fuelType: 'CNG', status: 'Active', isEV: false },
];

export const evTargets = [
  { phase: '6 Months', twoW: 100, threeW: 10, fourW: 5 },
  { phase: '1 Year', twoW: 100, threeW: 25, fourW: 15 },
  { phase: '2 Years', twoW: 100, threeW: 50, fourW: 30 },
  { phase: '3 Years', twoW: 100, threeW: 75, fourW: 50 },
  { phase: '4 Years', twoW: 100, threeW: 90, fourW: 75 },
  { phase: '5 Years', twoW: 100, threeW: 100, fourW: 90 },
  { phase: 'Apr 1, 2030', twoW: 100, threeW: 100, fourW: 100 },
];

export const currentCompliance = { twoW: 85, threeW: 18, fourW: 12 };

export const feeStructure = [
  { fuelType: 'Electric (EV)', twoW: '₹0', threeW: '₹0', fourW: '₹0' },
  { fuelType: 'CNG', twoW: '₹50', threeW: '₹75', fourW: '₹100' },
  { fuelType: 'Petrol', twoW: '₹100', threeW: '₹150', fourW: '₹200' },
  { fuelType: 'Diesel', twoW: '₹150', threeW: '₹175', fourW: '₹200' },
];

export const mockTransactions = [
  { id: 'TXN001', date: '15/03/2026', description: 'Annual License Fee', amount: -25000, status: 'Completed' },
  { id: 'TXN002', date: '10/03/2026', description: 'Wallet Top-up', amount: 100000, status: 'Completed' },
  { id: 'TXN003', date: '01/03/2026', description: 'Fleet Registration Fee (45 vehicles)', amount: -6750, status: 'Completed' },
  { id: 'TXN004', date: '15/02/2026', description: 'Penalty — Late Declaration', amount: -5000, status: 'Completed' },
  { id: 'TXN005', date: '01/02/2026', description: 'Wallet Top-up', amount: 200000, status: 'Completed' },
];

export const mockGrievances = [
  { id: 'GRV-2026-001', subject: 'License renewal delay', status: 'Resolved', filed: '01/03/2026', slaDeadline: '02/03/2026' },
  { id: 'GRV-2026-002', subject: 'Incorrect EV count in declaration', status: 'Under Review', filed: '10/03/2026', slaDeadline: '11/03/2026' },
  { id: 'GRV-2026-003', subject: 'Penalty wrongly levied', status: 'Pending', filed: '22/03/2026', slaDeadline: '23/03/2026' },
];

export const formatINR = (amount: number): string => {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN');
  return `${amount < 0 ? '-' : ''}₹${formatted}`;
};

export const getDaysTo2030 = (): number => {
  const target = new Date('2030-04-01');
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

// ── Admin Mock Data ──────────────────────────────────────────────

export type ApplicationStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'More Info Requested';

export interface LicenseApplication {
  id: string;
  companyName: string;
  companyType: 'Aggregator' | 'DSP';
  cin: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  filedDate: string;
  status: ApplicationStatus;
  categories: string[];
  documents: { name: string; uploaded: boolean; verified: boolean }[];
  evCommitment: string;
  address: string;
}

export const mockApplications: LicenseApplication[] = [
  {
    id: 'APP-2026-001', companyName: 'BluSmart Mobility', companyType: 'Aggregator', cin: 'U74120DL2019PTC349295',
    contactName: 'Anmol Jaggi', contactEmail: 'anmol@blusmart.in', contactPhone: '+91 98110 45678',
    filedDate: '18/03/2026', status: 'Pending', categories: ['4W-Passenger'],
    documents: [
      { name: 'Certificate of Incorporation', uploaded: true, verified: false },
      { name: 'PAN Card', uploaded: true, verified: false },
      { name: 'GST Certificate', uploaded: true, verified: false },
      { name: 'Fleet Insurance Policy', uploaded: true, verified: false },
      { name: 'Proof of Registered Address', uploaded: true, verified: false },
    ],
    evCommitment: '100% EV from Day 1', address: 'Sector 44, Gurugram, Haryana'
  },
  {
    id: 'APP-2026-002', companyName: 'Yulu Bikes', companyType: 'Aggregator', cin: 'U72900KA2017PTC104857',
    contactName: 'Amit Gupta', contactEmail: 'amit@yulu.bike', contactPhone: '+91 99001 23456',
    filedDate: '20/03/2026', status: 'Under Review', categories: ['2W'],
    documents: [
      { name: 'Certificate of Incorporation', uploaded: true, verified: true },
      { name: 'PAN Card', uploaded: true, verified: true },
      { name: 'GST Certificate', uploaded: true, verified: false },
      { name: 'Fleet Insurance Policy', uploaded: true, verified: false },
      { name: 'Proof of Registered Address', uploaded: true, verified: false },
    ],
    evCommitment: '100% EV (2W mandate)', address: 'HSR Layout, Bengaluru → Delhi Office: Connaught Place'
  },
  {
    id: 'APP-2026-003', companyName: 'Bounce', companyType: 'Aggregator', cin: 'U72200KA2014PTC073865',
    contactName: 'Vivekananda HR', contactEmail: 'vivek@bounce.bike', contactPhone: '+91 88005 67890',
    filedDate: '22/03/2026', status: 'Pending', categories: ['2W', '3W-Passenger'],
    documents: [
      { name: 'Certificate of Incorporation', uploaded: true, verified: false },
      { name: 'PAN Card', uploaded: true, verified: false },
      { name: 'GST Certificate', uploaded: false, verified: false },
      { name: 'Fleet Insurance Policy', uploaded: true, verified: false },
      { name: 'Proof of Registered Address', uploaded: true, verified: false },
    ],
    evCommitment: '80% EV within 1 year', address: 'Koramangala, Bengaluru → Delhi Office: Nehru Place'
  },
  {
    id: 'APP-2026-004', companyName: 'Porter Logistics', companyType: 'DSP', cin: 'U60300MH2014PTC261051',
    contactName: 'Pranav Goel', contactEmail: 'pranav@porter.in', contactPhone: '+91 77009 12345',
    filedDate: '25/03/2026', status: 'Pending', categories: ['4W-Carrier', '3W-LCV'],
    documents: [
      { name: 'Certificate of Incorporation', uploaded: true, verified: false },
      { name: 'PAN Card', uploaded: true, verified: false },
      { name: 'GST Certificate', uploaded: true, verified: false },
      { name: 'Fleet Insurance Policy', uploaded: false, verified: false },
      { name: 'Proof of Registered Address', uploaded: false, verified: false },
    ],
    evCommitment: '25% EV in first year', address: 'Lower Parel, Mumbai → Delhi Office: Okhla Phase-II'
  },
  {
    id: 'APP-2025-012', companyName: 'MoEVing Urban', companyType: 'DSP', cin: 'U74999DL2020PTC365812',
    contactName: 'Vikash Mishra', contactEmail: 'vikash@moeving.in', contactPhone: '+91 85270 44321',
    filedDate: '10/01/2026', status: 'Approved', categories: ['3W-LCV', '4W-Carrier'],
    documents: [
      { name: 'Certificate of Incorporation', uploaded: true, verified: true },
      { name: 'PAN Card', uploaded: true, verified: true },
      { name: 'GST Certificate', uploaded: true, verified: true },
      { name: 'Fleet Insurance Policy', uploaded: true, verified: true },
      { name: 'Proof of Registered Address', uploaded: true, verified: true },
    ],
    evCommitment: '100% EV from Day 1', address: 'Okhla Industrial Estate, New Delhi'
  },
  {
    id: 'APP-2025-009', companyName: 'Instamart Express', companyType: 'DSP', cin: 'U52100KA2021PTC148756',
    contactName: 'Rahul Jain', contactEmail: 'rahul@instamartex.in', contactPhone: '+91 96543 21098',
    filedDate: '05/12/2025', status: 'Rejected', categories: ['2W', '3W-LCV'],
    documents: [
      { name: 'Certificate of Incorporation', uploaded: true, verified: true },
      { name: 'PAN Card', uploaded: true, verified: true },
      { name: 'GST Certificate', uploaded: false, verified: false },
      { name: 'Fleet Insurance Policy', uploaded: false, verified: false },
      { name: 'Proof of Registered Address', uploaded: true, verified: true },
    ],
    evCommitment: '10% EV initially', address: 'Whitefield, Bengaluru'
  },
];

export interface FleetVerifyRecord {
  regNo: string;
  aggregator: string;
  category: string;
  fuelType: string;
  rcValid: boolean;
  insuranceValid: boolean;
  puccValid: boolean;
  verified: boolean;
  flagged: boolean;
  lastChecked: string;
}

export const mockFleetVerify: FleetVerifyRecord[] = [
  { regNo: 'DL1CAB1234', aggregator: 'Ola', category: '4W Sedan', fuelType: 'CNG', rcValid: true, insuranceValid: true, puccValid: true, verified: true, flagged: false, lastChecked: '28/03/2026' },
  { regNo: 'DL1CAB1235', aggregator: 'Ola', category: '4W Sedan', fuelType: 'Electric', rcValid: true, insuranceValid: true, puccValid: true, verified: true, flagged: false, lastChecked: '28/03/2026' },
  { regNo: 'DL1CAB1236', aggregator: 'Uber', category: '4W SUV', fuelType: 'Petrol', rcValid: true, insuranceValid: false, puccValid: true, verified: false, flagged: true, lastChecked: '25/03/2026' },
  { regNo: 'DL2EV0001', aggregator: 'Rapido', category: '2W Scooter', fuelType: 'Electric', rcValid: true, insuranceValid: true, puccValid: true, verified: true, flagged: false, lastChecked: '27/03/2026' },
  { regNo: 'DL2EV0002', aggregator: 'Rapido', category: '2W Scooter', fuelType: 'Electric', rcValid: true, insuranceValid: true, puccValid: true, verified: false, flagged: false, lastChecked: '—' },
  { regNo: 'DL3RK0001', aggregator: 'Ola', category: '3W Auto', fuelType: 'CNG', rcValid: true, insuranceValid: true, puccValid: false, verified: false, flagged: true, lastChecked: '20/03/2026' },
  { regNo: 'DL3RK0002', aggregator: 'Uber', category: '3W Auto', fuelType: 'Electric', rcValid: true, insuranceValid: true, puccValid: true, verified: true, flagged: false, lastChecked: '26/03/2026' },
  { regNo: 'DL1CAB1237', aggregator: 'Zomato', category: '4W Sedan', fuelType: 'Electric', rcValid: false, insuranceValid: true, puccValid: true, verified: false, flagged: true, lastChecked: '15/03/2026' },
  { regNo: 'DL2PT0003', aggregator: 'Swiggy', category: '2W Bike', fuelType: 'Petrol', rcValid: true, insuranceValid: true, puccValid: true, verified: true, flagged: false, lastChecked: '29/03/2026' },
  { regNo: 'DL1CAB1238', aggregator: 'Shadowfax', category: '4W Hatchback', fuelType: 'CNG', rcValid: true, insuranceValid: true, puccValid: true, verified: false, flagged: false, lastChecked: '—' },
  { regNo: 'DL4EV0010', aggregator: 'Zomato', category: '2W Scooter', fuelType: 'Electric', rcValid: true, insuranceValid: false, puccValid: true, verified: false, flagged: true, lastChecked: '22/03/2026' },
  { regNo: 'DL1SUV0044', aggregator: 'Uber', category: '4W SUV', fuelType: 'Electric', rcValid: true, insuranceValid: true, puccValid: true, verified: true, flagged: false, lastChecked: '30/03/2026' },
];

export interface PenaltyRecord {
  id: string;
  aggregator: string;
  type: string;
  amount: number;
  issuedDate: string;
  status: 'Active' | 'Paid' | 'Waived' | 'Appealed';
  description: string;
}

export const mockPenalties: PenaltyRecord[] = [
  { id: 'PEN-2026-001', aggregator: 'Zomato', type: 'Late Declaration', amount: 50000, issuedDate: '15/03/2026', status: 'Active', description: 'Failed to submit fortnightly fleet declaration for period 01-15 Mar 2026' },
  { id: 'PEN-2026-002', aggregator: 'Swiggy', type: 'EV Non-Compliance', amount: 200000, issuedDate: '01/03/2026', status: 'Appealed', description: 'EV percentage below 10% threshold for 4W category at 12-month review' },
  { id: 'PEN-2026-003', aggregator: 'Uber', type: 'Insurance Lapse', amount: 25000, issuedDate: '20/03/2026', status: 'Paid', description: '3 vehicles found with expired fleet insurance during random audit' },
  { id: 'PEN-2025-015', aggregator: 'Ola', type: 'Late Declaration', amount: 50000, issuedDate: '15/12/2025', status: 'Paid', description: 'Fortnightly declaration submitted 4 days late for period 01-15 Dec 2025' },
  { id: 'PEN-2026-004', aggregator: 'Rapido', type: 'Data Mismatch', amount: 75000, issuedDate: '28/03/2026', status: 'Active', description: 'Fleet count mismatch between VAHAN records and submitted declaration' },
];

export interface AdminGrievance {
  id: string;
  aggregator: string;
  subject: string;
  status: 'Pending' | 'Under Review' | 'Resolved' | 'Escalated';
  filedDate: string;
  slaDeadline: string;
  priority: 'Low' | 'Medium' | 'High';
  description: string;
}

export const mockAdminGrievances: AdminGrievance[] = [
  { id: 'GRV-2026-001', aggregator: 'Ola', subject: 'License renewal delay — 15 days overdue', status: 'Resolved', filedDate: '01/03/2026', slaDeadline: '02/03/2026', priority: 'High', description: 'License renewal application stuck for 15 days without status update.' },
  { id: 'GRV-2026-002', aggregator: 'Uber', subject: 'Incorrect EV count in quarterly report', status: 'Under Review', filedDate: '10/03/2026', slaDeadline: '11/03/2026', priority: 'Medium', description: 'The quarterly report shows 28% EV but our records show 32% due to 12 recently added vehicles.' },
  { id: 'GRV-2026-003', aggregator: 'Rapido', subject: 'Penalty wrongly levied — duplicate entry', status: 'Pending', filedDate: '22/03/2026', slaDeadline: '23/03/2026', priority: 'High', description: 'PEN-2026-004 was issued based on VAHAN sync lag. We request waiver with proof of correct declaration.' },
  { id: 'GRV-2026-004', aggregator: 'Zomato', subject: 'Wallet deduction without notification', status: 'Pending', filedDate: '25/03/2026', slaDeadline: '26/03/2026', priority: 'Medium', description: 'Rs 50,000 penalty deducted from wallet without prior email/SMS notification.' },
  { id: 'GRV-2026-005', aggregator: 'Swiggy', subject: 'Request for EV target extension', status: 'Escalated', filedDate: '28/03/2026', slaDeadline: '29/03/2026', priority: 'Low', description: 'Due to supply chain issues, requesting 90-day extension for 4W EV induction target.' },
  { id: 'GRV-2026-006', aggregator: 'Shadowfax', subject: 'Portal bug — cannot upload PUCC', status: 'Under Review', filedDate: '29/03/2026', slaDeadline: '30/03/2026', priority: 'Medium', description: 'Upload button for PUCC document gives 500 error. Tried 3 browsers.' },
];
