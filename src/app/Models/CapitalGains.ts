import { FormArray } from '@angular/forms';

export class CapitalGains
{
    totalGain : number;
    slabRate : number;
    type : string;
    title : string;

    constructor(title : string , type : string , slabRate : number){
        this.title = title;
        this.type = type;
        this.slabRate = slabRate;
        this.totalGain = 0;
    }

    calculateTotalGain(gains : Array<number>) : number{
        this.totalGain = 0;
        gains.forEach(element => {
            this.totalGain += +element;
        });
        return this.totalGain;
    }

    getTaxOnCapitalGains(totalGain : number){
        return Math.round((this.slabRate/100)*totalGain);
    }

}