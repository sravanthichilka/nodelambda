
exports.seed = function(knex) {
  const regionArray = [];
  for(let i=1; i<=20; i++){
    regionArray.push({regionName: 'Region '+i});
  }

  return  knex("regions").insert(regionArray);

};
