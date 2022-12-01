import Mustache from 'mustache';

export default class SfMdExporter {

    constructor() {
    }
    months = [];
    categoriesByMonth;
    expenseTags = [];
    tableRows = '';
    item = '';
    mdByMonth = {}
    totals = {}
    template = `
| Expense Category| Actual | Forecast | Budget  |Actual | Forecast  | Budget  |Actual | Forecast | Budget  |Actual | Forecast  | Budget  |
| ----------------| -----: | -------: | ------: |-----: | --------: | ------: |-----: | -------: | ------: |-----: | --------: | ------: |
`;

    getCategoriesByMonth(categoriesByMonth) {
        this.categoriesByMonth = categoriesByMonth;
        this.getExpenseTags()
        this.getMonths()
        this.totals = this.getTotalsByMonth();
        // console.log('totals', this.totals)
        this.loopOverExpenseTags()
    }

    //Sum actual, forecast, budget by month
    getTotalsByMonth() {
        let totalObject = {}
        let months = [...this.months];
        months.forEach(month => {
            let totalActual = 0;
            let totalForecast = 0;
            let totalBudget = 0;
            this.expenseTags.forEach(tag => {
                for (let group in this.categoriesByMonth[tag]) {
                    totalActual += this.categoriesByMonth[tag][group][month].actual;
                    totalForecast += this.categoriesByMonth[tag][group][month].forecast;
                    totalBudget += this.categoriesByMonth[tag][group][month].budget;
                }

            })
            totalObject[month] = {
                totalActual,
                totalForecast,
                totalBudget
            }
            // console.log(`Total actual ${totalActual} month ${month}`)
        })
        return totalObject;
    }

    getExpenseTags() {
        let arrCategoriesByMonth = Object.entries(this.categoriesByMonth)

        for (let [key, value] of arrCategoriesByMonth) {
            this.expenseTags.push(key)
        }

        // console.log('expense Tags', this.expenseTags)
    }

    getMonths() {
        let months = []
        this.expenseTags.forEach(tag => {
            for (let group in this.categoriesByMonth[tag]) {
                for (let [key, value] of Object.entries(this.categoriesByMonth[tag][group])) {
                    months.push(key)
                }
            }
        })
        this.months = [...new Set(months)]
        // console.log('months', this.months)
    }


    loopOverExpenseTags() {
        let months = this.months;
        for (let i = 0; i < months.length; i++) {
            let threeMonths = months.slice(i + 1, i + 4);
            // console.log('threeExtraMonths', threeMonths)

            // adding month strings to table 
            this.item += `| | ${months[i]} | | |`
            threeMonths.forEach(newMonth => {
                this.item += `${newMonth} | | |`
            })
            this.item += `\n`;

            this.expenseTags.forEach(tag => {
                for (let group in this.categoriesByMonth[tag]) {
                    if (this.categoriesByMonth[tag][group][months[i]] !== undefined) {
                        this.item += `|${tag}|`


                        this.item += `${this.categoriesByMonth[tag][group][months[i]]['actual'].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}|`
                        this.item += `${this.categoriesByMonth[tag][group][months[i]]['forecast'].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}|`
                        this.item += `${this.categoriesByMonth[tag][group][months[i]]['budget'].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}|`
                        // from month + 3 loop, add again 3 times the above actual, forecast and budget together
                        threeMonths.forEach(newMonth => {
                            this.item += `${this.categoriesByMonth[tag][group][newMonth]['actual'].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}|`
                            this.item += `${this.categoriesByMonth[tag][group][newMonth]['forecast'].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}|`
                            this.item += `${this.categoriesByMonth[tag][group][newMonth]['budget'].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}|`

                        })

                        this.item += `\n`;
                        this.tableRows += this.item;
                        this.item = ''
                    }

                }
            })

            // adding totals 
            this.item += '| Total |';
            this.item += ` ${this.totals[months[i]].totalActual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |`;
            this.item += ` ${this.totals[months[i]].totalForecast.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |`;
            this.item += ` ${this.totals[months[i]].totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |`;
            threeMonths.forEach(threeMonth => {
                this.item += ` ${this.totals[threeMonth].totalActual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |`;
                this.item += ` ${this.totals[threeMonth].totalForecast.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |`;
                this.item += ` ${this.totals[threeMonth].totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |`;
            })
            this.tableRows += this.item;
            this.item = ''

            let monthTemplate = this.template
            monthTemplate += this.tableRows;
            this.tableRows = ''

            this.mdByMonth[months[i]] = Mustache.render(monthTemplate);

        }



        // console.log('mdByMonth', this.mdByMonth)
    }


    getMdData() {
        let output = Mustache.render(this.template);
        return output;
    }
}