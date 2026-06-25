export const PROVINCES = [
  'Punjab',
  'Sindh',
  'KPK',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Kashmir',
  'Islamabad'
];

export const CITIES_BY_PROVINCE: Record<string, string[]> = {
  'Punjab': [
    'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 
    'Bahawalpur', 'Sargodha', 'Gujrat', 'Sahiwal', 'Okara', 'Jhang', 
    'Rahim Yar Khan', 'Kasur', 'Sheikhupura', 'Mianwali', 'Dera Ghazi Khan', 'Chiniot'
  ],
  'Sindh': [
    'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpur Khas', 
    'Thatta', 'Shikarpur', 'Jacobabad', 'Khairpur'
  ],
  'KPK': [
    'Peshawar', 'Mardan', 'Mingora', 'Kohat', 'Abbottabad', 'Dera Ismail Khan', 
    'Nowshera', 'Swabi', 'Mansehra'
  ],
  'Balochistan': [
    'Quetta', 'Turbat', 'Khuzdar', 'Hub', 'Chaman', 'Gwadar', 'Sibi'
  ],
  'Gilgit-Baltistan': [
    'Gilgit', 'Skardu', 'Hunza', 'Diamer'
  ],
  'Azad Kashmir': [
    'Muzaffarabad', 'Mirpur', 'Rawalakot', 'Kotli'
  ],
  'Islamabad': [
    'Islamabad'
  ]
};
