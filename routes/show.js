
const router = require("express").Router();
const conn = require("../db/dbConnection");
const { body, validationResult } = require("express-validator");
const admin = require("../middleware/admin");
const authorize = require("../middleware/authorize");

const util = require("util"); // helper 

  //show orders of special user admin 
  router.get("",authorize, 

  
  async (req, res) => {
    try {
      // 1- VALIDATION REQUEST [manual, express validation]
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // 2- CHECK IF user EXISTS
      const query = util.promisify(conn.query).bind(conn); // transform query mysql --> promise to use [await/async]
      const checUserExists = await query(
          "select * from  users where id = ?",
          [res.locals.user.id]
        );
        
        if ( checUserExists.length !=1) {
          res.status(400).json({
            errors: [ 
              {
                msg: " user not exists !",
              },
            ],
          });
        }
        

      // 3- show all orders for specific user
            
      const show = await query(
          "select * from   orders where user_id = ?",
          [res.locals.user.id]
        );
        
        if (!show[0]) {
          return res.status(401).json({
            errors: [ 
              {
                msg: "no orders for this user",
              },
            ],
          });
        }
        res.status(200).json(show);

     
    }  catch (err) {
      res.status(500).json({ err: err });
    }
  }
); 

  module.exports = router ;
  