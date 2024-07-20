 // ==================== INITIALIZE EXPRESS APP ====================
 const express = require("express");
 const app = express();
 
 // ====================  GLOBAL MIDDLEWARE ====================
 app.use(express.json());
 app.use(express.urlencoded({ extended: true })); // TO ACCESS URL FORM ENCODED
 const cors = require("cors");
 app.use(cors()); // ALLOW HTTP REQUESTS LOCAL HOSTS
 
 // ====================  Required Module ====================
 const auth = require("./routes/Auth");
 const product = require("./routes/product");
 const order  = require("./routes/order");
 const reviews  = require("./routes/reviews");
 const show= require("./routes/show");


 
 // ====================  RUN THE APP  ====================
 app.listen(4000, "localhost", () => {
   console.log("SERVER IS RUNNING ");
 });
 
 // ====================  API ROUTES [ ENDPOINTS ]  ====================
 app.use("/auth", auth);
 app.use("/product", product);
 app.use("/order", order);
 app.use("/reviews", reviews);
 app.use("/show", show);


