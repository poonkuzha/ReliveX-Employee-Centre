require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Employee = require('./models/Employee');
const Job      = require('./models/Job');
const Expense  = require('./models/Expense');
const Query    = require('./models/Query');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Only seed demo users if they don't exist
    const password = await bcrypt.hash('password123', 10);
    const demoEmployees = [
      { name: 'Arjun Mehta',     employeeId: 'RLX001', country: 'India', salary: 500000, role: 'CEO',     email: 'arjun.mehta@relivex.com',     password, photo: '' },
      { name: 'Priya Sharma',    employeeId: 'RLX002', country: 'India', salary: 200000, role: 'Finance', email: 'priya.sharma@relivex.com',     password, photo: '' },
      { name: 'Rahul Verma',     employeeId: 'RLX003', country: 'India', salary: 150000, role: 'Manager', email: 'rahul.verma@relivex.com',      password, photo: '' },
      { name: 'Sarah Johnson',   employeeId: 'RLX004', country: 'US',    salary: 180000, role: 'Manager', email: 'sarah.johnson@relivex.com',    password, photo: '' },
      { name: 'Kavya Nair',      employeeId: 'RLX005', country: 'India', salary: 110000, role: 'Developer',email: 'kavya.nair@relivex.com',       password, photo: '' },
      { name: 'Rohan Das',       employeeId: 'RLX006', country: 'India', salary: 85000,  role: 'Developer',email: 'rohan.das@relivex.com',        password, photo: '' },
      { name: 'Ananya Iyer',     employeeId: 'RLX007', country: 'India', salary: 55000,  role: 'Developer',email: 'ananya.iyer@relivex.com',      password, photo: '' },
      { name: 'Vikram Patel',    employeeId: 'RLX008', country: 'India', salary: 120000, role: 'Developer',email: 'vikram.patel@relivex.com',     password, photo: '' },
      { name: 'Michael Torres',  employeeId: 'RLX009', country: 'US',    salary: 160000, role: 'Developer',email: 'michael.torres@relivex.com',   password, photo: '' },
      { name: 'Emily Chen',      employeeId: 'RLX010', country: 'US',    salary: 105000, role: 'Developer',email: 'emily.chen@relivex.com',       password, photo: '' },
      { name: 'James Williams',  employeeId: 'RLX011', country: 'US',    salary: 82000,  role: 'Developer',email: 'james.williams@relivex.com',   password, photo: '' },
      { name: 'Aisha Patel',     employeeId: 'RLX012', country: 'India', salary: 95000,  role: 'Developer',email: 'aisha.patel@relivex.com',      password, photo: '' },
    ];

    let seededCount = 0;
    for (const demo of demoEmployees) {
      const exists = await Employee.findOne({ employeeId: demo.employeeId });
      if (!exists) {
        await Employee.create(demo);
        seededCount++;
      }
    }
    console.log(`👥 Seeded ${seededCount} new demo employees (existing users preserved)`);

    // ── Jobs ────────────────────────────────────────────────────
    await Job.insertMany([
      {
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'Bangalore, India',
        type: 'Full-time',
        salaryRange: { min: 120000, max: 200000, currency: 'INR' },
        description: 'Build and scale our CRM platform using Node.js, Angular and MongoDB.',
        requirements: ['5+ years experience', 'Node.js expertise', 'Angular knowledge'],
        skills: ['Node.js', 'Angular', 'MongoDB', 'TypeScript'],
        isActive: true
      },
      {
        title: 'Data Analyst',
        department: 'Analytics',
        location: 'Remote',
        type: 'Full-time',
        salaryRange: { min: 80000, max: 140000, currency: 'INR' },
        description: 'Analyse CRM data and generate actionable insights for business teams.',
        requirements: ['3+ years experience', 'SQL proficiency', 'Python knowledge'],
        skills: ['Python', 'SQL', 'Power BI', 'Tableau'],
        isActive: true
      },
      {
        title: 'Product Manager',
        department: 'Product',
        location: 'Mumbai, India',
        type: 'Full-time',
        salaryRange: { min: 150000, max: 250000, currency: 'INR' },
        description: 'Own the product roadmap for our employee and CRM modules.',
        requirements: ['5+ years PM experience', 'Agile/Scrum', 'Stakeholder management'],
        skills: ['Product Strategy', 'Agile', 'Roadmapping', 'Data Analysis'],
        isActive: true
      },
      {
        title: 'UI/UX Designer',
        department: 'Design',
        location: 'Hyderabad, India',
        type: 'Full-time',
        salaryRange: { min: 70000, max: 120000, currency: 'INR' },
        description: 'Design intuitive and beautiful interfaces for the Relivex platform.',
        requirements: ['3+ years UI/UX', 'Figma expertise', 'Angular Material knowledge'],
        skills: ['Figma', 'UI Design', 'Prototyping', 'Angular Material'],
        isActive: true
      },
      {
        title: 'DevOps Engineer',
        department: 'Infrastructure',
        location: 'Remote',
        type: 'Full-time',
        salaryRange: { min: 100000, max: 180000, currency: 'INR' },
        description: 'Manage CI/CD pipelines and cloud infrastructure for Relivex.',
        requirements: ['3+ years DevOps', 'AWS or GCP', 'Docker/Kubernetes'],
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
        isActive: true
      },
      {
        title: 'Senior Sales Executive',
        department: 'Sales',
        location: 'New York, US',
        type: 'Full-time',
        salaryRange: { min: 90000, max: 150000, currency: 'USD' },
        description: 'Drive enterprise CRM sales in the North American market.',
        requirements: ['5+ years B2B sales', 'CRM product knowledge', 'Strong network'],
        skills: ['B2B Sales', 'Negotiation', 'CRM Tools', 'Enterprise Sales'],
        isActive: true
      }
    ]);
    console.log('💼 Seeded 6 jobs');
    console.log('ℹ️ Skipping expense/query seeding due missing end-user IDs in seed script.');
    console.log('\n✅ Database seeded successfully!\n');
    console.log('═══════════════════════════════════════════════');
    console.log('  Test Credentials (all passwords: password123)');
    console.log('═══════════════════════════════════════════════');
    console.log('  CEO      → RLX001 / password123');
    console.log('  Finance  → RLX002 / password123');
    console.log('  Manager  → RLX003 / password123 (India)');
    console.log('  Manager  → RLX004 / password123 (US)');
    console.log('  Developer → RLX005 / password123 (India, High eligible)');
    console.log('  Developer → RLX009 / password123 (US, High eligible)');
    console.log('═══════════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
