/**
 * Relivex Priority Engine
 * Range-based priority calculation for expense requests
 */

/**
 * Calculate priority based on amount, country, and salary range
 * @param {number} amount
 * @param {string} country
 * @param {number} salary
 * @returns {string} priority: 'High' | 'Medium' | 'Low' | 'Default'
 */
exports.calculatePriority = (amount, country, salary) => {
  if (country === 'India') {
    if (amount > 10000 && amount <= 100000 && salary >= 100000) return 'High';
    if (amount > 5000  && amount <= 50000  && salary >= 80000)  return 'Medium';
    if (amount > 5000  && amount <= 35000  && salary >= 50000)  return 'Low';
  }

  if (country === 'US') {
    if (amount > 10000 && amount <= 80000  && salary >= 150000) return 'High';
    if (amount > 8000  && amount <= 50000  && salary >= 100000) return 'Medium';
    if (amount > 5000  && amount <= 40000  && salary >= 80000)  return 'Low';
  }

  return 'Default';
};

/**
 * Finance Approval Logic
 * @param {string} priority
 * @param {number} order  (1-based request count for this employee)
 * @returns {string} 'Approved' | 'Rejected'
 */
exports.financeApprovalLogic = (priority, order) => {
  if (priority === 'High')                        return 'Approved';
  if (priority === 'Medium' && order === 1)       return 'Approved';
  if (priority === 'Medium' && order === 2)       return 'Approved';
  if (priority === 'Low'    && order === 1)       return 'Approved';
  if (priority === 'Low'    && order === 2)       return 'Rejected';
  return 'Rejected';
};

/**
 * CEO Approval Logic
 * @param {string} priority
 * @param {number} order
 * @param {string} country
 * @param {number} salary
 * @returns {string} 'Approved' | 'Rejected'
 */
exports.ceoApprovalLogic = (priority, order, country, salary) => {
  if (priority === 'High')  return 'Approved';
  if (priority === 'Medium' && order === 1) return 'Approved';
  if (priority === 'Medium' && order === 2 && country === 'India' && salary >= 100000) return 'Approved';
  return 'Rejected';
};
