'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Lang = 'en' | 'ur';

const T = {
  en: {
    nav_home: 'Home', nav_marketplace: 'Marketplace', nav_dashboard: 'Dashboard',
    nav_login: 'Login', nav_register: 'Register', nav_logout: 'Logout',
    nav_lang: 'اردو',
    hero_title: "Pakistan's #1 Cattle Marketplace",
    hero_sub: 'Buy & Sell Cattle Online — Trusted by Farmers Across Pakistan',
    hero_search: 'Search by breed, location...',
    hero_browse: 'Browse Listings', hero_sell: 'Sell Your Cattle',
    stat_listings: 'Active Listings', stat_sellers: 'Verified Sellers',
    stat_breeds: 'Cattle Breeds', stat_cities: 'Cities',
    mp_title: 'Browse Cattle', mp_no_results: 'No cattle found. Try different filters.',
    mp_all: 'All', mp_filter_cat: 'Category', mp_filter_loc: 'Location',
    mp_filter_price: 'Price Range', mp_search: 'Search listings...',
    card_price: 'Price', card_age: 'Age', card_weight: 'Weight',
    card_breed: 'Breed', card_location: 'Location',
    card_view: 'View Details', card_contact: 'Contact Seller',
    dash_title: 'My Dashboard', dash_listings: 'My Listings',
    dash_add: 'Add New Cattle', dash_empty: 'No listings yet. Add your first cattle!',
    dash_views: 'Views', dash_status: 'Status', dash_edit: 'Edit', dash_delete: 'Delete',
    dash_total: 'Total Listings', dash_active: 'Active', dash_sold: 'Sold',
    login_title: 'Welcome Back', login_email: 'Email Address',
    login_pass: 'Password', login_btn: 'Login',
    login_no_acc: "Don't have an account?", login_reg: 'Register Now',
    reg_title: 'Create Account', reg_name: 'Full Name', reg_email: 'Email Address',
    reg_phone: 'Phone Number', reg_pass: 'Password', reg_role: 'I am a...',
    reg_location: 'City / District', reg_btn: 'Create Account',
    reg_have_acc: 'Already have an account?', reg_login: 'Login',
    role_farmer: 'Farmer', role_buyer: 'Buyer', role_trader: 'Trader',
    add_title: 'Add New Cattle', add_name: 'Animal Name / ID', add_breed: 'Breed',
    add_cat: 'Category', add_price: 'Price (PKR)', add_age: 'Age (e.g. 2 years)',
    add_weight: 'Weight (kg)', add_gender: 'Gender', add_loc: 'Location',
    add_desc: 'Description (optional)', add_health: 'Health Notes (optional)',
    add_images: 'Upload Photos', add_submit: 'Post Listing', add_cancel: 'Cancel',
    add_uploading: 'Uploading...', add_success: 'Cattle listed successfully!',
    verified: 'Verified', not_verified: 'Not Verified',
    male: 'Male', female: 'Female', loading: 'Loading...', error: 'Something went wrong.',
    footer_tag: "Pakistan's trusted cattle marketplace", footer_rights: 'All rights reserved.',
    seller_profile: 'Seller Profile', seller_listings: 'Listings by this Seller',
    seller_rating: 'Rating', seller_location: 'Location', seller_joined: 'Member since',
    contact_whatsapp: 'WhatsApp Seller',
  },
  ur: {
    nav_home: 'ہوم', nav_marketplace: 'مارکیٹ', nav_dashboard: 'ڈیش بورڈ',
    nav_login: 'لاگ ان', nav_register: 'رجسٹر', nav_logout: 'لاگ آؤٹ',
    nav_lang: 'English',
    hero_title: 'پاکستان کی نمبر ون مویشی مارکیٹ',
    hero_sub: 'آن لائن مویشی خریدیں اور فروخت کریں — لاکھوں کسانوں کا اعتماد',
    hero_search: 'نسل یا مقام سے تلاش کریں...',
    hero_browse: 'فہرست دیکھیں', hero_sell: 'مویشی فروخت کریں',
    stat_listings: 'فعال اشتہارات', stat_sellers: 'تصدیق شدہ فروخت کنندگان',
    stat_breeds: 'مویشیوں کی نسلیں', stat_cities: 'شہر',
    mp_title: 'مویشی براؤز کریں', mp_no_results: 'کوئی مویشی نہیں ملا۔',
    mp_all: 'تمام', mp_filter_cat: 'قسم', mp_filter_loc: 'مقام',
    mp_filter_price: 'قیمت کی حد', mp_search: 'فہرست تلاش کریں...',
    card_price: 'قیمت', card_age: 'عمر', card_weight: 'وزن',
    card_breed: 'نسل', card_location: 'مقام',
    card_view: 'تفصیلات دیکھیں', card_contact: 'فروخت کنندہ سے رابطہ',
    dash_title: 'میرا ڈیش بورڈ', dash_listings: 'میری فہرستیں',
    dash_add: 'نئے مویشی شامل کریں', dash_empty: 'ابھی کوئی فہرست نہیں۔',
    dash_views: 'مناظر', dash_status: 'حالت', dash_edit: 'ترمیم', dash_delete: 'حذف',
    dash_total: 'کل فہرستیں', dash_active: 'فعال', dash_sold: 'فروخت',
    login_title: 'خوش آمدید', login_email: 'ای میل',
    login_pass: 'پاسورڈ', login_btn: 'لاگ ان',
    login_no_acc: 'اکاؤنٹ نہیں ہے؟', login_reg: 'ابھی رجسٹر کریں',
    reg_title: 'اکاؤنٹ بنائیں', reg_name: 'پورا نام', reg_email: 'ای میل',
    reg_phone: 'فون نمبر', reg_pass: 'پاسورڈ', reg_role: 'میں ہوں...',
    reg_location: 'شہر / ضلع', reg_btn: 'اکاؤنٹ بنائیں',
    reg_have_acc: 'پہلے سے اکاؤنٹ ہے؟', reg_login: 'لاگ ان',
    role_farmer: 'کسان', role_buyer: 'خریدار', role_trader: 'تاجر',
    add_title: 'نئے مویشی شامل کریں', add_name: 'جانور کا نام', add_breed: 'نسل',
    add_cat: 'قسم', add_price: 'قیمت (PKR)', add_age: 'عمر',
    add_weight: 'وزن (کلو)', add_gender: 'صنف', add_loc: 'مقام',
    add_desc: 'تفصیل (اختیاری)', add_health: 'صحت کے نوٹس (اختیاری)',
    add_images: 'تصاویر اپلوڈ کریں', add_submit: 'اشتہار پوسٹ کریں', add_cancel: 'منسوخ',
    add_uploading: 'اپلوڈ ہو رہا ہے...', add_success: 'مویشی کامیابی سے درج ہو گیا!',
    verified: 'تصدیق شدہ', not_verified: 'غیر تصدیق شدہ',
    male: 'نر', female: 'مادہ', loading: 'لوڈ ہو رہا ہے...', error: 'کچھ غلط ہوا۔',
    footer_tag: 'پاکستان کی قابل اعتماد مویشی مارکیٹ', footer_rights: 'تمام حقوق محفوظ ہیں۔',
    seller_profile: 'فروخت کنندہ پروفائل', seller_listings: 'اس فروخت کنندہ کی فہرستیں',
    seller_rating: 'ریٹنگ', seller_location: 'مقام', seller_joined: 'رکن بنے',
    contact_whatsapp: 'واٹس ایپ کریں',
  },
} as const;

type TKey = keyof typeof T['en'];

interface LangCtx {
  lang: Lang;
  t: (k: TKey) => string;
  toggle: () => void;
  isUrdu: boolean;
}

const LangContext = createContext<LangCtx>({} as LangCtx);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('atx_lang') as Lang;
    if (saved) setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    localStorage.setItem('atx_lang', lang);
  }, [lang]);

  const toggle = () => setLang(p => p === 'en' ? 'ur' : 'en');
  const t = (k: TKey) => T[lang][k] as string;

  return (
    <LangContext.Provider value={{ lang, t, toggle, isUrdu: lang === 'ur' }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
