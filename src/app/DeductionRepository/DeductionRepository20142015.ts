import { DeductionRepository20132014 } from './DeductionRepository20132014';
import { TaxSection } from '../Models/TaxSection';
import { Deduction } from '../Models/Deduction';

export class DeductionRepository20142015 extends DeductionRepository20132014
{
    
    constructor(){
        super();
    }  
    
    getSection80EE() : TaxSection{
        var section80EE : TaxSection = new TaxSection("80EE",100000);
        section80EE.deductions.push( 
            new Deduction ( "80EE", "loanResidentialHouse80EE" ,true,0,null, "Interest on loan taken for Residential House (u/s 80EE)")
        );
        return section80EE;
    }
    
    getAllTaxSections() : Array<TaxSection> {
        var taxsections : Array<TaxSection> = super.getAllTaxSections();
        taxsections.push(this.getSection80EE());
        return taxsections;
    }
}