const SERVICES = require('../data/services.js');


function searchServices(query){

    //TODO: use fuse for including fuzzy search

    return SERVICES.filter((service)=>service.toLowerCase().includes(query.toLowerCase()))
}
module.exports = {searchServices}; 

