const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const RecurringExpense = require('../models/RecurringExpense');
const Activity = require('../models/Activity');
const Group = require('../models/Group');
const SharedExpense = require('../models/SharedExpense');
const Settlement = require('../models/Settlement');
const Goal = require('../models/Goal');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

const categories = ['food', 'transport', 'housing', 'utilities', 'entertainment', 'healthcare', 'shopping', 'education', 'travel', 'subscriptions'];
const paymentMethods = ['cash', 'debit_card', 'credit_card', 'bank_transfer'];

const descriptions = {
  food: [
    'Campus Canteen Dosa & Chai', 'Hostel Mess Dinner', 'Cafeteria Lunch with Classmates',
    'Maggi & Coffee during Night Study', 'Swiggy Biryani Delivery', 'Campus Bakery Snack',
    'Juice Corner Refreshment', 'Zomato Group Order'
  ],
  transport: [
    'Metro Smartcard Recharge', 'College Bus Monthly Pass', 'Auto Rickshaw Share to Campus',
    'Rapido Bike Taxi', 'Petrol for Scooty', 'Local Train Ticket', 'Ola Share Ride'
  ],
  housing: [
    'Monthly Hostel Room Fee', 'PG Accommodation Share', 'Room Maintenance Deposit',
    'Hostel Room Amenities Fee'
  ],
  utilities: [
    'Jio 5G 84-Day Mobile Recharge', 'Hostel High-Speed Wi-Fi Share', 'Room Electricity Share',
    'Airtel Data Pack Top-up', 'Water Purifier Filter Share'
  ],
  entertainment: [
    'PVR Cinema Movie Ticket', 'Weekend Gaming Cafe Session', 'College Cultural Fest Pass',
    'Hangout at Food Street', 'Bowling with Hostel Friends', 'Board Game Night Snacks'
  ],
  healthcare: [
    'Campus Clinic Prescription', 'Pharmacy Medicines & Pain Relief', 'Gym Student Membership',
    'Multivitamins & Energy Drink', 'First Aid Supplies'
  ],
  shopping: [
    'Engineering Notebooks & Stationery', 'Lab Record Manuals & Files', 'Scientific Calculator',
    'College Backpack', 'Campus Printouts & Xerox', 'Semester Project Hardware Kit'
  ],
  education: [
    'Semester Exam Registration Fee', 'Engineering Textbooks Purchase', 'Udemy Full Stack Course',
    'NPTEL Certification Exam Fee', 'Coursera Student Specialization', 'Library Late Fine'
  ],
  travel: [
    'IRCTC Train Ticket Home Visit', 'RedBus Sleeper to Hometown', 'Class Trip to Heritage Site',
    'Semester Break Travel Booking'
  ],
  subscriptions: [
    'Spotify Student Premium', 'YouTube Premium Student Plan', 'GitHub Student Developer Pack',
    'ChatGPT Plus Study Share', 'Google One 100GB Storage', 'Notion Pro Student'
  ]
};

const amountRanges = {
  food: [30, 280],
  transport: [20, 220],
  housing: [4500, 7500],
  utilities: [150, 750],
  entertainment: [120, 600],
  healthcare: [50, 450],
  shopping: [50, 650],
  education: [200, 1800],
  travel: [250, 1500],
  subscriptions: [49, 399]
};

const tagPool = ['campus', 'hostel', 'project', 'reimbursable', 'essential', 'exam-prep', 'classmates', 'weekend'];

function randomBetween(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

function randomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  date.setHours(Math.floor(Math.random() * 14) + 8);
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randomTags() {
  if (Math.random() > 0.65) return [];
  const count = Math.random() > 0.6 ? 2 : 1;
  const shuffled = [...tagPool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Expense.deleteMany({}),
      Budget.deleteMany({}),
      RecurringExpense.deleteMany({}),
      Activity.deleteMany({}),
      Group.deleteMany({}),
      SharedExpense.deleteMany({}),
      Settlement.deleteMany({}),
      Goal.deleteMany({})
    ]);

    // Create demo user
    const user = await User.create({
      name: 'Sowmya',
      email: 'demo@expense.app',
      password: 'demo123',
      currency: 'INR',
      monthlyBudget: 15000
    });
    console.log('✅ Demo user created: Sowmya (demo@expense.app / demo123)');

    // Create admin user
    const adminUser = await User.create({
      name: 'Campus Admin',
      email: 'admin@expense.app',
      password: 'admin123',
      role: 'admin',
      currency: 'INR',
      monthlyBudget: 25000
    });
    console.log('✅ Admin user created (admin@expense.app / admin123)');

    const now = new Date();

    // Generate 90 days of expenses (~200 entries) in INR
    const expenses = [];
    for (let i = 0; i < 200; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const descs = descriptions[category];
      const [minAmt, maxAmt] = amountRanges[category];
      const amount = randomBetween(minAmt, maxAmt);
      const tags = randomTags();

      // Add splits to ~15% of food/shopping/project expenses
      let splits = [];
      if ((category === 'food' || category === 'shopping' || category === 'transport') && Math.random() > 0.85) {
        const half = +(amount / 2).toFixed(2);
        splits = [
          { label: 'My share', amount: half },
          { label: 'Roommate share', amount: +(amount - half).toFixed(2) }
        ];
      }

      expenses.push({
        user: user._id,
        amount,
        description: descs[Math.floor(Math.random() * descs.length)],
        category,
        date: randomDate(90),
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        isRecurring: Math.random() > 0.88,
        tags,
        splits,
        currency: 'INR',
        originalAmount: amount,
        exchangeRate: 1
      });
    }

    // Add sample foreign currency student expenses (e.g. international edtech, foreign textbook)
    const foreignCurrencyExpenses = [
      {
        user: user._id,
        description: 'Coursera International Specialization',
        category: 'education',
        amount: 3980.00,
        currency: 'USD',
        originalAmount: 48,
        exchangeRate: 83.10,
        date: daysAgo(6),
        paymentMethod: 'credit_card',
        isRecurring: false,
        tags: ['project'],
        splits: []
      },
      {
        user: user._id,
        description: 'IEEE Student Conference Paper Fee',
        category: 'education',
        amount: 6350.00,
        currency: 'EUR',
        originalAmount: 70,
        exchangeRate: 90.85,
        date: daysAgo(18),
        paymentMethod: 'credit_card',
        isRecurring: false,
        tags: ['project', 'reimbursable'],
        splits: []
      },
      {
        user: user._id,
        description: 'GitHub Student Copilot Subscription',
        category: 'subscriptions',
        amount: 831.00,
        currency: 'USD',
        originalAmount: 10,
        exchangeRate: 83.10,
        date: daysAgo(24),
        paymentMethod: 'debit_card',
        isRecurring: true,
        tags: ['project'],
        splits: []
      }
    ];

    const studentIncomes = [
      {
        user: user._id,
        type: 'income',
        description: 'Monthly Allowance from Parents',
        category: 'allowance',
        amount: 15000,
        currency: 'INR',
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        paymentMethod: 'bank_transfer',
        isRecurring: true,
        notes: 'Monthly college pocket money & mess allowance'
      },
      {
        user: user._id,
        type: 'income',
        description: 'Merit-cum-Means Scholarship Disbursement',
        category: 'scholarship',
        amount: 5000,
        currency: 'INR',
        date: new Date(now.getFullYear(), now.getMonth(), 5),
        paymentMethod: 'bank_transfer',
        notes: 'State academic excellence scholarship'
      },
      {
        user: user._id,
        type: 'income',
        description: 'Part-Time Web Dev & Python Tutoring',
        category: 'part_time',
        amount: 3500,
        currency: 'INR',
        date: new Date(now.getFullYear(), now.getMonth(), 12),
        paymentMethod: 'bank_transfer',
        notes: 'Weekend coding workshops for 1st-year students'
      },
      {
        user: user._id,
        type: 'income',
        description: 'Last Month Allowance from Parents',
        category: 'allowance',
        amount: 15000,
        currency: 'INR',
        date: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        paymentMethod: 'bank_transfer',
        isRecurring: true
      },
      {
        user: user._id,
        type: 'income',
        description: 'Hackathon 1st Runner Up Cash Award',
        category: 'gift',
        amount: 2500,
        currency: 'INR',
        date: new Date(now.getFullYear(), now.getMonth() - 1, 18),
        paymentMethod: 'bank_transfer',
        notes: 'Campus TechFest Innovate26'
      }
    ];

    await Expense.insertMany([...expenses, ...foreignCurrencyExpenses, ...studentIncomes]);
    console.log(`✅ ${expenses.length + foreignCurrencyExpenses.length} student expenses & ${studentIncomes.length} incomes created`);

    // Create student category budgets for current month
    const budgetData = [
      { category: 'food', limit: 4000 },
      { category: 'transport', limit: 1500 },
      { category: 'housing', limit: 6500 },
      { category: 'utilities', limit: 800 },
      { category: 'entertainment', limit: 1200 },
      { category: 'shopping', limit: 1000 },
      { category: 'education', limit: 1800 },
      { category: 'subscriptions', limit: 400 }
    ];

    const budgets = budgetData.map(b => ({
      user: user._id, ...b, month: now.getMonth() + 1, year: now.getFullYear()
    }));

    await Budget.insertMany(budgets);
    console.log(`✅ ${budgets.length} student category budgets created`);

    // Create student savings goals
    const goalData = [
      {
        user: user._id,
        name: 'Semester Tuition & Lab Fees',
        targetAmount: 25000,
        currentAmount: 18500,
        category: 'education',
        color: '#10b981',
        targetDate: new Date(now.getFullYear(), now.getMonth() + 2, 15)
      },
      {
        user: user._id,
        name: 'Coding Laptop & External Monitor',
        targetAmount: 65000,
        currentAmount: 32000,
        category: 'shopping',
        color: '#3b82f6',
        targetDate: new Date(now.getFullYear(), now.getMonth() + 4, 30)
      },
      {
        user: user._id,
        name: 'Emergency Hostel Contingency Fund',
        targetAmount: 10000,
        currentAmount: 8200,
        category: 'housing',
        color: '#f59e0b',
        targetDate: new Date(now.getFullYear(), now.getMonth() + 1, 10)
      }
    ];
    await Goal.insertMany(goalData);
    console.log(`✅ ${goalData.length} student savings goals created`);

    // Create 5 recurring student expense templates
    const nextMonth1 = new Date(); nextMonth1.setDate(1); nextMonth1.setMonth(nextMonth1.getMonth() + 1);
    const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
    const next15 = new Date(); next15.setDate(15);
    if (next15 < now) next15.setMonth(next15.getMonth() + 1);

    const recurringTemplates = [
      {
        user: user._id,
        amount: 6500,
        description: 'Hostel & PG Room Rent',
        category: 'housing',
        paymentMethod: 'bank_transfer',
        frequency: 'monthly',
        nextDueDate: nextMonth1,
        isActive: true
      },
      {
        user: user._id,
        amount: 600,
        description: 'Monthly College Bus Pass',
        category: 'transport',
        paymentMethod: 'cash',
        frequency: 'monthly',
        nextDueDate: nextMonth1,
        isActive: true
      },
      {
        user: user._id,
        amount: 719,
        description: 'Jio 5G Unlimited Recharge',
        category: 'utilities',
        paymentMethod: 'debit_card',
        frequency: 'monthly',
        nextDueDate: next15,
        isActive: true
      },
      {
        user: user._id,
        amount: 59,
        description: 'Spotify Student Premium',
        category: 'subscriptions',
        paymentMethod: 'debit_card',
        frequency: 'monthly',
        nextDueDate: nextWeek,
        isActive: true
      },
      {
        user: user._id,
        amount: 250,
        description: 'Hostel Wi-Fi Shared Contribution',
        category: 'utilities',
        paymentMethod: 'cash',
        frequency: 'monthly',
        nextDueDate: nextMonth1,
        isActive: true
      }
    ];

    await RecurringExpense.insertMany(recurringTemplates);
    console.log(`✅ ${recurringTemplates.length} recurring expense templates created`);

    // Create 20 activity log entries
    const actions = [
      { action: 'login', entityType: 'auth', metadata: { email: user.email } },
      { action: 'expense_created', entityType: 'expense', metadata: { amount: 80, description: 'Campus Canteen Dosa & Chai', category: 'food' } },
      { action: 'expense_created', entityType: 'expense', metadata: { amount: 59, description: 'Spotify Student Premium', category: 'subscriptions' } },
      { action: 'budget_set', entityType: 'budget', metadata: { category: 'food', limit: 4000 } },
      { action: 'expense_updated', entityType: 'expense', metadata: { amount: 120, description: 'Maggi & Coffee during Night Study', category: 'food' } },
      { action: 'expense_created', entityType: 'expense', metadata: { amount: 450, description: 'Engineering Notebooks & Stationery', category: 'shopping' } },
      { action: 'recurring_generated', entityType: 'recurring', metadata: { count: 2 } },
      { action: 'expense_created', entityType: 'expense', metadata: { amount: 6500, description: 'Monthly Hostel Room Fee', category: 'housing' } },
      { action: 'budget_set', entityType: 'budget', metadata: { category: 'transport', limit: 1500 } },
      { action: 'login', entityType: 'auth', metadata: { email: user.email } },
      { action: 'expense_created', entityType: 'expense', metadata: { amount: 200, description: 'Metro Smartcard Recharge', category: 'transport' } },
      { action: 'expense_created', entityType: 'expense', metadata: { amount: 719, description: 'Jio 5G 84-Day Mobile Recharge', category: 'utilities' } },
      { action: 'expense_created', entityType: 'expense', metadata: { amount: 350, description: 'Semester Exam Registration Fee', category: 'education' } },
      { action: 'expense_created', entityType: 'expense', metadata: { amount: 250, description: 'PVR Cinema Student Ticket', category: 'entertainment' } },
      { action: 'expense_created', entityType: 'expense', metadata: { amount: 150, description: 'Pharmacy Medicines & Pain Relief', category: 'healthcare' } },
      { action: 'recurring_generated', entityType: 'recurring', metadata: { count: 1 } },
      { action: 'budget_set', entityType: 'budget', metadata: { category: 'entertainment', limit: 1200 } }
    ];

    const activityEntries = actions.map((a, i) => {
      const date = new Date();
      date.setHours(date.getHours() - (i * 5));
      return { user: user._id, ...a, createdAt: date, updatedAt: date };
    });

    await Activity.insertMany(activityEntries);
    console.log(`✅ ${activityEntries.length} activity log entries created`);

    // ── Student Groups ────────────────────────────────────────────────────────

    // Group 1: Hostel Room B-204
    const hostelGroup = await Group.create({
      name: 'Hostel Room B-204',
      description: 'Shared room expenses, Wi-Fi, water jars and late-night snacks',
      owner: user._id,
      currency: 'INR',
      members: [
        { user: user._id, role: 'owner', status: 'active', joinedAt: daysAgo(60) },
        { user: adminUser._id, role: 'member', status: 'active', joinedAt: daysAgo(58) }
      ]
    });
    console.log('✅ Group "Hostel Room B-204" created');

    const hostelExpenses = [
      { description: 'Hostel 100 Mbps Wi-Fi Router Bill', category: 'utilities', amount: 899, daysBack: 2 },
      { description: 'Bisleri 20L Water Jars (4 Cans)', category: 'utilities', amount: 320, daysBack: 5 },
      { description: 'Late Night Study Snacks & Chai', category: 'food', amount: 480, daysBack: 8 },
      { description: 'Room Cleaning & Floor Mop Supplies', category: 'shopping', amount: 240, daysBack: 12 },
      { description: 'Weekend Dinner Biryani Bucket', category: 'food', amount: 750, daysBack: 15 },
      { description: 'Room Multi-Plug Extension Cord', category: 'utilities', amount: 450, daysBack: 22 }
    ];

    const hostelExpenseDocs = [];
    for (const exp of hostelExpenses) {
      const paidBy = Math.random() > 0.5 ? user._id : adminUser._id;
      const perPerson = +(exp.amount / 2).toFixed(2);
      const remainder = +(exp.amount - perPerson * 2).toFixed(2);
      hostelExpenseDocs.push({
        group: hostelGroup._id,
        paidBy,
        amount: exp.amount,
        currency: 'INR',
        description: exp.description,
        category: exp.category,
        date: daysAgo(exp.daysBack),
        splitType: 'equal',
        splits: [
          { user: user._id, amount: +(perPerson + remainder).toFixed(2), isPaid: false },
          { user: adminUser._id, amount: perPerson, isPaid: false }
        ]
      });
    }

    await SharedExpense.insertMany(hostelExpenseDocs);
    console.log(`✅ ${hostelExpenseDocs.length} shared expenses created for "Hostel Room B-204"`);

    // Settlements for Hostel Room B-204
    await Settlement.insertMany([
      {
        group: hostelGroup._id,
        paidBy: adminUser._id,
        paidTo: user._id,
        amount: 450,
        currency: 'INR',
        note: 'UPI transfer for Wi-Fi share',
        createdAt: daysAgo(10)
      },
      {
        group: hostelGroup._id,
        paidBy: user._id,
        paidTo: adminUser._id,
        amount: 240,
        currency: 'INR',
        note: 'Google Pay for Biryani dinner',
        createdAt: daysAgo(4)
      }
    ]);
    console.log('✅ 2 settlements created for "Hostel Room B-204"');

    // Group 2: Final Year Project Team
    const projectGroup = await Group.create({
      name: 'Final Year Project Team',
      description: 'Major project hardware, sensors, report printing and cloud hosting',
      owner: user._id,
      currency: 'INR',
      members: [
        { user: user._id, role: 'owner', status: 'active', joinedAt: daysAgo(40) },
        { user: adminUser._id, role: 'member', status: 'active', joinedAt: daysAgo(38) }
      ]
    });
    console.log('✅ Group "Final Year Project Team" created');

    const projectExpenses = [
      { description: 'Arduino & Sensor Modules Kit', category: 'shopping', amount: 1650, daysBack: 5 },
      { description: 'Project Report Hard Binding (4 Copies)', category: 'education', amount: 800, daysBack: 10 },
      { description: 'Cloud Server Hosting for Demo', category: 'subscriptions', amount: 620, daysBack: 15 },
      { description: 'Color Posters for Project Exhibition', category: 'education', amount: 450, daysBack: 20 }
    ];

    const projectDocs = projectExpenses.map(exp => {
      const perPerson = +(exp.amount / 2).toFixed(2);
      return {
        group: projectGroup._id,
        paidBy: user._id,
        amount: exp.amount,
        currency: 'INR',
        description: exp.description,
        category: exp.category,
        date: daysAgo(exp.daysBack),
        splitType: 'equal',
        splits: [
          { user: user._id, amount: perPerson, isPaid: true },
          { user: adminUser._id, amount: perPerson, isPaid: false }
        ]
      };
    });

    await SharedExpense.insertMany(projectDocs);
    console.log(`✅ ${projectDocs.length} shared expenses created for "Final Year Project Team"`);

    console.log('\n🎉 Sowmyya student database seed completed successfully!');
    console.log('Credentials:');
    console.log('   Email:    demo@expense.app');
    console.log('   Password: demo123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
