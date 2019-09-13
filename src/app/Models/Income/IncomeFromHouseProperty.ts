import { TaxSection } from '../TaxSection';
import { IncomeType } from './IncomeType';
import { DeductionCalculator } from 'src/app/Calculation/DeductionCalculator';

export class IncomeFromHouseProperty extends IncomeType
{
    interestOnHousingLoanSelfOccupied : number;
    incomeFromSelfOccupied : number;
    annaulRentFromLetOut : number;
    municipalTaxesLetOut : number;
    unrealizedRentLetOut : number;
    netAnnualIncomeFromLetOut : number;
    standardDeductionLetOut : number;
    interestOnHousingLoanLetOut : number;
    incomeFromLetOut : number;

    constructor(){
        super();
    }

    runResults(assessmentYear : number){
        this.incomeFromSelfOccupied = 0 - this.interestOnHousingLoanSelfOccupied;
        this.netAnnualIncomeFromLetOut= this.annaulRentFromLetOut-this.municipalTaxesLetOut-this.unrealizedRentLetOut;
        this.standardDeductionLetOut = Math.round(0.3*this.netAnnualIncomeFromLetOut);
        this.incomeFromLetOut = this.netAnnualIncomeFromLetOut-this.standardDeductionLetOut-this.interestOnHousingLoanLetOut;
        this.incomeAtNormalRate = this.getTotalIncomeFromHouseProperty(assessmentYear);
        this.incomeTotal = this.incomeAtSpecialRate + this.incomeAtNormalRate;
    }

    getTotalIncomeFromHouseProperty(assessmentYear : number){  
        let taxsection : TaxSection = new DeductionCalculator().getSection24(assessmentYear);  
        if(0 - taxsection.maxLimit > this.incomeFromSelfOccupied)
          return 0 - taxsection.maxLimit + this.incomeFromLetOut;
        else
          return this.incomeFromSelfOccupied + this.incomeFromLetOut;
    }
    
}