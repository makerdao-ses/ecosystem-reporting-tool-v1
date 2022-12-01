import Mustache from 'mustache';

export default class MdExporter {
    expenseTags = []

    constructor(expenseTags) {
        this.expenseTags = expenseTags
    }

    actuals = []

    //template = `
    // | Budget Category               | Forecast           | Actuals            | Difference          | Payments       |
    // | ---------------------------   | -----------------: | -----------------: | ------------------: | -------------: |
    // |                               | -                  | -                  | -                   |                |
    // `;

    tableRows = '';
    item = ''

    getActuals(actuals) {
        this.actuals = actuals;
        this.getTableColumns()
    }

    getTableColumns() {
        let table = `| Budget Category               |`;
        for (let obj of this.actuals) {
            table += `${obj.type}|`
        }
        table += `\n`
        table += `| --------------------------- |`
        for (let obj of this.actuals) {
            table += ` ---------------------------: |`
        }
        table += `\n`
        this.template = table;
        // console.log('table', table)
    }

    buildTableRowObject() {
        this.expenseTags.forEach(tag => {
            this.item += `|${tag}|`
            this.iterate(tag)
            this.item += '\n'
            this.tableRows += this.item;
            this.item = ''
        });

        this.item += '| **Total** |';
        this.iterate('total')
        this.tableRows += this.item;
        this.item = ''

        this.template += this.tableRows;
    }



    iterate(expenseTag) {
        for (const obj of this.actuals) {
            // console.log(obj)
            for (const key in obj) {
                if (key === expenseTag)
                    // console.log(obj[key].toString())
                    if (typeof obj[key] === 'number') {
                        this.item += ` ${obj[key].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |`
                    } else {
                        this.item += ` ${obj[key].toString()} |`
                    }
            }
        }
    }

    getMdData() {
        let output = Mustache.render(this.template);
        return output;
    }
}