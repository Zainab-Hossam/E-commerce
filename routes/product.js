const router = require("express").Router();
const conn = require("../db/dbConnection");
const { body, validationResult } = require("express-validator");
const admin = require("../middleware/admin");

const util = require("util"); // helper 

// CREATE product [ADMIN]
router.post(
    "",
    admin,
    body("name")
      .isString()
      .withMessage("please enter a valid name")
      .withMessage("name should be at lease 5 characters"),
  
    body("description")
      .isString()
      .withMessage("please enter a valid description ")
      .isLength({ min: 20 })
      .withMessage("description  should be at lease 20 characters"),

      body("category")
      .isString()
      .withMessage("please enter a valid category"),

      body("price")
      .isNumeric()
      .withMessage("please enter a valid price"),


    async (req, res) => {
      try {
        // 1- VALIDATION REQUEST [manual, express validation]
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
  
        // 3- PREPARE product
        const product = {
          name: req.body.name,
          description: req.body.description,
          category: req.body.category,
          price :req.body.price
         
        };
  
        // 4 - INSERT product INTO DB
        const query = util.promisify(conn.query).bind(conn);
        await query("insert into  product set ? ",  product);
        res.status(200).json({
          msg: " product created successfully !",product
        });
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );
  
  // UPDATE product [ADMIN]
router.put(
    "/:id", // params
    admin,
    body("name")
      .isString()
      .withMessage("please enter a valid name")
      .isLength({ min: 5 })
      .withMessage("name should be at lease 5 characters"),
  
    body("description")
      .isString()
      .withMessage("please enter a valid description ")
      .isLength({ min: 20 })
      .withMessage("description  should be at lease 20 characters"),

      body("category")
      .isString()
      .withMessage("please enter a valid category"),

      body("price")
      .isNumeric()
      .withMessage("please enter a valid price"),

    

    async (req, res) => {
      try {
        // 1- VALIDATION REQUEST [manual, express validation]
        const query = util.promisify(conn.query).bind(conn);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        // 2- CHECK IF job EXISTS OR NOT
        
        const product = await query("select * from product where id = ?", [
          req.params.id,
        ]);
        if (!product[0]) {
          return res.status(404).json({ ms: "product not found !" });
        }
  
        // 3- PREPARE product OBJECT
        const updatedProductObj = {
          name: req.body.name,
          description: req.body.description,
          category: req.body.category,
          price :req.body.price
        };
  
        // 4- UPDATE job
        await query("update product set ? where id = ?", [updatedProductObj, product[0].id]);
  
        res.status(200).json({
          msg: "product  updated successfully",updatedProductObj
        });
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );

  // DELETE job [ADMIN]
router.delete(
    "/:id", // params
    admin,
    async (req, res) => {
      try {
        // 1- CHECK IF product EXISTS OR NOT
        const query = util.promisify(conn.query).bind(conn);
        const product = await query("select * from product where id = ?", [
          req.params.id,
        ]);
        if (!product[0]) {
          res.status(404).json({ ms: "product not found !" });
        }
        // 2- REMOVE product 
        await query("delete from product where id = ?", [product[0].id]);
        res.status(200).json({
          msg: "product delete successfully",
        });
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );

  // LIST  [ADMIN, USER]
  
router.get("", async (req, res) => {
    const query = util.promisify(conn.query).bind(conn);
    
    const product = await query(`select * from product`);
    
    res.status(200).json(product);
  });


   

module.exports = router ;