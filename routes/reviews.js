const router = require("express").Router();
const conn = require("../db/dbConnection");
const { body, validationResult } = require("express-validator");
const admin = require("../middleware/admin");
const authorize = require("../middleware/authorize");
const util = require("util"); // helper 


router.post(
  "/:id",
  authorize,
  body("review").isString().withMessage("please enter a valid Review"),
  async (req, res) => {
    try {
      const query = util.promisify(conn.query).bind(conn);
      // 1- VALIDATION REQUEST [manual, express validation]
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK IF MOVIE product OR NOT
      const product = await query("select * from product where id = ?",  req.params.id);
      if (!product[0]) {
        res.status(403).json({ ms: "product not found !" });
      }

      // 3 - PREPARE MOVIE REVIEW OBJECT
      const reviewObj = {
        user_id: res.locals.user.id,
        product_id: req.params.id,
        review: req.body.review,
      };

      // 4- INSERT MOVIE OBJECT INTO DATABASE
      await query("insert into reviews set ?", reviewObj);

      res.status(200).json({
        msg: "review added successfully !",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
);
module.exports = router ;