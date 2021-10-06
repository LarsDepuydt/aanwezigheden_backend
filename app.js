const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

// protection packages
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const hpp = require("hpp");
const csrf = require("csurf");
const cors = require("cors");

const HttpError = require("./models/http-error");

const userRoutes = require("./routes/user-routes");
const verenigingRoutes = require("./routes/vereniging-routes");
const eventRoutes = require("./routes/event-routes");
const checkAuth = require("./middleware/checkAuth");

// #################################
// start code
// #################################
//const csrfProtection = csrf({ cookie: true });
//const parseForm = bodyParser.urlencoded({ extended: false });

const app = express();

// sets security headers
app.use(helmet());

// enables cors
const whitelist2 = process.env.FRONTEND_URL.split(" ");
console.log(whitelist2);
const whitelist = [
  "https://aanwezigheden.vercel.app",
  "https://aanwezigheden-larsdepuydt.vercel.app",
  "https://aanwezigheden-7ucgu0q0w-larsdepuydt.vercel.app",
  "https://aanwezigheden-git-master-larsdepuydt.vercel.app",
];
const corsOptions = {
  origin: (origin, callback) => {
    console.log(origin);
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET, POST, PATCH, DELETE",
  allowHeaders:
    "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept, Authorization",
};
app.use(cors(corsOptions));

// parse the data
app.use(bodyParser.json());

// protect from database injection
app.use(mongoSanitize());

// protect against parameter pollution attack
app.use(hpp());

// parse cookie for csurf
app.use(cookieParser());

// get a valid csrf token
// app.get("/form", csrfProtection, (req, res) => {
//   // pass the csrfToken to the view
//   res.send({ csrfToken: req.csrfToken() });
// });

// #################################################################
// routes
// #################################################################

app.use("/api/users", /*parseForm, csrfProtection,*/ userRoutes);
app.use("/api/vereniging", verenigingRoutes);

app.use(checkAuth);
app.use("/api/event", eventRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res
    .status(error.code || 500)
    .json({ message: error.message || "An unkown error occurred!" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@aanwezigheden.5nglt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
