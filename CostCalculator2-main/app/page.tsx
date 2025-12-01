'use client';

import { useState, useEffect } from 'react';

// Define tuition rates by campus and grade tier
const tuitionRates = {
  north: {
    'k4-5': 13000,
    '6-8': 15000,
    '9-12': 18000
  },
  south: {
    'k4-5': 11000,
    '6-8': 13000,
    '9-12': 15000
  }
};

// Map individual grades to rate tiers
function getGradeTier(grade: string): string | null {
  const k4_5_grades = ['k4', 'k5', '1st', '2nd', '3rd', '4th', '5th'];
  const six_eight_grades = ['6th', '7th', '8th'];
  const nine_twelve_grades = ['9th', '10th', '11th', '12th'];
  
  if (k4_5_grades.includes(grade)) {
    return 'k4-5';
  } else if (six_eight_grades.includes(grade)) {
    return '6-8';
  } else if (nine_twelve_grades.includes(grade)) {
    return '9-12';
  }
  return null;
}

// Function to format grade for display
function formatGradeDisplay(grade: string): string {
  const gradeDisplayMap: Record<string, string> = {
    'k4': 'K4',
    'k5': 'K5', 
    '1st': '1st',
    '2nd': '2nd',
    '3rd': '3rd',
    '4th': '4th',
    '5th': '5th',
    '6th': '6th',
    '7th': '7th',
    '8th': '8th',
    '9th': '9th',
    '10th': '10th',
    '11th': '11th',
    '12th': '12th'
  };
  return gradeDisplayMap[grade] || grade;
}

// Define income thresholds for Milwaukee residents
const milwaukeeThresholds = {
  1: { poverty: 15650, mpcp: 46950, cat3: 62600, cat4: 78250, cat5: 93900, cat6: 109550 },
  2: { poverty: 21150, mpcp: 63450, cat3: 84600, cat4: 105750, cat5: 126900, cat6: 148050 },
  3: { poverty: 26650, mpcp: 79950, cat3: 106600, cat4: 133250, cat5: 159900, cat6: 186550 },
  4: { poverty: 32150, mpcp: 96450, cat3: 128600, cat4: 160750, cat5: 192900, cat6: 225050 },
  5: { poverty: 37650, mpcp: 112950, cat3: 150600, cat4: 188250, cat5: 225900, cat6: 263550 },
  6: { poverty: 43150, mpcp: 129450, cat3: 172600, cat4: 215750, cat5: 258900, cat6: 302050 },
  7: { poverty: 48650, mpcp: 145950, cat3: 194600, cat4: 243250, cat5: 291900, cat6: 340550 },
  8: { poverty: 54150, mpcp: 162450, cat3: 216600, cat4: 270750, cat5: 324900, cat6: 379050 },
  9: { poverty: 59650, mpcp: 178950, cat3: 238600, cat4: 298250, cat5: 357900, cat6: 417550 },
  10: { poverty: 65150, mpcp: 195450, cat3: 260600, cat4: 325750, cat5: 390900, cat6: 456050 }
};

// Define income thresholds for non-Milwaukee residents
const nonMilwaukeeThresholds = {
  1: { poverty: 15650, mpcp: 34430, cat3: 62600, cat4: 78250, cat5: 93900, cat6: 109550 },
  2: { poverty: 21150, mpcp: 46530, cat3: 84600, cat4: 105750, cat5: 126900, cat6: 148050 },
  3: { poverty: 26650, mpcp: 58630, cat3: 106600, cat4: 133250, cat5: 159900, cat6: 186550 },
  4: { poverty: 32150, mpcp: 70730, cat3: 128600, cat4: 160750, cat5: 192900, cat6: 225050 },
  5: { poverty: 37650, mpcp: 82830, cat3: 150600, cat4: 188250, cat5: 225900, cat6: 263550 },
  6: { poverty: 43150, mpcp: 94930, cat3: 172600, cat4: 215750, cat5: 258900, cat6: 302050 },
  7: { poverty: 48650, mpcp: 107030, cat3: 194600, cat4: 243250, cat5: 291900, cat6: 340550 },
  8: { poverty: 54150, mpcp: 119130, cat3: 216600, cat4: 270750, cat5: 324900, cat6: 379050 },
  9: { poverty: 59650, mpcp: 131230, cat3: 238600, cat4: 298250, cat5: 357900, cat6: 417550 },
  10: { poverty: 65150, mpcp: 143330, cat3: 260600, cat4: 325750, cat5: 390900, cat6: 456050 }
};

// Define discount percentages and categories
const discountInfo = {
  category1: { percentage: 100, name: "Voucher Program Eligible", isChoice: true },
  category2: { percentage: 40, name: "40% Tuition Discount", isChoice: false },
  category3: { percentage: 30, name: "30% Tuition Discount", isChoice: false },
  category4: { percentage: 20, name: "20% Tuition Discount", isChoice: false },
  category5: { percentage: 10, name: "10% Tuition Discount", isChoice: false },
  category6: { percentage: 0, name: "Standard Tuition Rate", isChoice: false },
  beyond: { percentage: 0, name: "Standard Tuition Rate", isChoice: false }
};

type DiscountCategory = keyof typeof discountInfo;

function determineDiscountCategory(isMilwaukee: boolean, householdSize: number, income: number): DiscountCategory {
  const thresholds = isMilwaukee ? milwaukeeThresholds[householdSize as keyof typeof milwaukeeThresholds] : nonMilwaukeeThresholds[householdSize as keyof typeof nonMilwaukeeThresholds];
  
  if (!thresholds) return 'beyond';
  
  if (income <= thresholds.mpcp) {
    return 'category1';
  } else if (income <= thresholds.cat3) {
    return 'category2';
  } else if (income <= thresholds.cat4) {
    return 'category3';
  } else if (income <= thresholds.cat5) {
    return 'category4';
  } else if (income <= thresholds.cat6) {
    return 'category5';
  } else {
    return 'category6';
  }
}

function checkMarriageAdjustment(isMilwaukee: boolean, householdSize: number, income: number): boolean {
  const thresholds = isMilwaukee ? milwaukeeThresholds[householdSize as keyof typeof milwaukeeThresholds] : nonMilwaukeeThresholds[householdSize as keyof typeof nonMilwaukeeThresholds];
  
  if (!thresholds) return false;
  
  const choiceLimit = thresholds.mpcp;
  
  return income > choiceLimit && income <= (choiceLimit + 7000);
}

export default function TuitionCalculator() {
  const [campus, setCampus] = useState('');
  const [milwaukee, setMilwaukee] = useState('');
  const [householdSize, setHouseholdSize] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [siblingDiscount, setSiblingDiscount] = useState(false);
  
  const [showError, setShowError] = useState(false);
  const [showGradeWarning, setShowGradeWarning] = useState(false);
  const [showMarriageNote, setShowMarriageNote] = useState(false);
  const [marriageNoteText, setMarriageNoteText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showPaymentPlans, setShowPaymentPlans] = useState(false);
  
  const [results, setResults] = useState({
    baseTuition: 0,
    foundingFamiliesAmount: 0,
    siblingDiscountAmount: 0,
    financialAidPercentage: 0,
    financialAidAmount: 0,
    finalTuition: 0,
    isChoice: false,
    showFoundingFamilies: false,
    showSiblingDiscount: false,
    showFinancialAid: false,
    infoText: '',
    infoClass: '',
    finalTuitionLabel: '',
    fullPayment: 0,
    quarterlyPayment: 0,
    monthlyPayment: 0
  });

  useEffect(() => {
    checkGradeAvailability();
  }, [campus, gradeLevel]);

  const checkGradeAvailability = () => {
    const phasedGrades = ['7th', '8th', '10th', '11th', '12th'];
    
    if (campus === 'north' && phasedGrades.includes(gradeLevel)) {
      setShowGradeWarning(true);
    } else {
      setShowGradeWarning(false);
    }
  };

  const calculateTuition = () => {
    setShowError(false);
    setShowMarriageNote(false);

    const income = parseFloat(annualIncome);
    const houseSize = parseInt(householdSize);

    if (!campus || !milwaukee || !householdSize || annualIncome === '' || isNaN(income) || income < 0 || !gradeLevel) {
      setShowError(true);
      setShowResults(false);
      return;
    }

    const gradeTier = getGradeTier(gradeLevel);
    if (!gradeTier) {
      setShowError(true);
      setShowResults(false);
      return;
    }

    const baseTuition = tuitionRates[campus as keyof typeof tuitionRates][gradeTier as keyof typeof tuitionRates.north];
    
    let currentBalance = baseTuition;
    
    let foundingFamiliesDiscountAmount = 0;
    if (campus === 'north') {
      foundingFamiliesDiscountAmount = currentBalance * 0.10;
      currentBalance = currentBalance - foundingFamiliesDiscountAmount;
    }
    
    let siblingDiscountAmount = 0;
    if (siblingDiscount) {
      siblingDiscountAmount = currentBalance * 0.10;
      currentBalance = currentBalance - siblingDiscountAmount;
    }
    
    const isMilwaukee = milwaukee === 'yes';
    const category = determineDiscountCategory(isMilwaukee, houseSize, income);
    const discount = discountInfo[category];
    
    const nearChoiceLimit = checkMarriageAdjustment(isMilwaukee, houseSize, income);
    if (nearChoiceLimit) {
      const thresholds = isMilwaukee ? milwaukeeThresholds[houseSize as keyof typeof milwaukeeThresholds] : nonMilwaukeeThresholds[houseSize as keyof typeof nonMilwaukeeThresholds];
      const choiceLimit = thresholds.mpcp;
      const programName = isMilwaukee ? 'Milwaukee Parental Choice Program (MPCP)' : 'Wisconsin Parental Choice Program (WPCP)';
      const adjustedIncome = income - 7000;
      
      setMarriageNoteText(`Your current income of $${income.toLocaleString()} is just above the ${programName} limit of $${choiceLimit.toLocaleString()}. The Choice program provides a $7,000 income adjustment for married couples. This means if you are married, you should re-run this calculator with an adjusted income of $${adjustedIncome.toLocaleString()} (your actual income minus $7,000) to see if you qualify for the Choice program, which would result in no tuition charges if awarded a Choice scholarship.`);
      setShowMarriageNote(true);
    }
    
    let financialAidAmount = 0;
    if (discount.percentage > 0 && !discount.isChoice) {
      financialAidAmount = currentBalance * (discount.percentage / 100);
      currentBalance = currentBalance - financialAidAmount;
    }
    
    const finalTuition = currentBalance;

    let infoText = '';
    let infoClass = 'discount-info';
    
    if (discount.isChoice) {
      const programName = isMilwaukee ? 'Milwaukee Parental Choice Program' : 'Wisconsin Parental Choice Program';
      infoText = `<strong>Qualified for ${programName}.</strong> Students awarded a Choice scholarship pay no tuition. Apply separately; acceptance subject to seats and verification.`;
      infoClass = 'choice-program';
    } else if (discount.percentage > 0 || siblingDiscount || campus === 'north') {
      let discountText = '';
      if (discount.percentage > 0) discountText = `<strong>${discount.percentage}% Financial Aid Award</strong> based on income.`;
      if (siblingDiscount) discountText += (discountText ? '<br>' : '') + '<strong>10% Sibling Discount</strong> applied.';
      if (campus === 'north') discountText += (discountText ? '<br>' : '') + '<strong>10% Founding Families Discount</strong> applied.';
      
      discountText += '<br><br><strong><a href="https://www.augprep.org/apps/pages/admissions/connect" target="_blank">Contact Admissions</a></strong> for personalized options.';
      infoText = discountText;
    } else {
      infoText = 'Standard tuition rate applies based on estimated income.<br><br><strong><a href="https://www.augprep.org/apps/pages/admissions/connect" target="_blank">Contact Admissions</a></strong> for personalized options.';
    }

    const deposit = 500;
    const remainingBalance = Math.max(0, finalTuition - deposit);
    const fullPaymentDiscount = remainingBalance * 0.05;
    const fullPayment = remainingBalance - fullPaymentDiscount;
    const quarterlyPayment = Math.round(remainingBalance / 4);
    const monthlyPayment = Math.round(remainingBalance / 10);

    setResults({
      baseTuition,
      foundingFamiliesAmount: foundingFamiliesDiscountAmount,
      siblingDiscountAmount,
      financialAidPercentage: discount.percentage,
      financialAidAmount,
      finalTuition,
      isChoice: discount.isChoice,
      showFoundingFamilies: campus === 'north',
      showSiblingDiscount: siblingDiscount,
      showFinancialAid: discount.percentage > 0,
      infoText,
      infoClass,
      finalTuitionLabel: `Estimated Annual Tuition for your ${formatGradeDisplay(gradeLevel)} grade child:`,
      fullPayment,
      quarterlyPayment,
      monthlyPayment
    });

    setShowResults(true);
    setShowPaymentPlans(!discount.isChoice);

    setTimeout(() => {
      if (nearChoiceLimit) {
        document.getElementById('marriageNote')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="calculator-container">
      <div className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="campus">Select Campus</label>
            <select id="campus" value={campus} onChange={(e) => setCampus(e.target.value)} required>
              <option value="">Select...</option>
              <option value="north">Aug Prep North</option>
              <option value="south">Aug Prep South</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="milwaukee">Do you live in the City of Milwaukee?</label>
            <select id="milwaukee" value={milwaukee} onChange={(e) => setMilwaukee(e.target.value)} required>
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="householdSize">Household Size</label>
            <select id="householdSize" value={householdSize} onChange={(e) => setHouseholdSize(e.target.value)} required>
              <option value="">Select...</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="annualIncome">Annual Household Income</label>
            <input 
              type="number" 
              id="annualIncome" 
              placeholder="Enter your annual income" 
              value={annualIncome}
              onChange={(e) => setAnnualIncome(e.target.value)}
              required 
              min="0" 
              step="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gradeLevel">Student Grade Level</label>
            <select id="gradeLevel" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} required>
              <option value="">Select...</option>
              <option value="k4">K4 (4-year-old Kindergarten)</option>
              <option value="k5">K5 (5-year-old Kindergarten)</option>
              <option value="1st">1st Grade</option>
              <option value="2nd">2nd Grade</option>
              <option value="3rd">3rd Grade</option>
              <option value="4th">4th Grade</option>
              <option value="5th">5th Grade</option>
              <option value="6th">6th Grade</option>
              <option value="7th">7th Grade</option>
              <option value="8th">8th Grade</option>
              <option value="9th">9th Grade</option>
              <option value="10th">10th Grade</option>
              <option value="11th">11th Grade</option>
              <option value="12th">12th Grade</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                id="siblingDiscount"
                checked={siblingDiscount}
                onChange={(e) => setSiblingDiscount(e.target.checked)}
              />
              <span className="checkbox-text">Other siblings will also be enrolling at St. Augustine Preparatory Academy</span>
            </label>
            <div className="form-note">Check this box if you have other children who will also be students at St. Augustine Preparatory Academy. This qualifies you for an additional 10% sibling discount.</div>
          </div>
        </div>

        <button className="calculate-btn" onClick={calculateTuition}>Calculate Estimated Tuition</button>

        {showError && (
          <div className="error-message">
            Please fill in all fields (campus, residency, household size, income, and student grade) to calculate your estimated tuition.
          </div>
        )}

        {showGradeWarning && (
          <div className="grade-warning">
            <strong>Note:</strong> This grade will be phased in over the 2027-28, 2028-29, and 2029-30 school years, but will not be offered at Aug Prep North in the 2026-27 school year.
          </div>
        )}

        {showMarriageNote && (
          <div className="marriage-note" id="marriageNote">
            <strong>Important Notice for Married Families:</strong><br />
            {marriageNoteText}
          </div>
        )}

        {showResults && (
          <div className="results-container show" id="results">
            <div className="results-grid">
              {/* Left Column: Tuition Breakdown */}
              <div className="results-column tuition-column">
                <div className="column-header">
                  <h3>Estimated Tuition</h3>
                </div>
                
                <div className="final-price-section">
                  <div className="final-price-label">{results.finalTuitionLabel}</div>
                  <div className="final-price-large">
                    {results.isChoice ? 'No Tuition Cost*' : `$${results.finalTuition.toLocaleString()}`}
                  </div>
                  {results.isChoice && <div className="choice-subtitle">*Choice Scholarship Awarded</div>}
                </div>

                {!results.isChoice && (
                  <div className="compact-breakdown">
                    <div className="breakdown-item">
                      <span>Base Tuition</span>
                      <span>${results.baseTuition.toLocaleString()}</span>
                    </div>
                    {results.showFoundingFamilies && (
                      <div className="breakdown-item discount">
                        <span>Founding Families Discount</span>
                        <span>-${results.foundingFamiliesAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {results.showSiblingDiscount && (
                      <div className="breakdown-item discount">
                        <span>Sibling Discount</span>
                        <span>-${results.siblingDiscountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {results.showFinancialAid && (
                      <div className="breakdown-item discount">
                        <span>Financial Aid ({results.financialAidPercentage}%)</span>
                        <span>-${results.financialAidAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="breakdown-divider"></div>
                    <div className="breakdown-item total">
                      <span>Net Tuition</span>
                      <span>${results.finalTuition.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                
                <div className={results.infoClass} dangerouslySetInnerHTML={{ __html: results.infoText }} />
              </div>

              {/* Right Column: Payment Options */}
              {showPaymentPlans && (
                <div className="results-column payment-column">
                  <div className="column-header">
                    <h3>Payment Options</h3>
                  </div>
                  
                  <div className="deposit-banner">
                    Enrollment Deposit: $500 (Applied to tuition)
                  </div>

                  <div className="payment-list">
                    <div className="payment-row">
                      <div className="payment-info">
                        <span className="payment-type">Pay in Full</span>
                        <span className="payment-sub">Due June 15th</span>
                      </div>
                      <div className="payment-cost">
                        <span className="cost-amount">${results.fullPayment.toLocaleString()}</span>
                        <span className="cost-note">Includes 5% discount</span>
                      </div>
                    </div>

                    <div className="payment-row">
                      <div className="payment-info">
                        <span className="payment-type">Quarterly</span>
                        <span className="payment-sub">Jun, Sep, Dec, Mar</span>
                      </div>
                      <div className="payment-cost">
                        <span className="cost-amount">${results.quarterlyPayment.toLocaleString()}</span>
                        <span className="cost-note">/ quarter (4 payments)</span>
                      </div>
                    </div>

                    <div className="payment-row">
                      <div className="payment-info">
                        <span className="payment-type">Monthly</span>
                        <span className="payment-sub">Jun - Mar (15th)</span>
                      </div>
                      <div className="payment-cost">
                        <span className="cost-amount">${results.monthlyPayment.toLocaleString()}</span>
                        <span className="cost-note">/ month (10 payments)</span>
                      </div>
                    </div>
                  </div>

                  <div className="contact-mini">
                    <p>Questions? <a href="mailto:admissions@augprep.org">Contact Admissions</a></p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="disclaimer-footer">
              Estimate only. Final tuition subject to verification. Choice eligibility subject to application approval.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
