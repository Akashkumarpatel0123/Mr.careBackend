const express = require('express');
const router = express.Router();
const searchServices = require('../controllers/searchController');

//TODO : perform fuzzy search
router.get('/search',(req,res)=>{

    const query = req.query.query;
   
    res.json({services:searchServices(query)});
  })

module.exports = router;