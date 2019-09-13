import { Deduction } from './Deduction';
import { FormGroup } from '@angular/forms';

export class TaxSection
{
    name : string;
    deductions? : Array<Deduction> = [];
    maxLimit? : number;
    totalDeduction? : number;

    constructor(name : string , maxLimit? : number){
        this.name = name;
        this.maxLimit = maxLimit;
        this.totalDeduction = 0;
    }

    getDeductionValue(allDeductions : any) : number{
        this.totalDeduction = 0;
        Object.keys(allDeductions).forEach((key : string) => {
            let deduction = this.deductions.find(ded=>ded.name == key);
            if(deduction!=undefined)
            {
                if(deduction.allowed == true && allDeductions[key]!='')
                    if(allDeductions[key]== true && (this.name == "80U" || this.name == "80DD"))
                        this.totalDeduction += deduction.maxLimit;
                    else if(this.name == "80CCG")
                        this.totalDeduction += (allDeductions[key]*0.5);
                    else
                        this.totalDeduction += allDeductions[key];
            }
        });
        if(this.maxLimit < this.totalDeduction)
            this.totalDeduction = this.maxLimit;
        return this.totalDeduction;
    }

}
