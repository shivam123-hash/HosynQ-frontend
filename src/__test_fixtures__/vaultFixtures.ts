import {
  VaultHomeResponse,
  VaultItemApi,
  VaultLifeProfileDocsResponse,
} from '../services/vaultServices';

export const mockVaultAssetCar: VaultItemApi = {
  id: '11111111-1111-4111-8111-111111111101',
  category: 'ASSET',
  kind: 'VEHICLE',
  title: 'Hyundai Creta',
  provider: 'Hyundai',
  number: 'DL 3C AB 1234',
  dueOn: '2026-12-10',
  dueLabel: 'PUC',
  daysRemaining: 14,
  linkedItems: [
    {
      id: '11111111-1111-4111-8111-111111111102',
      category: 'INSURANCE',
      kind: 'MOTOR',
      title: 'Car insurance',
      visibility: 'ADULTS',
    },
  ],
  visibility: 'ADULTS',
};

export const mockVaultAssetHome: VaultItemApi = {
  id: '11111111-1111-4111-8111-111111111103',
  category: 'ASSET',
  kind: 'PROPERTY',
  title: 'Flat · Sector 45, Gurugram',
  provider: 'DLF Ridgewood',
  notes: '3BHK · Tower B',
  visibility: 'ADULTS',
};

export const mockVaultMotorPolicy: VaultItemApi = {
  id: '11111111-1111-4111-8111-111111111102',
  category: 'INSURANCE',
  kind: 'MOTOR',
  title: 'Car insurance',
  provider: 'HDFC ERGO Motor',
  number: '23110088997732',
  amount: 14250,
  sumInsured: 850000,
  dueOn: '2026-12-15',
  dueLabel: 'Renewal',
  daysRemaining: 19,
  hasFile: true,
  fileFormat: 'pdf',
  filePages: 4,
  fileUrl: 'https://example.com/hdfc-motor-policy.pdf',
  memberName: 'Rohan Sharma',
  coveredMembers: [{ memberId: '22222222-2222-4222-8222-222222222201', fullName: 'Rohan Sharma' }],
  assetId: mockVaultAssetCar.id,
  asset: {
    id: mockVaultAssetCar.id,
    title: 'Hyundai Creta',
    kind: 'VEHICLE',
    number: 'DL 3C AB 1234',
  },
  reminderLeadDays: [30, 7],
  visibility: 'ADULTS',
  canEdit: true,
  canDelete: true,
  createdAt: '2026-11-20T10:00:00.000Z',
};

export const mockVaultReadOnlyPolicy: VaultItemApi = {
  ...mockVaultMotorPolicy,
  id: '11111111-1111-4111-8111-111111111199',
  addedByMemberId: '99999999-9999-4999-8999-999999999999',
  canEdit: false,
  canDelete: false,
};

export const mockVaultHealthPolicy: VaultItemApi = {
  id: '11111111-1111-4111-8111-111111111104',
  category: 'INSURANCE',
  kind: 'HEALTH',
  title: 'Star Health Family Floater',
  provider: 'Star Health',
  number: 'SH99004411',
  amount: 28500,
  sumInsured: 1500000,
  dueOn: '2027-06-15',
  daysRemaining: 201,
  coveredMembers: [
    { memberId: '22222222-2222-4222-8222-222222222201', fullName: 'Rohan Sharma' },
    { memberId: '22222222-2222-4222-8222-222222222202', fullName: 'Priya Sharma' },
  ],
  visibility: 'ADULTS',
};

export const mockVaultLifePolicy: VaultItemApi = {
  id: '11111111-1111-4111-8111-111111111105',
  category: 'INSURANCE',
  kind: 'LIFE',
  title: 'LIC Jeevan Anand · Rohan',
  provider: 'LIC',
  number: 'LIC77881234',
  amount: 42000,
  sumInsured: 5000000,
  dueOn: '2027-08-01',
  daysRemaining: 248,
  visibility: 'ADULTS',
};

export const mockVaultBillElectric: VaultItemApi = {
  id: '11111111-1111-4111-8111-111111111106',
  category: 'UTILITIES',
  kind: 'ELECTRICITY',
  title: 'Electricity · BSES',
  provider: 'BSES',
  amount: 3420,
  repeatMonths: 1,
  dueOn: '2026-12-01',
  dueLabel: 'Due',
  daysRemaining: 5,
  canEdit: true,
  canDelete: true,
  visibility: 'EVERYONE',
};

export const mockVaultBillWaterPaid: VaultItemApi = {
  id: '11111111-1111-4111-8111-111111111107',
  category: 'UTILITIES',
  kind: 'WATER',
  title: 'Water · DJB',
  provider: 'DJB',
  amount: 640,
  repeatMonths: 1,
  paidOn: '2026-11-15',
  dueOn: '2026-12-15',
  daysRemaining: 19,
  visibility: 'EVERYONE',
};

export const mockVaultWarrantyTv: VaultItemApi = {
  id: '11111111-1111-4111-8111-111111111108',
  category: 'WARRANTY',
  kind: 'ELECTRONICS',
  title: 'Samsung TV Warranty',
  provider: 'Samsung India',
  dueOn: '2026-12-10',
  daysRemaining: 14,
  hasFile: true,
  fileFormat: 'jpg',
  filePages: 1,
  visibility: 'EVERYONE',
};

export const mockVaultIdentityDoc: VaultItemApi = {
  id: '11111111-1111-4111-8111-111111111109',
  category: 'IDENTITY',
  kind: 'PROPERTY_PAPERS',
  title: 'Flat Sale Deed · Sector 45',
  provider: 'Sub-Registrar Gurugram',
  number: 'DEED-2021-8891',
  dueOn: '2027-01-10',
  daysRemaining: 45,
  hasFile: true,
  fileFormat: 'pdf',
  filePages: 12,
  visibility: 'ADULTS',
};

export const mockVaultContacts: VaultItemApi[] = [
  {
    id: '11111111-1111-4111-8111-111111111110',
    category: 'CONTACTS',
    kind: 'DOCTOR',
    title: 'Dr. Mehta',
    role: 'Pediatrician',
    phone: '+91 98111 22334',
    hours: '9 AM – 6 PM',
    visibility: 'EVERYONE',
  },
  {
    id: '11111111-1111-4111-8111-111111111111',
    category: 'CONTACTS',
    kind: 'SCHOOL',
    title: 'St. Mary’s School office',
    role: 'School office',
    phone: '011 2345 6789',
    visibility: 'EVERYONE',
  },
  {
    id: '11111111-1111-4111-8111-111111111112',
    category: 'CONTACTS',
    kind: 'HOME_HELP',
    title: 'Ramesh',
    role: 'Electrician',
    phone: '+91 98765 43210',
    visibility: 'EVERYONE',
  },
];

export const mockVaultLifeProfileDocs: VaultLifeProfileDocsResponse = {
  success: true,
  familySize: 4,
  groups: [
    { type: 'PASSPORT', label: 'Passports', count: 1 },
    { type: 'AADHAAR', label: 'Aadhaar cards', count: 1 },
    { type: 'PAN', label: 'PAN cards', count: 1 },
  ],
  documents: [
    {
      id: 'lp-doc-1',
      memberId: '22222222-2222-4222-8222-222222222201',
      memberName: 'Rohan Sharma',
      type: 'PASSPORT',
      title: 'Rohan’s passport',
      number: 'Z4499112',
      expiresOn: '2026-12-26',
      daysRemaining: 30,
      hasFile: true,
      fileUrl: 'https://example.com/rohan-passport.pdf',
    },
    {
      id: 'lp-doc-2',
      memberId: '22222222-2222-4222-8222-222222222202',
      memberName: 'Priya Sharma',
      type: 'AADHAAR',
      title: 'Priya’s Aadhaar',
      number: '998877665544',
      hasFile: false,
    },
    {
      id: 'lp-doc-3',
      memberId: '22222222-2222-4222-8222-222222222201',
      memberName: 'Rohan Sharma',
      type: 'PAN',
      title: 'Rohan’s PAN',
      number: 'ABCDE1234F',
      hasFile: false,
    },
  ],
};

export const mockVaultHomeResponse: VaultHomeResponse = {
  success: true,
  familySize: 4,
  categories: [
    { category: 'IDENTITY', count: 1 },
    { category: 'INSURANCE', count: 3 },
    { category: 'UTILITIES', count: 2 },
    { category: 'WARRANTY', count: 1 },
    { category: 'ASSET', count: 2 },
    { category: 'CONTACTS', count: 3 },
  ],
  lifeProfileDocuments: mockVaultLifeProfileDocs.documents,
  overdue: [],
  upcoming: [mockVaultMotorPolicy],
  recent: [mockVaultMotorPolicy, mockVaultBillElectric],
};
