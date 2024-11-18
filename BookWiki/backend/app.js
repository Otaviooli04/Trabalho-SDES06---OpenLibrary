const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Verifique e crie o diretório uploads se não existir
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Servir arquivos estáticos do diretório uploads
app.use("/uploads", express.static(uploadDir));

const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const profileRoute = require("./routes/profile");
const reviewsRoute = require("./routes/reviews");
const booksRoute = require("./routes/books");
const usersRoute = require("./routes/user");


app.use(registerRoute);
app.use(loginRoute);
app.use(profileRoute);
app.use(reviewsRoute);
app.use(booksRoute);
app.use(usersRoute);



app.listen(3001, () => {
  console.log("Servidor backend rodando na porta 3001");
});