import { PaymentMonthly } from '../Models/PaymentMonthly';
import { TaxLeftOverMonthly } from '../Models/TaxLeftOverMonthly';
import { FormGroup, FormArray } from '@angular/forms';

export class IntersestOnTaxCalculator
{
  constructor(){
  }

  parseAllPayments(incomeTaxCalculator : FormGroup) : Array<PaymentMonthly>{
    let actualSubmissionDate : Date = new Date(incomeTaxCalculator.get('returnCompletionDate').value);
    let paymentsMonthWise : Array<PaymentMonthly> = [];
    var taxPaid : FormArray = incomeTaxCalculator.get('taxPaid').value as FormArray;
    for(var index = 0;index < taxPaid.length; index++)
    {
      var fullDate : Date = new Date(taxPaid[index].date);
      if(fullDate > actualSubmissionDate)
        fullDate = actualSubmissionDate
      var date : number = fullDate.getDate();
      var month : number = fullDate.getMonth()+1;
      var year : number = fullDate.getFullYear(); 
      var amount : number = taxPaid[index].amount;
      var paymentMonth : PaymentMonthly = paymentsMonthWise.find(monthYear => monthYear.month == month && monthYear.year == year);
      if(paymentMonth == undefined)
        paymentsMonthWise.push(new PaymentMonthly(date,month,year,amount));
      else if(paymentMonth != undefined)
        paymentMonth.parsePaymentDate(date,amount);
    }
    return paymentsMonthWise;
  }
  
  initializeTaxLeftOverMonthly(actualSubmissionDate : Date,assessmentYear : number) : Array<TaxLeftOverMonthly>{
    let taxLeftOverMonthWise : Array<TaxLeftOverMonthly> = [];
    var startMonth : number = 4;
    var startYear : number = assessmentYear-1; 
    var endMonth : number = actualSubmissionDate.getMonth()+1;
    var endYear : number = actualSubmissionDate.getFullYear();
    for(let year = startYear; year <= endYear; year++)
    {
      let monthstart = 1;
      let monthend = 12;
      if(year == startYear)
        monthstart = startMonth;
      if(year == endYear)
        monthend = endMonth;
      for(let month = monthstart; month <= monthend; month++)
      {
        taxLeftOverMonthWise.push(new TaxLeftOverMonthly(month,year));
      }
    }
    return taxLeftOverMonthWise;
  }
  
  computeTaxLeftOverMonthly(taxLeftOverMonthWise : Array<TaxLeftOverMonthly>,remainingTax : number,paymentsMonthWise : Array<PaymentMonthly>) : Array<TaxLeftOverMonthly>{
  
    let currentMonth = paymentsMonthWise.find(monthYear => monthYear.month == taxLeftOverMonthWise[0].month && monthYear.year == taxLeftOverMonthWise[0].year);

    taxLeftOverMonthWise[0].amountUpto15 = remainingTax;
    if(currentMonth == undefined)
      taxLeftOverMonthWise[0].amountAfter15 = taxLeftOverMonthWise[0].amountUpto15;
    else
      taxLeftOverMonthWise[0].amountAfter15 = taxLeftOverMonthWise[0].amountUpto15 - currentMonth.amountUpto15;

    for(let index = 1; index < taxLeftOverMonthWise.length; index++)
    {
      let previousMonth = paymentsMonthWise.find(monthYear => monthYear.month == taxLeftOverMonthWise[index-1].month && monthYear.year == taxLeftOverMonthWise[index-1].year);
      if(previousMonth == undefined)
        taxLeftOverMonthWise[index].amountUpto15 = taxLeftOverMonthWise[index-1].amountAfter15
      else
        taxLeftOverMonthWise[index].amountUpto15 = taxLeftOverMonthWise[index-1].amountAfter15 - previousMonth.amountAfter15;
      
      currentMonth = paymentsMonthWise.find(monthYear => monthYear.month == taxLeftOverMonthWise[index].month && monthYear.year == taxLeftOverMonthWise[index].year);

      if(currentMonth == undefined)
        taxLeftOverMonthWise[index].amountAfter15 = taxLeftOverMonthWise[index].amountUpto15;
      else
        taxLeftOverMonthWise[index].amountAfter15 = taxLeftOverMonthWise[index].amountUpto15 - currentMonth.amountUpto15;
    }
    return taxLeftOverMonthWise;
  }
  
  calculateInterest(incomeTaxCalculator : FormGroup){
    let assessmentYear : number = incomeTaxCalculator.get('assessmentYear').value =="Select" ? 2020 : incomeTaxCalculator.get('assessmentYear').value
    let actualSubmissionDate : Date = new Date(incomeTaxCalculator.get('returnCompletionDate').value);
    let dueDate : Date = new Date(incomeTaxCalculator.get('returnDueDate').value);
    let remainingTax : number= incomeTaxCalculator.get('totalTax').value - incomeTaxCalculator.get('relief').value - incomeTaxCalculator.get('TDS').value;
    let paymentsMonthWise : Array<PaymentMonthly> = this.parseAllPayments(incomeTaxCalculator);
    let taxLeftOverMonthWise : Array<TaxLeftOverMonthly> = this.initializeTaxLeftOverMonthly(actualSubmissionDate,assessmentYear);
    taxLeftOverMonthWise = this.computeTaxLeftOverMonthly(taxLeftOverMonthWise,remainingTax,paymentsMonthWise);
    let interestSection234A : number = this.interestOnTax234A(dueDate,actualSubmissionDate,taxLeftOverMonthWise);
    let interestSection234B : number = 0;
    let interestSection234C : number = 0;
    if(incomeTaxCalculator.get('category').value != "Senior Citizen" && incomeTaxCalculator.get('category').value != "Super Senior Citizen"){
        interestSection234B = this.interestOnTax234B(actualSubmissionDate,remainingTax,assessmentYear,taxLeftOverMonthWise);
        interestSection234C = this.interestOnTax234C(remainingTax,assessmentYear,taxLeftOverMonthWise);
    }
    incomeTaxCalculator.patchValue({
      interest234A : interestSection234A,
      interest234B : interestSection234B,
      interest234C : interestSection234C
    });
  }
    
  interestOnTax234A(dueDate : Date, actualSubmissionDate : Date, taxLeftOverMonthWise : Array<TaxLeftOverMonthly>) : number{
    let interest : number = 0;
    if(dueDate < actualSubmissionDate){
      let nextDate : Date =new Date(dueDate.getTime() + 24 * 60 * 60 * 1000);
      if(nextDate.getMonth()!=dueDate.getMonth())
        dueDate = nextDate;
      
      var startMonth : number = dueDate.getMonth()+1;
      var startYear : number = dueDate.getFullYear(); 
      var endMonth : number = actualSubmissionDate.getMonth()+1;
      var endYear : number = actualSubmissionDate.getFullYear()
      for(let year = startYear; year <= endYear; year++)
      {
        let monthstart = 1;
        let monthend = 12;
        if(year == startYear)
          monthstart = startMonth;
        if(year == endYear)
          monthend = endMonth;
        for(let month = monthstart; month <= monthend; month++)
        {
          taxLeftOverMonthWise.forEach(monthYear => {
            if(monthYear.month == month && monthYear.year == year){
              interest += (monthYear.amountUpto15)*1/100;
            }
          });
        }
      }
    }
    return Math.round(Math.max(0,interest));
  }
  
  interestOnTax234B(actualSubmissionDate : Date,Tax : number,assessmentYear : number,taxLeftOverMonthWise : Array<TaxLeftOverMonthly>) : number{
    let interest : number = 0;
    let taxOn31Mar : number = 0;
    taxLeftOverMonthWise.forEach(monthYear => {
      if(monthYear.month == 3 && monthYear.year == assessmentYear){
        taxOn31Mar = monthYear.amountUpto15;
      }
    });
    if(Tax >= 10000 && taxOn31Mar > (0.1*Tax)){
      var startMonth : number = 4;
      var startYear : number = assessmentYear; 
      var endMonth : number = actualSubmissionDate.getMonth()+1;
      var endYear : number = actualSubmissionDate.getFullYear()
      for(let year = startYear; year <= endYear; year++)
      {
        let monthstart = 1;
        let monthend = 12;
        if(year == startYear)
          monthstart = startMonth;
        if(year == endYear)
          monthend = endMonth;
        for(let month = monthstart; month <= monthend; month++)
        {
          taxLeftOverMonthWise.forEach(monthYear => {
            if(monthYear.month == month && monthYear.year == year){
              interest += (monthYear.amountUpto15)*1/100;
            }
          });
        }
      }
    }
    return Math.round(Math.max(0,interest));
  }
  
  interestOnTax234C(Tax : number,assessmentYear : number,taxLeftOverMonthWise : Array<TaxLeftOverMonthly>) : number{
    let interest : number = 0;
    if(Tax >= 10000){
      let taxOn15Mar : number = 0;
      let taxOn15Jun : number = 0;
      let taxOn15Sep : number = 0;
      let taxOn15Dec : number = 0;
      taxLeftOverMonthWise.forEach(monthYear => {
        if(monthYear.month == 6 && monthYear.year == assessmentYear-1)
          taxOn15Jun = monthYear.amountAfter15;
        else if(monthYear.month == 9 && monthYear.year == assessmentYear-1)
          taxOn15Sep = monthYear.amountAfter15;
        else  if(monthYear.month == 12 && monthYear.year == assessmentYear-1)
          taxOn15Dec = monthYear.amountAfter15;
        else if(monthYear.month == 3 && monthYear.year == assessmentYear)
          taxOn15Mar = monthYear.amountAfter15;
      });
      if(taxOn15Jun > (0.85)*Tax)
        interest += Math.round((taxOn15Jun - (0.85)*Tax)*1 / 100 * 3);
      if(taxOn15Sep > (0.55)*Tax)
        interest += Math.round((taxOn15Sep - (0.55)*Tax)*1 / 100 * 3);
      if(taxOn15Dec > (0.25)*Tax)
        interest += Math.round((taxOn15Dec - (0.25)*Tax)*1 / 100 * 3);
      if(taxOn15Mar > 0)
        interest += Math.round((taxOn15Mar)*1 / 100);
    }
    return Math.round(Math.max(0,interest));
  }
}