const SERVICES = require('../data/services.js');


function searchServices(query){

    //TODO: use fuse for including fuzzy search
    query = query.toLowerCase();
    const results = [];
    const alternativeResults = [];
    
    SERVICES.forEach((service)=>{

    const priority = service.toLowerCase().indexOf(query);
        
    if(priority == 0){ // if match starts at the beginning
            results.push(service);
        }else if( priority != -1 ){
            alternativeResults.push(service); // if not then any match
        }
    })

   return results.length > 0 ? results.sort() : alternativeResults.sort();
}
module.exports = searchServices; 

