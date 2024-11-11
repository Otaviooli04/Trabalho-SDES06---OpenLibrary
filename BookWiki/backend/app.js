const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const profileRoute = require("./routes/profile");
const reviewsRoute = require("./routes/reviews");
const booksRoute = require("./routes/books");


app.use(registerRoute);
app.use(loginRoute);
app.use(profileRoute);
app.use(reviewsRoute);
app.use(booksRoute);



app.listen(3001, () => {
  console.log("Servidor backend rodando na porta 3001");
});