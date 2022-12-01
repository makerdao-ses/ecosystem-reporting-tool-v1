
const DEBUG_PROCESSOR = false;

export default class Processor {

    constructor(wallet) {
        this.wallet = wallet;
    };

    filterIndex = null;

    // having multiple filter templates
    filters = [];

    //deep copy
    addNewFilter() {
        let copy = JSON.parse(JSON.stringify(this.filterTemplate));
        this.filters.push(copy);
        this.filterIndex = this.filters.length - 1; // sets the index to filter 
    }

    resetFilterIndex() {
        if (this.filters.length < 1) {
            this.addNewFilter();
        } else {
            this.filterIndex = 0;
        }
    }

    selectNextFilter(addNewIfNeeded = true) {
        if (this.filters.length < 1 || this.filterIndex === this.filters.length - 1) {
            if (addNewIfNeeded) {
                this.addNewFilter()
                return true;
            }
            return false;
        } else {
            this.filterIndex++;
            return true;
        }
    }

    currentFilter() {
        if (this.filters.length < 1) {
            this.selectNextFilter()
        }
        return this.filters[this.filterIndex]
    }

    filterTemplate = {
        direct: {
            column: null,
            index: null,
            certain: false,
            labels: ['!direct', 'Direct'],
            parseFunction: 'tryParseBoolean'
        },
        forecast: {
            column: null,
            index: null,
            certain: false,
            labels: ['!forecast', 'Forecast'],
            parseFunction: 'tryParseNumber',
            signInitialized: false,
            signMultiplier: 1
        },
        estimate: {
            column: null,
            index: null,
            certain: false,
            labels: ['!estimate', 'Estimate'],
            parseFunction: 'tryParseNumber',
            signInitialized: false,
            signMultiplier: 1
        },
        actual: {
            column: null,
            index: null,
            certain: false,
            labels: ['!actual', 'Actual'],
            parseFunction: 'tryParseNumber',
            signInitialized: false,
            signMultiplier: 1
        },
        owed: {
            colum: null,
            index: null,
            certain: false,
            labels: ['!owed', 'Owed'],
            parseFunction: 'tryParseNumber',
            signInitialized: false,
            signMultiplier: 1
        },
        paid: {
            column: null,
            index: null,
            certain: false,
            labels: ['!paid', 'Paid'],
            parseFunction: 'tryParseNumber',
            signInitialized: false,
            signMultiplier: 1
        },
        budget: {
            column: null,
            index: null,
            certain: false,
            labels: ['!budget', 'Budget'],
            parseFunction: 'tryParseNumber'
        },
        category: {
            column: null,
            index: null,
            certain: false,
            labels: ['!category', 'Budget Category'],
            parseFunction: 'tryParseString'
        },
        month: {
            column: null,
            index: null,
            certain: false,
            labels: ['!month', 'Month'],
            parseFunction: 'tryParseMonth'
        },
        transaction: {
            column: null,
            index: null,
            certain: false,
            labels: ['!transaction', 'Transaction'],
            parseFunction: 'tryParseString'
        },
        group: {
            column: null,
            index: null,
            certain: false,
            labels: ['!group', 'Group'],
            parseFunction: 'tryParseString'
        }
    }

    rawData = [];
    parsedRows = [];
    filteredByMonth = {};
    budgets = {};
    filteredByCategoryMonth = {};
    accountedMonths = [];
    leveledMonthsByCategory = {}

    // function calls are done in sequence
    processData = () => {
        this.updateFilter()
        this.parseRowData()
        this.filterByMonth()
        this.filteredByCategoryMonth = this.buildSESView(this.parsedRows)
        this.leveledMonthsByCategory = this.buildSFView(this.filteredByCategoryMonth)
        // console.log('leveledMonthsByCategory', this.leveledMonthsByCategory)
        // console.log('filteredByMonth', this.filteredByMonth)
    }

    getRawData = (data) => {
        this.rawData = data;
        // console.log('rawData', this.rawData)
    }

    updateFilter = () => {
        for (let i = 0; i < this.rawData.length; i++) {
            this.tryParseFilterRow(this.rawData[i], i)
        }

        if (DEBUG_PROCESSOR) console.log(this.wallet, 'Updated filters: ', this.filters)
    }


    isValidMonth(month) {
        return month instanceof Date;
    }

    isValidNumber(actual) {
        return typeof actual === 'number';
    }

    isValidExpenseRow(rowCandidate) {
        if (rowCandidate.category.toLowerCase() === 'budget') {
            return false;
        }
        return this.isValidMonth(rowCandidate.month) &&
            (this.isValidNumber(rowCandidate.actual) ||
                this.isValidNumber(rowCandidate.forecast) ||
                this.isValidNumber(rowCandidate.estimate) ||
                this.isValidNumber(rowCandidate.paid));
    }

    isValidBudgetRow(rowCandidate) {
        return this.isValidMonth(rowCandidate.month) && this.isValidNumber(rowCandidate.budget);
    }

    parseRowData = () => {
        this.budgets = {}
        this.resetFilterIndex();

        do {
            let arrFilter = Object.entries(this.currentFilter());
            let arr = {}

            for (let i = 0; i < this.rawData.length; i++) {
                for (let item = 0; item < arrFilter.length; item++) {
                    if (arrFilter[item][1].certain) {
                        let cellValue = this.rawData[i][arrFilter[item][1].column]
                        if (arrFilter[item][1].parseFunction) {
                            arr[arrFilter[item][0]] = this[arrFilter[item][1].parseFunction](cellValue)
                        } else {
                            arr[arrFilter[item][0]] = cellValue;
                        }
                    }
                }

                if (this.isValidExpenseRow(arr)) {
                    let selectedFilter = JSON.parse(JSON.stringify(this.currentFilter()));

                    if ('actual' in arr) {
                        selectedFilter.actual.signInitialized = true;
                        selectedFilter.actual.signMultiplier = Math.sign(arr.actual);
                    }
                    if ('forecast' in arr) {
                        selectedFilter.forecast.signInitialized = true;
                        selectedFilter.forecast.signMultiplier = Math.sign(arr.forecast)
                    }

                    this.parsedRows.push(this.cleanExpenseRecord(arr, selectedFilter, this.budgets, this.filteredByCategoryMonth))
                    arr = {}
                } else if (this.isValidBudgetRow(arr)) {
                    this.processBudgetRow(arr, this.budgets)
                }
            }
        }
        while (this.selectNextFilter(false))

        if (DEBUG_PROCESSOR) console.log(this.wallet, 'parseRowData output -- parsedRows:', this.parsedRows);
        if (DEBUG_PROCESSOR) console.log(this.wallet, 'parseRowData output -- filteredByCategoryMonth', this.filteredByCategoryMonth);
        if (DEBUG_PROCESSOR) console.log(this.wallet, 'parseRowData output -- budgets:', this.budgets);
    }

    processBudgetRow(parsedRecord, budgets) {
        this.cleanBudgetRecord(parsedRecord, budgets)
        // console.log('matched budget row', parsedRecord, this.budgets)
    }

    cleanBudgetRecord(parsedRecord, budgets) {

        parsedRecord.monthString = this.getMonthString(parsedRecord.month)

        if (parsedRecord.category === '') {
            parsedRecord.category = 'payment topup';
        }
        if (parsedRecord.budget !== undefined) {
            parsedRecord.budget = this.parseNumber(parsedRecord.budget)
            if (budgets[parsedRecord.monthString] === undefined) {
                budgets[parsedRecord.monthString] = {}
            }
            if (budgets[parsedRecord.monthString][parsedRecord.category] === undefined) {
                budgets[parsedRecord.monthString][parsedRecord.category] = 0;
            }
            budgets[parsedRecord.monthString][parsedRecord.category] += parsedRecord.budget
        }

        // console.log('budgets', this.budgets)
        return parsedRecord
    }

    getMonthString(dateObj) {
        let leading0 = dateObj.getMonth() + 1 < 10 ? '0' : ''
        return `${dateObj.getFullYear()}-${leading0}${dateObj.getMonth() + 1}`
    }

    cleanExpenseRecord(parsedRecord, filter) {
        //Cleaning Month
        parsedRecord.monthString = this.getMonthString(parsedRecord.month)

        if (!filter.direct.certain) {
            parsedRecord.direct = true
        }

        // parsing empty string values
        let calculatedOwed = null;
        if (parsedRecord.estimate !== undefined) {
            parsedRecord.estimate = this.parseNumber(parsedRecord.estimate)
            calculatedOwed = parsedRecord.estimate
        }
        if (parsedRecord.actual !== undefined) {
            // parsedRecord.actual = this.parseNumber(parsedRecord.actual) * filter.actual.signMultiplier
            parsedRecord.actual = this.parseNumber(parsedRecord.actual)
            calculatedOwed = parsedRecord.actual
        }
        if (parsedRecord.owed !== undefined) {
            parsedRecord.owed = this.parseNumber(parsedRecord.owed)
        } else {
            parsedRecord.owed = calculatedOwed
        }

        if (!filter.paid.certain) {
            parsedRecord.paid = this.parseNumber(parsedRecord.actual)
        } else if (parsedRecord.paid !== undefined) {
            parsedRecord.paid = this.parseNumber(parsedRecord.paid)
        }
        if (parsedRecord.forecast !== undefined) {
            parsedRecord.forecast = this.parseNumber(parsedRecord.forecast) * filter.forecast.signMultiplier
        }
        if (parsedRecord.category === '') {
            parsedRecord.category = 'payment topup';
        }

        return parsedRecord
    }

    buildSESView = (parsedRows) => {
        let selectedFilter = JSON.parse(JSON.stringify(this.currentFilter()));

        let result = {}
        for (let i = 0; i < parsedRows.length; i++) {
            let row = parsedRows[i]
            if (!result.hasOwnProperty(row.category)) {
                result[row.category] = {}
            }

            if (!result[row.category].hasOwnProperty(row.group)) {
                result[row.category][row.group] = {}
            }

            if (!result[row.category][row.group].hasOwnProperty(row.monthString)) {
                result[row.category][row.group][row.monthString] = {
                    actual: 0,
                    forecast: 0,
                    paid: 0,
                    budget: 0
                }
            }

            if (row.actual !== undefined) {
                result[row.category][row.group][row.monthString]['actual'] += row.actual
            }
            if (row.forecast !== undefined) {
                result[row.category][row.group][row.monthString]['forecast'] += row.forecast
            }
            if (row.paid !== undefined) {
                result[row.category][row.group][row.monthString]['paid'] += row.paid
            }
            if (row.budget !== undefined) {
                result[row.category][row.group][row.monthString]['budget'] += row.budget
            }
        }

        if (DEBUG_PROCESSOR) console.log(this.wallet, 'buildSESView() output:', result);
        for (const [key, value] of Object.entries(result)) {
            for (const [key1, value1] of Object.entries(result[key])) {
                for (const [key2, value2] of Object.entries(result[key][key1])) {
                    for (const [key3, value3] of Object.entries(result[key][key1][key2])) {
                        if (key3 === 'actual' || key3 === 'forecast' || key3 === 'paid') {
                            result[key][key1][key2][key3] = result[key][key1][key2][key3] * Math.sign(result[key][key1][key2][key3])
                        }
                        if (key.toLowerCase() === 'revenue') {
                            result[key][key1][key2][key3] = result[key][key1][key2][key3] * -1
                        }
                    }
                }
            }
        }
        return result;
    }

    buildSFView(indexByCategoryByMonth) {
        let months = this.addThreeMonths(this.getMonths())
        let result = {};

        months.forEach(month => {
            result = this.addSfTableSection(result, indexByCategoryByMonth, month);
        })

        if (DEBUG_PROCESSOR) console.log(this.wallet, 'buildSFView() output:', result);
        return result;
    }

    addSfTableSection(sfTable, indexByCategoryByMonth, month) {
        let result = JSON.parse(JSON.stringify(sfTable));

        // not all categories have same month
        for (const category in indexByCategoryByMonth) {
            // console.log('category', category);
            if (result[category] === undefined) {
                result[category] = {}
            }
            for (const group in indexByCategoryByMonth[category]) {
                if (result[category][group] === undefined) {
                    result[category][group] = {}
                }

                if (result[category][group][month] === undefined) {
                    result[category][group][month] = {}
                }

                if (indexByCategoryByMonth[category][group][month] === undefined) {
                    result[category][group][month]['actual'] = 0
                    result[category][group][month]['forecast'] = 0
                    result[category][group][month]['paid'] = 0
                } else {
                    result[category][group][month].actual = indexByCategoryByMonth[category][group][month]['actual']
                    result[category][group][month].forecast = indexByCategoryByMonth[category][group][month]['forecast']
                    result[category][group][month].paid = indexByCategoryByMonth[category][group][month]['paid']
                }

                if (this.budgets[month] === undefined || this.budgets[month][category] === undefined) {
                    result[category][group][month]['budget'] = 0
                } else {
                    result[category][group][month].budget = this.budgets[month][category]
                }
            }
        }
        // console.log('new sfTable', result)

        return result;
    }



    addThreeMonths(monthsArr) {
        let months = [...monthsArr]
        let lastMonth = months[months.length - 1]
        let toNumber = lastMonth.split('-');
        let year = Number(toNumber[0])
        let month = Number(toNumber[1])

        let leading0 = month < 10 ? '0' : '';

        let monthString = leading0 + String(month);
        let yearString = String(year);


        for (let i = 1; i <= 3; i++) {
            let newMonth = month + i;
            let leading0 = newMonth < 10 ? '0' : '';
            monthString = leading0 + String(newMonth)

            if (newMonth > 12) {
                yearString = String(year + 1)
            }
            if (newMonth === 13) {
                monthString = '01'
            }
            if (newMonth === 14) {
                monthString = '02'
            }
            if (newMonth === 15) {
                monthString = '03'
            }
            let result = yearString.concat('-').concat(monthString)
            months.push(result)
        }
        return months;
    }

    filterByMonth = () => {
        const months = this.getMonths()

        for (let i = 0; i < months.length; i++) {
            let month = this.parsedRows.filter(object => {
                return object.monthString === months[i]
            })
            this.filteredByMonth[months[i]] = month;
        }

        if (DEBUG_PROCESSOR) console.log(this.wallet, 'filterByMonth() output -- filteredByMonth', this.filteredByMonth)
    }

    getMonths = () => {
        let duplicateTags = [];
        for (const object of this.parsedRows) {
            if (object.monthString !== undefined)
                duplicateTags.push(object.monthString)
        }
        return [...new Set(duplicateTags)];

    }



    matchesFilterTag(cellData, tag) {
        let t = cellData.toString().toLowerCase().trim();
        return t == tag

    }

    tryParseFilterRow = (arr, rowIndex) => {
        // console.log('arr in tryParse', arr)
        this.resetFilterIndex();
        for (let i = 0; i < arr.length; i++) {
            if (this.matchesFilterTag(arr[i], '!next')) {
                this.selectNextFilter();
                // console.log('selecting next Filter', this.filterIndex)
            }
            let filterArr = Object.entries(this.currentFilter())
            for (let j = 0; j < filterArr.length; j++) {
                if (this.matchesFilterTag(arr[i], filterArr[j][1]['labels'][0])) {
                    this.currentFilter()[filterArr[j][0]].certain = true;
                    this.currentFilter()[filterArr[j][0]].column = i;
                    this.currentFilter()[filterArr[j][0]].index = rowIndex;
                    // console.log('Matched column', this.currentFilter()[filterArr[j][0]])
                }
            }
        }
    }

    // coerce data types
    parseNumber = (anyNumber) => {
        const regex = /[^,]*/g;
        let number = anyNumber;
        // console.log(`number ${number} state: ${number === ''}`)
        if (!isNaN(anyNumber)) {
            return anyNumber
        }
        if (number === '') {
            return 0
        } else if (typeof anyNumber === 'string' || anyNumber instanceof String) {
            return parseFloat(number.match(regex).join(''));
        } else {
            return 0;
        }
    }

    tryParseNumber(numberString) {
        const regex = /[^,]*/g;
        if (typeof numberString !== 'string' || numberString.length < 1) {
            if (numberString === '')
                return 0
            return numberString
        }

        let result = parseFloat(numberString.match(regex).join(''));
        return isNaN(result) ? numberString : result;

    }


    // parse the direct into boolean
    tryParseBoolean(directValue) {
        if (!isNaN(directValue)) {
            return directValue > 0
        }
        if (directValue === '1') {
            return true
        }
        return false
    }

    tryParseMonth(serialNum) {
        // console.log('input date ', serialNum)
        serialNum = String(serialNum).split(".");
        var ogDate;
        var oneDay = 24 * 60 * 60 * 1000;
        var firstDate = new Date(1899, 11, 30);
        // console.log('serialNum[0]', serialNum)
        var days = parseFloat(serialNum[0]);
        if (isNaN(days) || days < 40000 || days > 50000) {
            return null;
        }
        var ms = 0;
        if (serialNum.length > 1) {
            ms = parseFloat(serialNum[1]) * oneDay;
            ms = String(ms).substring(0, 8);
        }

        // console.log('firstDate', firstDate.getDate(), firstDate.getDate() + days, days)

        firstDate.setDate(firstDate.getDate() + days);


        ogDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate(), 0, 0, 0, ms);
        // console.log(ogDate);
        return ogDate;
    }

    tryParseString(input) {
        if (!input) {
            return '';
        }
        return (input + '').trim();

    }

}


// it should only match rows after the tag is applied