// I have modified standart template:
// Every month is on separate page with name like '09-2017'
// And description takes two cells
module.exports = {
  dataToRow: record =>
    [
      !!record.date ? record.date.toString() : '',
      !!record.amount ? `=${record.amount.toString()}` : '',
      !!record.description ? record.description.toString() : '',
      '',
      !!record.category ? record.category.toString() : ''
    ],
  insertRange: () => {
    const m = (new Date()).toISOString().match(/^(\d+)-(\d+)-/);
    return `${m[2]}-${m[1]}!B6:E`;
  },
  categoriesRange: () => {
    const m = (new Date()).toISOString().match(/^(\d+)-(\d+)-/);
    return `${m[2]}-${m[1]}!B6:B21`;
  },
};
