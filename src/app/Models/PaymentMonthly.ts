export class PaymentMonthly
{
    year : number;
    month : number;
    amountUpto15 : number;
    amountAfter15 : number;
    totalAmount : number;

    constructor(date : number,month : number,year : number,amount : number){
        this.month = month;
        this.year = year;
        this.amountUpto15 = 0;
        this.amountAfter15 = 0;
        this.totalAmount =0;
        this.parsePaymentDate(date,amount);
    }

    parsePaymentDate(date : number,amount : number,month? : number,year? : number){
        if(date <= 15)
            this.amountUpto15 += amount;
        else 
            this.amountAfter15 += amount;
        this.totalAmount = this.amountUpto15 + this.amountAfter15;
    }
}