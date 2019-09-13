export class Deduction
{
    name? : string;
    title? : string;
    description? : string;
    section : string;
    maxLimit? : number;
    allowed : boolean;

    constructor(section : string,name : string,allowed : boolean,maxlimit : number,title? : string,description? : string ){
        this.name = name;
        this.title = title;
        this.description =description;
        this.section =section;
        this.maxLimit =maxlimit;
        this.allowed = allowed;
    }
    
}