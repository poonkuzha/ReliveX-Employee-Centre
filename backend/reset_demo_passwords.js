const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const pw = 'password123';
  const hash = await bcrypt.hash(pw, 10);
  const res = await Employee.updateMany(
    { employeeId: { $in: ['RLX001', 'RLX002', 'RLX003', 'RLX004', 'RLX005', 'RLX009'] } },
    { password: hash }
  );
  console.log('updated', res.modifiedCount);
  const user = await Employee.findOne({ employeeId: 'RLX005' }).select('+password');
  console.log('RLX005 hashed', user.password);
  console.log('compare', await user.comparePassword(pw));
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });