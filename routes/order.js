const router = require("express").Router();
const conn = require("../db/dbConnection");
const { body, validationResult } = require("express-validator");
const admin = require("../middleware/admin");
const authorize = require("../middleware/authorize");

const util = require("util"); // helper 

// CREATE order to available product [user]

router.post(
    "",authorize,
    body("product_id")
    .isNumeric()
    .withMessage("please enter a valid product_id"),

    body("quantity")
    .isNumeric()
    .withMessage("please enter a valid quantity"),
   
    body("notes").isString().withMessage("enter valid notes"),


   

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
          
          const checproductExists = await query(
            "select * from  product where id = ?",
            [req.body.product_id]
          );
          
          if ( checproductExists.length !=1) {
            res.status(401).json({
              errors: [ 
                {
                  msg: "product  not exists !",
                },
              ],
            });
          }
       
        
   
        // 3- PREPARE request TO -> SAVE
        const orderdata = {
          user_id: res.locals.user.id,
          product_id:req.body.product_id,
          quantity:req.body.quantity,
          price:(req.body.quantity)*(checproductExists[0].price),
          notes:req.body.notes
         
          
        };
  
        // 4- INSERT request INTO DB
         await query("insert into  orders set ?",  orderdata);
  
        res.status(200).json({
          msg: " order created successfully ", orderdata
        });

      }  catch (err) {
        console.log(err);
       
        res.status(500).json({ err: err });
      }
    }
  );


  // UPDATE order [ADMIN]
router.put(
  "/:id", authorize,// params

  body("product_id")
  .isNumeric()
  .withMessage("please enter a valid product_id"),

  body("quantity")
  .isNumeric()
  .withMessage("please enter a valid quantity"),
 
  body("notes").isString().withMessage("enter valid notes"),

  

  async (req, res) => {
    try {
      // 1- VALIDATION REQUEST [manual, express validation]
      const query = util.promisify(conn.query).bind(conn);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

     
      //  CHECK IF order EXISTS OR NOT
      
      
        const checorderExists = await query(
          "select * from  orders where id = ?",
          [req.params.id]
        );
        
        if ( checorderExists.length !=1) {
          res.status(402).json({
            errors: [ 
              {
                msg: " order not exists !",
              },
            ],
          });
        }
        
          //check product exist
          const checproductExists = await query(
            "select * from  product where id = ?",
            [req.body.product_id]
          );
          
          if ( checproductExists.length !=1) {
            res.status(403).json({
              errors: [ 
                {
                  msg: "product  not exists !",
                },
              ],
            });
          }

        

      // 3- PREPARE product OBJECT
      const updatedorderdata = {
          user_id: res.locals.user.id,
          product_id:req.body.product_id,
          quantity:req.body.quantity,
          price:(req.body.quantity)*(checproductExists[0].price),
          notes:req.body.notes
         
          
        };

      // 4- UPDATE orders
      await query("update orders set ? where id = ?", [updatedorderdata, checorderExists[0].id]);

      res.status(200).json({
        msg: "order  updated successfully ", updatedorderdata
      });

    } catch (err) {
      console.log(err)
      res.status(500).json(err);
    }
  }
);

  // DELETE order [ADMIN]
  router.delete(
    "/:id", // params
    async (req, res) => {
      try {
        // 1- CHECK IF product EXISTS OR NOT
        const query = util.promisify(conn.query).bind(conn);
        const order = await query("select * from orders where id = ?", [
          req.params.id,
        ]);
        if (!order[0]) {
          res.status(404).json({ ms: "order not found !" });
        }
        // 2- REMOVE product 
        await query("delete from orders where id = ?", [order[0].id]);
        res.status(200).json({
          msg: "order delete successfully",
        });
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );
 // LIST all orders for all users [ADMIN]
  
 router.get("",admin, async (req, res) => {
  const query = util.promisify(conn.query).bind(conn);
  
  const order = await query(`select * from orders`);
  
  res.status(200).json(order);
});
  
module.exports = router ;
