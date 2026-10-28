import { format, parseISO, isToday, isYesterday } from 'date-fns';

export function formatCurrency(amount: number, currency = 'INR'): string {
  const localeMap: Record<string, string> = {
    INR: 'en-IN',
    GBP: 'en-GB',
    USD: 'en-US',
    EUR: 'de-DE'
  };
  const locale = localeMap[currency] || 'en-IN';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd MMM yyyy');
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM');
}

export function getCategoryInfo(categoryId: string) {
  const map: Record<string, { label: string; icon: string; color: string; description: string }> = {
    food: { label: 'Canteen, Mess & Food', icon: '🍔', color: '#f97316', description: 'Canteen snacks, hostel mess, cafeteria meals' },
    transport: { label: 'Bus, Metro & Commute', icon: '🚌', color: '#3b82f6', description: 'College bus pass, metro recharge, auto rickshaw' },
    housing: { label: 'Hostel & PG Rent', icon: '🏠', color: '#8b5cf6', description: 'Hostel fees, PG rent, room amenities' },
    utilities: { label: 'Wi-Fi, Recharge & Power', icon: '⚡', color: '#eab308', description: 'Jio/Airtel recharge, room Wi-Fi, electricity' },
    entertainment: { label: 'Outings, Movies & Hangouts', icon: '🎬', color: '#ec4899', description: 'Weekend movies, gaming, campus fest' },
    healthcare: { label: 'Health & Pharmacy', icon: '🏥', color: '#14b8a6', description: 'Clinic prescription, medicines, gym' },
    shopping: { label: 'Supplies, Stationery & Gear', icon: '🛍️', color: '#f43f5e', description: 'Notebooks, lab records, stationery, printouts' },
    education: { label: 'Tuition, Books & Exams', icon: '📚', color: '#6366f1', description: 'Exam fees, textbooks, online courses' },
    travel: { label: 'Home Visits & Vacation', icon: '🚆', color: '#0ea5e9', description: 'IRCTC train tickets, redBus, vacation' },
    subscriptions: { label: 'EdTech, Tools & OTT', icon: '📱', color: '#a855f7', description: 'Spotify Student, ChatGPT, GitHub Copilot' },
    other: { label: 'Other Student Expenses', icon: '📌', color: '#64748b', description: 'Xerox, project hardware, misc college spends' },
    allowance: { label: 'Monthly Allowance / Parents', icon: '💵', color: '#10b981', description: 'Pocket money, monthly allowance from family' },
    scholarship: { label: 'Scholarship / Fellowship', icon: '🎓', color: '#059669', description: 'Academic merit awards, fee concessions' },
    part_time: { label: 'Part-Time Job / Tutoring', icon: '💼', color: '#047857', description: 'Web dev, coding tutor, campus assistant' },
    stipend: { label: 'Internship Stipend', icon: '💰', color: '#0d9488', description: 'Industry internship monthly stipend' },
    freelance: { label: 'Freelancing & Projects', icon: '💻', color: '#0284c7', description: 'Freelance design, coding projects' },
    gift: { label: 'Gifts & Awards', icon: '🎁', color: '#e11d48', description: 'Hackathon cash prize, birthday gifts' },
    other_income: { label: 'Other Student Income', icon: '✨', color: '#64748b', description: 'Miscellaneous student income' }
  };
  return map[categoryId] || map.other;
}
