const express = require("express");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const router = express.Router();
const prisma = new PrismaClient();




router.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;
  const hashedPassword = await bcrypt.hash(senha, 10);

  try {
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: hashedPassword },
    });
    res.status(200).json({ message: "Usuário criado com sucesso!" });
  } catch (error) {
    res.status(400).json({ error: "Email já está em uso." });
  }
});



module.exports = router;