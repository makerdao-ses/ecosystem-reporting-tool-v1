import Processor from './processor.js'
import CrunchData from './crunchData.js';
import MdExporter from './mdExporter.js';
import SfMdExporter from './sfMdExporter.js';

// TODO
// Refactor -  minimize dependencies between data structures
export default async function processData(rawData, wallet) {
    const processor = new Processor(wallet);
    processor.getRawData(rawData);
    processor.processData()

    // Getting actuals by month
    const crunchData = new CrunchData();
    const actualsByMonth = {};
    const expenseTagsByMonth = {}

    for (const month in processor.filteredByMonth) {
        crunchData.setData(processor.filteredByMonth[month])
        actualsByMonth[month] = crunchData.crunchData();
        expenseTagsByMonth[month] = crunchData.expenseTags
        crunchData.actuals = []
        crunchData.data = []
    }

    //Getting MDText by month
    let mdTextObj = {}
    const mdTextByMonth = [];

    const sfMdExporter = new SfMdExporter()
    sfMdExporter.getCategoriesByMonth(processor.leveledMonthsByCategory) // fix
    const sfSummary = sfMdExporter.mdByMonth;

    for (const [key, value] of Object.entries(actualsByMonth)) {
        actualsByMonth[key].forEach(objType => {
            for (const [key1, value1] of Object.entries(objType)) {
                if (value1 !== 'actual' && value1 !== 'owed' && value1 !== 'forecast' && value1 !== 'paid' && value1 !== 'estimate' && value1 !== 'difference') {
                    objType[key1] = value1 * Math.sign(value1)
                }
                if (key1.toLowerCase() === 'revenue') {
                    objType[key1] = value1 * -1
                }
            }
        })
    }

    for (const month in actualsByMonth) {
        const mdExporter = new MdExporter(expenseTagsByMonth[month]);
        mdExporter.getActuals(actualsByMonth[month]);
        // console.log('actuals in md', mdExporter.actuals)
        // console.log('expenseTags in md', mdExporter.expenseTags)
        mdExporter.buildTableRowObject();
        mdTextObj[month] = mdExporter.getMdData();
        mdTextByMonth.push(mdTextObj);
        mdTextObj = {}
    }

    const leveledMonthsByCategory = processor.leveledMonthsByCategory;

    // fix
    return { actualsByMonth, leveledMonthsByCategory, mdTextByMonth, sfSummary };
}