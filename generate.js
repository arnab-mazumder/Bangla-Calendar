const fs = require('fs');
const path = require('path');

const START_DATE = new Date('2026-01-01');
const END_DATE = new Date('2026-12-31');

const MONTH_NAMES_BN = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];
const MONTH_NAMES_EN = ['Boishakh', 'Jyoishtho', 'Asharh', 'Shrabon', 'Bhadro', 'Ashwin', 'Kartik', 'Ogrohayon', 'Poush', 'Magh', 'Falgun', 'Choitro'];
const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const BN_NUMERALS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function toBengaliNumeral(num) {
  return String(num).replace(/\d/g, d => BN_NUMERALS[parseInt(d)]);
}

// Exactly matching the PDF
const transitions = [
  { gregorianEnd: '2026-01-14', bnMonthIdx: 8 /* Poush */, startDay: 16, bnYear: 1432 },
  { gregorianEnd: '2026-02-13', bnMonthIdx: 9 /* Magh */, startDay: 1, bnYear: 1432 },
  { gregorianEnd: '2026-03-15', bnMonthIdx: 10 /* Falgun */, startDay: 1, bnYear: 1432 },
  { gregorianEnd: '2026-04-14', bnMonthIdx: 11 /* Choitro */, startDay: 1, bnYear: 1432 },
  { gregorianEnd: '2026-05-15', bnMonthIdx: 0 /* Boishakh */, startDay: 1, bnYear: 1433 },
  { gregorianEnd: '2026-06-15', bnMonthIdx: 1 /* Jyoishtho */, startDay: 1, bnYear: 1433 },
  { gregorianEnd: '2026-07-17', bnMonthIdx: 2 /* Asharh */, startDay: 1, bnYear: 1433 },
  { gregorianEnd: '2026-08-18', bnMonthIdx: 3 /* Shrabon */, startDay: 1, bnYear: 1433 },
  { gregorianEnd: '2026-09-18', bnMonthIdx: 4 /* Bhadro */, startDay: 1, bnYear: 1433 },
  { gregorianEnd: '2026-10-18', bnMonthIdx: 5 /* Ashwin */, startDay: 1, bnYear: 1433 },
  { gregorianEnd: '2026-11-17', bnMonthIdx: 6 /* Kartik */, startDay: 1, bnYear: 1433 },
  { gregorianEnd: '2026-12-16', bnMonthIdx: 7 /* Ogrohayon */, startDay: 1, bnYear: 1433 },
  { gregorianEnd: '2026-12-31', bnMonthIdx: 8 /* Poush */, startDay: 1, bnYear: 1433 },
];

const events = {
  // Jan
  "2026-01-01": { text: "নিউইয়ার্স ডে" },
  "2026-01-03": { purnima: true, text: "পূর্ণিমা" },
  "2026-01-05": { text: "গুরু গোবিন্দ জন্ম" },
  "2026-01-12": { text: "বিবেকানন্দ জন্ম" },
  "2026-01-14": { ekadashi: true, text: "পৌষপার্বণ\nগঙ্গাসাগর স্নান" },
  "2026-01-17": { text: "রটন্তী কালী পূঃ\nশবেমিরাজ" },
  "2026-01-18": { amavasya: true },
  "2026-01-22": { text: "গণেশ পূজা" },
  "2026-01-23": { text: "সরস্বতী পূজা\nনেতাজি জন্ম" },
  "2026-01-26": { text: "প্রজাতন্ত্র দিবস" },
  "2026-01-29": { ekadashi: true },

  // Feb
  "2026-02-01": { purnima: true, text: "মাঘী পূর্ণিমা" },
  "2026-02-05": { text: "সঙ্কট নাঃ পূঃ" },
  "2026-02-06": { text: "ওঁকার পঞ্চমী" },
  "2026-02-13": { ekadashi: true },
  "2026-02-15": { text: "শিবরাত্রি" },
  "2026-02-17": { amavasya: true },
  "2026-02-19": { text: "রামকৃষ্ণ জন্মতিথি\nরমজান আরম্ভ" },
  "2026-02-27": { ekadashi: true },

  // Mar
  "2026-03-03": { purnima: true, text: "দোলযাত্রা\nচন্দ্রগ্রহণ" },
  "2026-03-04": { text: "হোলি উৎসব" },
  "2026-03-15": { ekadashi: true },
  "2026-03-17": { text: "বারুণী স্নান/শাবিকদর" },
  "2026-03-18": { amavasya: true },
  "2026-03-19": { text: "বাসন্তী\nনবরাত্রি আরম্ভ" },
  "2026-03-20": { text: "জুমাত-উল-বিদা" },
  "2026-03-21": { text: "ঈদুলফেতর" },
  "2026-03-25": { text: "বাসন্তী পূজা" },
  "2026-03-26": { text: "অন্নপূর্ণা পূজা" },
  "2026-03-27": { text: "রামনবমী" },
  "2026-03-29": { ekadashi: true },
  "2026-03-31": { text: "মহাবীর জয়ন্তী" },

  // Apr
  "2026-04-02": { purnima: true, text: "হনুমান জয়ন্তী" },
  "2026-04-03": { text: "গুডফ্রাইডে" },
  "2026-04-13": { ekadashi: true, text: "নীল পূজা" },
  "2026-04-14": { text: "আম্বেদকর জন্ম\nচড়ক পূজা" },
  "2026-04-15": { text: "নববর্ষারম্ভ" },
  "2026-04-17": { amavasya: true },
  "2026-04-20": { text: "অক্ষয় তৃতীয়া" },
  "2026-04-27": { ekadashi: true },

  // May
  "2026-05-01": { purnima: true, text: "মে দিবস/বুদ্ধ পূর্ণিমা\nগন্ধেশ্বরী পূজা" },
  "2026-05-09": { text: "রবীন্দ্রনাথ জঃ" },
  "2026-05-13": { ekadashi: true },
  "2026-05-16": { amavasya: true, text: "ফলহারিণী কালী পূঃ\nমলমাস আরঃ" },
  "2026-05-26": { text: "নজরুল জন্ম" },
  "2026-05-27": { ekadashi: true, text: "ঈদুজ্জোহা" },

  // Jun
  "2026-06-03": { text: "লোকনাথ তিঃ" },
  "2026-06-11": { ekadashi: true },
  "2026-06-15": { amavasya: true, text: "মলমাস সমাঃ" },
  "2026-06-20": { text: "জামাইষষ্ঠী" },
  "2026-06-22": { text: "অম্বুবাচী প্রবৃত্তিঃ" },
  "2026-06-24": { text: "দশহরা\nগঙ্গাপূজা" },
  "2026-06-26": { ekadashi: true, text: "অম্বুবাচী নিবৃত্তঃ\nমহরম" },
  "2026-06-29": { purnima: true, text: "স্নানযাত্রা" },

  // Jul
  "2026-07-01": { text: "বিধানচন্দ্র\nজন্ম/মৃত্যু" },
  "2026-07-06": { text: "শ্যামাপ্রসাদ জন্ম" },
  "2026-07-10": { ekadashi: true },
  "2026-07-14": { amavasya: true },
  "2026-07-16": { text: "রথযাত্রা" },
  "2026-07-18": { text: "বিপত্তারিণী ব্রত" },
  "2026-07-21": { text: "বিপত্তারিণী ব্রত" },
  "2026-07-24": { text: "পুনর্যাত্রা" },
  "2026-07-25": { ekadashi: true },
  "2026-07-28": { purnima: true },
  "2026-07-29": { text: "গুরুপূর্ণিমা" },

  // Aug
  "2026-08-03": { text: "নাগপঞ্চমী" },
  "2026-08-10": { ekadashi: true },
  "2026-08-12": { amavasya: true, text: "আঃ-চাঃশুঃ" },
  "2026-08-15": { text: "স্বাধীনতা দিবস" },
  "2026-08-18": { text: "মনসা পূঃ" },
  "2026-08-23": { text: "ঝুলনযাত্রা আঃ" },
  "2026-08-25": { ekadashi: true },
  "2026-08-26": { text: "ফতেহাদোয়াজদহম" },
  "2026-08-27": { purnima: true, text: "রাখীবন্ধন/রাখি পূর্ণিঃ\nঝুলনযাত্রা সমাঃ" },

  // Sep
  "2026-09-04": { text: "জন্মাষ্টমী" },
  "2026-09-05": { text: "নন্দোৎসব\nশিক্ষক দিবস" },
  "2026-09-07": { ekadashi: true },
  "2026-09-11": { amavasya: true },
  "2026-09-15": { text: "গণেশ পূজা" },
  "2026-09-18": { text: "বিশ্বকর্মা পূজা" },
  "2026-09-20": { text: "অনুকূল ঠাঃ\nজন্মতিথি" },
  "2026-09-22": { ekadashi: true },
  "2026-09-23": { text: "ফতেহাইইয়াজদহম" },
  "2026-09-25": { text: "অনন্ত চতুর্দশী" },
  "2026-09-26": { purnima: true, text: "বিদ্যাসাগর জন্ম" },

  // Oct
  "2026-10-02": { text: "গান্ধী জন্ম" },
  "2026-10-06": { ekadashi: true },
  "2026-10-09": { amavasya: true },
  "2026-10-10": { text: "মহালয়া" },
  "2026-10-17": { text: "দুর্গাপূজা-মহাসপ্তমী" },
  "2026-10-18": { text: "মহাসপ্তমী\n(অধিকপূজা)" },
  "2026-10-19": { text: "মহাষ্টমী" },
  "2026-10-20": { text: "মহানবমী" },
  "2026-10-21": { text: "বিজয়া দশমী" },
  "2026-10-22": { ekadashi: true },
  "2026-10-25": { purnima: true, text: "লক্ষ্মীপূজা" },

  // Nov
  "2026-11-05": { ekadashi: true },
  "2026-11-06": { text: "ধনতেরাস" },
  "2026-11-08": { amavasya: true, text: "কালীপূজা\nদীপাবলী" },
  "2026-11-11": { text: "ভ্রাতৃদ্বিতীয়া" },
  "2026-11-14": { text: "শিশু দিবস" },
  "2026-11-15": { text: "ছট্ পূজা" },
  "2026-11-17": { text: "কার্তিক পূজা" },
  "2026-11-18": { text: "জগদ্ধাত্রী পূজা" },
  "2026-11-20": { ekadashi: true },
  "2026-11-24": { purnima: true, text: "গুরু নানক জয়ন্তী\nরাসযাত্রা" },

  // Dec
  "2026-12-04": { ekadashi: true },
  "2026-12-08": { amavasya: true },
  "2026-12-20": { ekadashi: true },
  "2026-12-24": { purnima: true },
  "2026-12-25": { text: "বড়দিন" },
  "2026-12-30": { text: "সারদা জন্মতিথি" }
};

const amavasyaDates = [
  "2026-01-18", "2026-02-17", "2026-03-19", "2026-04-17",
  "2026-05-16", "2026-06-15", "2026-07-14", "2026-08-12",
  "2026-09-11", "2026-10-10", "2026-11-09", "2026-12-08"
];

const purnimaDates = [
  "2026-01-03", "2026-02-01", "2026-03-03", "2026-04-02",
  "2026-05-01", "2026-05-31", "2026-06-29", "2026-07-29",
  "2026-08-27", "2026-09-26", "2026-10-26", "2026-11-24",
  "2026-12-24"
];

const ekadashiDates = [
  "2026-01-14", "2026-01-29", "2026-02-13", "2026-02-27",
  "2026-03-15", "2026-03-29", "2026-04-13", "2026-04-27",
  "2026-05-13", "2026-05-27", "2026-06-11", "2026-06-25",
  "2026-07-10", "2026-07-25", "2026-08-09", "2026-08-23",
  "2026-09-07", "2026-09-22", "2026-10-06", "2026-10-22",
  "2026-11-05", "2026-11-20", "2026-12-04", "2026-12-20"
];

const calendarData = [];
let currentDate = new Date(START_DATE);
let transitionIndex = 0;
let currentBnDay = transitions[0].startDay;

while (currentDate <= END_DATE) {
  const dateStr = currentDate.toISOString().split('T')[0];
  const dayOfWeek = currentDate.getDay();
  const transition = transitions[transitionIndex];

  const evt = events[dateStr] || {};

  calendarData.push({
    englishDate: dateStr,
    englishDay: DAY_NAMES_EN[dayOfWeek],
    englishDayBn: DAY_NAMES_BN[dayOfWeek],
    bengaliDate: currentBnDay.toString(),
    bengaliDateBn: toBengaliNumeral(currentBnDay),
    bengaliMonth: MONTH_NAMES_BN[transition.bnMonthIdx],
    bengaliMonthEn: MONTH_NAMES_EN[transition.bnMonthIdx],
    bengaliYear: transition.bnYear.toString(),
    bengaliYearBn: toBengaliNumeral(transition.bnYear),
    
    // Explicit PDF events
    eventTextBn: evt.text || "",
    amavasya: amavasyaDates.includes(dateStr),
    purnima: purnimaDates.includes(dateStr),
    ekadashi: ekadashiDates.includes(dateStr),
  });

  if (dateStr === transition.gregorianEnd) {
    transitionIndex++;
    if (transitionIndex < transitions.length) {
      currentBnDay = transitions[transitionIndex].startDay;
    }
  } else {
    currentBnDay++;
  }

  currentDate.setDate(currentDate.getDate() + 1);
}

fs.writeFileSync(path.join(__dirname, 'calendar2026.json'), JSON.stringify(calendarData, null, 2));
console.log('Successfully generated calendar2026.json strictly based on the PDF.');
