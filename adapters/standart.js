module.exports = {
  dataToRow: record =>
    [
      !!record.date ? record.date.toString() : '',
      !!record.amount ? `=${record.amount.toString()}` : '',
      !!record.description ? record.description.toString() : '',
      !!record.category ? record.category.toString() : ''
    ],
  insertRange: () => 'Transactions!B6:E',
  categoriesRange: () => 'Summary!B28:C'
};
