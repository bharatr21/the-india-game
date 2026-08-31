// The 28 states and 8 union territories of India, current as of the Jan 2020
// reorganisation (J&K split into J&K + Ladakh in Aug 2019; Dadra & Nagar Haveli
// merged with Daman & Diu in Jan 2020).
//
// `code`    ISO 3166-2:IN, current as of the 23 Nov 2023 revision. Identity.
// `lgdCode` Local Government Directory, Ministry of Panchayati Raj. Joins to map data.
//
// Both are display-only: neither is ever accepted as a typed answer.
const ENTITY_LIST = [
  // --- 28 states ---
  { code: 'AP', name: 'Andhra Pradesh', type: 'state', lgdCode: 28, capital: 'Amaravati', capitalAliases: [], nameAliases: [] },
  { code: 'AR', name: 'Arunachal Pradesh', type: 'state', lgdCode: 12, capital: 'Itanagar', capitalAliases: [], nameAliases: [] },
  { code: 'AS', name: 'Assam', type: 'state', lgdCode: 18, capital: 'Dispur', capitalAliases: [], nameAliases: [] },
  { code: 'BR', name: 'Bihar', type: 'state', lgdCode: 10, capital: 'Patna', capitalAliases: [], nameAliases: [] },
  { code: 'CG', name: 'Chhattisgarh', type: 'state', lgdCode: 22, capital: 'Raipur', capitalAliases: ['Nava Raipur', 'Atal Nagar'], nameAliases: [] },
  { code: 'GA', name: 'Goa', type: 'state', lgdCode: 30, capital: 'Panaji', capitalAliases: ['Panjim'], nameAliases: [] },
  { code: 'GJ', name: 'Gujarat', type: 'state', lgdCode: 24, capital: 'Gandhinagar', capitalAliases: [], nameAliases: [] },
  { code: 'HR', name: 'Haryana', type: 'state', lgdCode: 6, capital: 'Chandigarh', capitalAliases: [], nameAliases: [] },
  { code: 'HP', name: 'Himachal Pradesh', type: 'state', lgdCode: 2, capital: 'Shimla', capitalAliases: ['Dharamshala', 'Dharamsala'], nameAliases: [] },
  { code: 'JH', name: 'Jharkhand', type: 'state', lgdCode: 20, capital: 'Ranchi', capitalAliases: [], nameAliases: [] },
  { code: 'KA', name: 'Karnataka', type: 'state', lgdCode: 29, capital: 'Bengaluru', capitalAliases: ['Bangalore'], nameAliases: [] },
  { code: 'KL', name: 'Kerala', type: 'state', lgdCode: 32, capital: 'Thiruvananthapuram', capitalAliases: ['Trivandrum'], nameAliases: [] },
  { code: 'MP', name: 'Madhya Pradesh', type: 'state', lgdCode: 23, capital: 'Bhopal', capitalAliases: [], nameAliases: [] },
  { code: 'MH', name: 'Maharashtra', type: 'state', lgdCode: 27, capital: 'Mumbai', capitalAliases: ['Nagpur', 'Bombay'], nameAliases: [] },
  { code: 'MN', name: 'Manipur', type: 'state', lgdCode: 14, capital: 'Imphal', capitalAliases: [], nameAliases: [] },
  { code: 'ML', name: 'Meghalaya', type: 'state', lgdCode: 17, capital: 'Shillong', capitalAliases: [], nameAliases: [] },
  { code: 'MZ', name: 'Mizoram', type: 'state', lgdCode: 15, capital: 'Aizawl', capitalAliases: [], nameAliases: [] },
  { code: 'NL', name: 'Nagaland', type: 'state', lgdCode: 13, capital: 'Kohima', capitalAliases: [], nameAliases: [] },
  { code: 'OD', name: 'Odisha', type: 'state', lgdCode: 21, capital: 'Bhubaneswar', capitalAliases: [], nameAliases: ['Orissa'] },
  { code: 'PB', name: 'Punjab', type: 'state', lgdCode: 3, capital: 'Chandigarh', capitalAliases: [], nameAliases: [] },
  { code: 'RJ', name: 'Rajasthan', type: 'state', lgdCode: 8, capital: 'Jaipur', capitalAliases: [], nameAliases: [] },
  { code: 'SK', name: 'Sikkim', type: 'state', lgdCode: 11, capital: 'Gangtok', capitalAliases: [], nameAliases: [] },
  { code: 'TN', name: 'Tamil Nadu', type: 'state', lgdCode: 33, capital: 'Chennai', capitalAliases: ['Madras'], nameAliases: [] },
  { code: 'TS', name: 'Telangana', type: 'state', lgdCode: 36, capital: 'Hyderabad', capitalAliases: [], nameAliases: [] },
  { code: 'TR', name: 'Tripura', type: 'state', lgdCode: 16, capital: 'Agartala', capitalAliases: [], nameAliases: [] },
  { code: 'UP', name: 'Uttar Pradesh', type: 'state', lgdCode: 9, capital: 'Lucknow', capitalAliases: [], nameAliases: [] },
  { code: 'UK', name: 'Uttarakhand', type: 'state', lgdCode: 5, capital: 'Dehradun', capitalAliases: ['Gairsain'], nameAliases: ['Uttaranchal'] },
  { code: 'WB', name: 'West Bengal', type: 'state', lgdCode: 19, capital: 'Kolkata', capitalAliases: ['Calcutta'], nameAliases: [] },
  // --- 8 union territories ---
  { code: 'AN', name: 'Andaman & Nicobar Islands', type: 'ut', lgdCode: 35, capital: 'Sri Vijaya Puram', capitalAliases: ['Port Blair'], nameAliases: ['Andaman and Nicobar Islands', 'Andaman and Nicobar'] },
  { code: 'CH', name: 'Chandigarh', type: 'ut', lgdCode: 4, capital: 'Chandigarh', capitalAliases: [], nameAliases: [] },
  { code: 'DH', name: 'Dadra & Nagar Haveli and Daman & Diu', type: 'ut', lgdCode: 38, capital: 'Daman', capitalAliases: [], nameAliases: ['Dadra and Nagar Haveli and Daman and Diu', 'Dadra and Nagar Haveli', 'Daman and Diu'] },
  { code: 'DL', name: 'Delhi', type: 'ut', lgdCode: 7, capital: 'New Delhi', capitalAliases: [], nameAliases: ['NCT of Delhi', 'National Capital Territory of Delhi'] },
  { code: 'JK', name: 'Jammu & Kashmir', type: 'ut', lgdCode: 1, capital: 'Srinagar', capitalAliases: ['Jammu'], nameAliases: ['Jammu and Kashmir'] },
  { code: 'LA', name: 'Ladakh', type: 'ut', lgdCode: 37, capital: 'Leh', capitalAliases: ['Kargil'], nameAliases: [] },
  { code: 'LD', name: 'Lakshadweep', type: 'ut', lgdCode: 31, capital: 'Kavaratti', capitalAliases: [], nameAliases: [] },
  { code: 'PY', name: 'Puducherry', type: 'ut', lgdCode: 34, capital: 'Puducherry', capitalAliases: ['Pondicherry'], nameAliases: ['Pondicherry'] },
] as const

export type Entity = (typeof ENTITY_LIST)[number]
export type EntityCode = Entity['code']
export type EntityType = Entity['type']

export const ENTITIES: readonly Entity[] = ENTITY_LIST

export const ENTITY_BY_CODE: ReadonlyMap<EntityCode, Entity> = new Map(
  ENTITY_LIST.map((entity) => [entity.code, entity]),
)

export const ENTITY_BY_LGD: ReadonlyMap<number, Entity> = new Map(
  ENTITY_LIST.map((entity) => [entity.lgdCode, entity]),
)
