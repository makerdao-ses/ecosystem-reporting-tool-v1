export default class CrunchData {
    data = [];
    expenseTags = [];

    actuals = [];

    constructor() { };



    sumValues(keyName, expenseTag, dataObject) {
        let total = 0;
        for (const object of dataObject) {
            if (object['category'] === expenseTag) {
                if (typeof object[keyName] === 'number') {
                    total += object[keyName]
                }
            }
        }
        return total;
    }

    getTotalByBudgetVariance(budgetVarianceObj) {
        let total = 0;
        for (const [key, value] of Object.entries(budgetVarianceObj)) {
            if (key !== 'type') {
                total += value
            }
        }
        total = Math.round((total + Number.EPSILON) * 100) / 100;
        return total;
    }

    getTotalPaidDaiByEmptyBudgetCategory() {
        let total = 0;
        for (const obj of this.data) {
            if (obj['category'] === '' && obj['paid'] !== 0) {
                total += obj['paid']
            }
        }
        return total;
    }

    getExpenseTags() {
        let duplicateTags = [];
        let expenseTags = []
        for (const object of this.data) {
            if (object['category'] !== "") {
                duplicateTags.push(object['category'])

            }
        }
        // remove duplicates
        expenseTags = [...new Set(duplicateTags)];
        return expenseTags;

    }

    getActAndDiff() {
        let actAndDiff = {};
        // extract actual and forecast object
        for (const type of ['actual', 'forecast'])
            for (const actual of this.actuals) {
                if (actual.type === type)
                    actAndDiff[type] = actual;
            }

        return actAndDiff

    }

    calcDifference() {
        let actAndDiff = this.getActAndDiff()
        if (actAndDiff.actual === undefined || actAndDiff.forecast === undefined) {
            return
        } else {
            let differenceObj = {
                type: 'difference'
            }
            for (const tag of this.expenseTags) {
                differenceObj[tag] = actAndDiff.actual[tag] - actAndDiff.forecast[tag];
            }
            differenceObj.total = actAndDiff.actual.total - actAndDiff.forecast.total;

            // this.actuals.push(differenceObj)
            this.actuals.splice(this.actuals.length - 1, 0, differenceObj)
        }

    }


    crunchData() {
        return this.actuals;
    }


    async setData(filteredByMonth) {
        this.data = filteredByMonth
        this.expenseTags = this.getExpenseTags()

        this.checkKeys()

    }

    // console.log(await get('novemberActuals')); 

    // check if there's actuals, forecast, estimate, owed or paid in data. Then calculate.

    checkKeys() {
        const budgetKeys = ['forecast', 'estimate', 'actual', 'owed', 'paid'];
        for (let i = 0; i < budgetKeys.length; i++) {
            if (this.data[0].hasOwnProperty(budgetKeys[i])) {
                this.setTotalsByExpenseTag(budgetKeys[i])
            }
        }
        this.calcDifference()
        // console.log('logging actuals', this.actuals)
    }

    setTotalsByExpenseTag(type) {
        let totalByExpenseTag = {};
        totalByExpenseTag.type = type;

        for (const expenseTag of this.expenseTags) {
            totalByExpenseTag[expenseTag] = this.sumValues(type, expenseTag, this.data)
        }
        // console.log('total forecast', totalByExpenseTag)
        totalByExpenseTag.total = this.getTotalByBudgetVariance(totalByExpenseTag);
        if (type === 'paid')
            totalByExpenseTag.total += this.getTotalPaidDaiByEmptyBudgetCategory()
        this.actuals.push(totalByExpenseTag)
    }

}

