const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();
const SECRET = "seu_segredo_super_secreto"; // Certifique-se de definir a chave secreta

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    return res.status(401).json({ error: "Usuário não encontrado." });
  }

  const validPassword = await bcrypt.compare(senha, usuario.senha);
  if (!validPassword) {
    return res.status(401).json({ error: "Senha incorreta." });
  }

  const token = jwt.sign({ id: usuario.usuario_id }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

module.exports = router;