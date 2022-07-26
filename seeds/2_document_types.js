
exports.seed = function(knex) {
  return  knex("document_types").insert([
    {documentTypeName: 'Chemical Usage History'},
    {documentTypeName: 'P.O Records'},
    {documentTypeName: 'Inventory management cost reports (IMCR)'},
    {documentTypeName: 'Pricing'},
    {documentTypeName: 'Training Documents'},
    {documentTypeName: 'Letters of Guarantee'},
    {documentTypeName: 'Certificates of Analysis'},
    {documentTypeName: 'Certificates of Insurance'},
    {documentTypeName: 'Technical Data Sheets'}
]); 
};
