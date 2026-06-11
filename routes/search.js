const express = require("express");
const Controller = require("./../controllers/search");




const router = express.Router();

router.get('/', Controller.search);
router.get('/quick', Controller.quickSearch);
router.get('/filters', Controller.getFilterOptions);




module.exports = router