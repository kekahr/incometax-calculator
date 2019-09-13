import { IncomeTaxRepository } from '../IncomeTaxRepository/IncomeTaxRepository';
import { IncomeTaxRepository20102011 } from '../IncomeTaxRepository/IncomeTaxRepository20102011';
import { IncomeTaxRepository20112012 } from '../IncomeTaxRepository/IncomeTaxRepository20112012';
import { IncomeTaxRepository20122013 } from '../IncomeTaxRepository/IncomeTaxRepository20122013';
import { IncomeTaxRepository20132014 } from '../IncomeTaxRepository/IncomeTaxRepository20132014';
import { IncomeTaxRepository20142015 } from '../IncomeTaxRepository/IncomeTaxRepository20142015';
import { IncomeTaxRepository20152016 } from '../IncomeTaxRepository/IncomeTaxRepository20152016';
import { IncomeTaxRepository20162017 } from '../IncomeTaxRepository/IncomeTaxRepository20162017';
import { IncomeTaxRepository20172018 } from '../IncomeTaxRepository/IncomeTaxRepository20172018';
import { IncomeTaxRepository20182019 } from '../IncomeTaxRepository/IncomeTaxRepository20182019';
import { IncomeTaxRepository20192020 } from '../IncomeTaxRepository/IncomeTaxRepository20192020';
import { IncomeTaxRepository20202021 } from '../IncomeTaxRepository/IncomeTaxRepository20202021';
import { IncomeFromCapitalGains } from '../Models/Income/IncomeFromCapitalGains';
import { IncomeFromOtherSources } from '../Models/Income/IncomeFromOtherSources';
import { FormGroup } from '@angular/forms';

export class TaxCalculator
{

    incomeTaxRepository : IncomeTaxRepository;
    
    taxLiableAtNormalRate : number;
    taxLiableAtSpecialRate : number;
    rebate : number;
    totalTaxAfterRebate : number;
    surcharge : number;
    educationalCESS : number;
    secondaryCESS: number;
    totalTaxLiable : number;

    constructor(){
        this.taxLiableAtNormalRate = 0;
        this.taxLiableAtSpecialRate = 0;
    }

    getincomeTaxRepository(assessmentYear){
        switch(assessmentYear)
        {
            case 2010 : this.incomeTaxRepository = new IncomeTaxRepository20102011(); break;
            case 2011 : this.incomeTaxRepository = new IncomeTaxRepository20112012(); break;
            case 2012 : this.incomeTaxRepository = new IncomeTaxRepository20122013(); break;
            case 2013 : this.incomeTaxRepository = new IncomeTaxRepository20132014(); break;
            case 2014 : this.incomeTaxRepository = new IncomeTaxRepository20142015(); break;
            case 2015 : this.incomeTaxRepository = new IncomeTaxRepository20152016(); break;
            case 2016 : this.incomeTaxRepository = new IncomeTaxRepository20162017(); break;
            case 2017 : this.incomeTaxRepository = new IncomeTaxRepository20172018(); break;
            case 2018 : this.incomeTaxRepository = new IncomeTaxRepository20182019(); break;
            case 2019 : this.incomeTaxRepository = new IncomeTaxRepository20192020(); break;
            case 2020 : this.incomeTaxRepository = new IncomeTaxRepository20202021(); break;
        }
    }

    calculateNormalTax(TaxableIncome : number,assessmentYear : number,agriculturalIncome : number,category : string) : number {
        this.getincomeTaxRepository(assessmentYear);
        let ceilSlabLimit : number = 0;
        this.incomeTaxRepository.getAgriculturalCeilLimit().forEach(agriculturalSlabcategory =>{
            if(agriculturalSlabcategory.category == category)
                ceilSlabLimit = agriculturalSlabcategory.ceilLimit;
        });
        if(TaxableIncome >= ceilSlabLimit)
        {
            let taxOnIncomeAndAgriculture : number = this.calculateLiableTax(TaxableIncome+agriculturalIncome,category);
            let taxOnAgricultureAndCeilSlab : number = this.calculateLiableTax(agriculturalIncome+ceilSlabLimit,category);
            return taxOnIncomeAndAgriculture - taxOnAgricultureAndCeilSlab;
        }
        return 0;
    }

    calculateLiableTax(TaxableIncome : number,category : string) : number {
        let taxLiable :number= 0;
        this.incomeTaxRepository.getIncomeTaxSlab().forEach(slabCategory =>{
            if(slabCategory.category == category)
                slabCategory.taxslab.forEach(taxslab => {
                    taxLiable += taxslab.runIncomeTaxResult(TaxableIncome);
                });
        });
        return taxLiable;
    }

    calculateSpecialTax(incomeFromCapital : IncomeFromCapitalGains,incomeFromOtherSource : IncomeFromOtherSources,incomeTaxCalculator : FormGroup){
        let assessmentYear : number = incomeTaxCalculator.get('assessmentYear').value =="Select" ? 2020 : incomeTaxCalculator.get('assessmentYear').value;
        this.getincomeTaxRepository(assessmentYear);
        let shortTermCapitalSpecial = 0, longTermCapitalSpecial1 = 0, longTermCapitalSpecial2 =0 , winningsFromLottery = 0;
        let taxShortTermCapitalSpecial = 0,taxLongTermCapitalSpecial1 =0 ,taxLongTermCapitalSpecial2 =0, taxWinningsFromLottery =0;
        let ceilLimit = 0;
        this.incomeTaxRepository.getAgriculturalCeilLimit().forEach(agriculturalSlabcategory =>{
            if(agriculturalSlabcategory.category == incomeTaxCalculator.get('category').value)
                ceilLimit = agriculturalSlabcategory.ceilLimit;
        });
        let excessIncome = incomeTaxCalculator.get('netTaxableIncome').value - ceilLimit - incomeFromOtherSource.incomeAtSpecialRate;
        if(excessIncome > 0)
        {
            longTermCapitalSpecial2 = Math.min(excessIncome,incomeFromCapital.longTermCapitalGainsSpecial2);
            excessIncome = excessIncome - longTermCapitalSpecial2;
            if(excessIncome > 0)
            {
            shortTermCapitalSpecial = Math.min(excessIncome,incomeFromCapital.shortTermCapitalGainsSpecial);
            excessIncome = excessIncome - shortTermCapitalSpecial;
            }
            if(excessIncome > 0)
            {
            longTermCapitalSpecial1 = Math.min(excessIncome,incomeFromCapital.longTermCapitalGainsSpecial1);
            }
        }
        winningsFromLottery = incomeFromOtherSource.incomeAtSpecialRate;
        
        taxWinningsFromLottery = incomeFromOtherSource.getTaxOnLotteryWinnings();
        incomeFromCapital.capitalGains.forEach(capitalGains=>{
            if(capitalGains.title == "ShortTermSpecial")
            taxShortTermCapitalSpecial = capitalGains.getTaxOnCapitalGains(shortTermCapitalSpecial);
            else if(capitalGains.title == "LongTermSpecial1")
            taxLongTermCapitalSpecial1 = capitalGains.getTaxOnCapitalGains(longTermCapitalSpecial1);
            else if(capitalGains.title == "LongTermSpecial2")
            taxLongTermCapitalSpecial2 = capitalGains.getTaxOnCapitalGains(longTermCapitalSpecial2);
        });
        incomeTaxCalculator.get('taxSpecailRate').patchValue({
            shortTermCapitalGainsSpecialTotal : shortTermCapitalSpecial,
            taxShortTermCapitalGainsSpecial : taxShortTermCapitalSpecial,
            longTermCapitalGainsSpecial1Total : longTermCapitalSpecial1,
            taxLongTermCapitalGainsSpecial1 : taxLongTermCapitalSpecial1,
            longTermCapitalGainsSpecial2Total : longTermCapitalSpecial2,
            taxLongTermCapitalGainsSpecial2 : taxLongTermCapitalSpecial2,
            winningsFromLotteryTotal : winningsFromLottery,
            taxWinningsFromLottery : taxWinningsFromLottery
        });
    }

    calculateSurcharge(TaxableIncome : number,category : string) : number{
        let applicableRate : number = 0;
        this.incomeTaxRepository.getSurchargeSlab().forEach(taxslab => {
            if(taxslab.getSurchargeRate(TaxableIncome))
                applicableRate = taxslab.slabrate;
        });
        let actualSurchargeOnTax : number = Math.round((this.totalTaxAfterRebate)*applicableRate/100);
        let floorLimit : number = this.getFloorSlabLimitForSurcharge(TaxableIncome);
        let taxLiableOnFloorLimit = this.calculateLiableTax(floorLimit,category);
        this.incomeTaxRepository.getSurchargeSlab().forEach(taxslab => {
            if(taxslab.getSurchargeRate(floorLimit))
                applicableRate = taxslab.slabrate;
        });
        let marginalsurchargeOnTax : number = Math.round((taxLiableOnFloorLimit)*applicableRate/100);
        let differenceOfTax = this.totalTaxAfterRebate-taxLiableOnFloorLimit;
        let differenceOfTaxBasedOnSurcharge = (this.totalTaxAfterRebate + actualSurchargeOnTax)-(taxLiableOnFloorLimit + marginalsurchargeOnTax);
        let differenceOfTaxableIncomes = (TaxableIncome - floorLimit);
        if(differenceOfTaxableIncomes < differenceOfTaxBasedOnSurcharge)
            return marginalsurchargeOnTax + differenceOfTaxableIncomes-differenceOfTax;
        return actualSurchargeOnTax;
    }

    getFloorSlabLimitForSurcharge(TaxableIncome : number) : number{
        let floorSlabLimit = 0; 
        this.incomeTaxRepository.getSurchargeSlab().forEach(taxslab => {
            if(taxslab.maxValue >= TaxableIncome && taxslab.minValue <= TaxableIncome)
               { 
                   floorSlabLimit = taxslab.minValue;
               }
        });
        if(floorSlabLimit!=0)
            return floorSlabLimit-1;
        return floorSlabLimit;
    }

    calculateTaxAfterRebate(TaxableIncome : number,assessmentYear: number) : number{
        this.getincomeTaxRepository(assessmentYear);
        var totalTax : number = this.taxLiableAtSpecialRate + this.taxLiableAtNormalRate;
        this.totalTaxAfterRebate = this.incomeTaxRepository.getRebateSlab().computeTaxAfterRebate(TaxableIncome,totalTax);
        return this.totalTaxAfterRebate;
    }

    calculateCESSAndTotalTax(assessmentYear : number){
        this.getincomeTaxRepository(assessmentYear);
        this.educationalCESS = this.incomeTaxRepository.getCESSSlab().computeEducationalCESS(this.totalTaxAfterRebate + this.surcharge);
        this.secondaryCESS = this.incomeTaxRepository.getCESSSlab().computeSecondaryCESS(this.totalTaxAfterRebate + this.surcharge);
        this.totalTaxLiable = this.totalTaxAfterRebate + this.surcharge + this.educationalCESS+this.secondaryCESS;
    }
}