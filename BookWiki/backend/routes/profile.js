const express = require("express");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();
const SECRET = "seu_segredo_super_secreto"; // Certifique-se de definir a chave secreta

router.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token necessário." });

  try {
    const { id } = jwt.verify(token, SECRET);
    const usuario = await prisma.usuario.findUnique({
      where: { usuario_id: id },
      select: {
        nome: true,
        email: true,
        perfil: {
          select: {
            foto_url: true,
          },
        },
      },
    });
    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    res.json(usuario);
  } catch (error) {
    console.error("Erro ao verificar o token:", error); // Log do erro
    res.status(401).json({ error: "Token inválido." });
  }
});

router.get("/profile/lists", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token necessário." });

  try {
    const { id } = jwt.verify(token, SECRET);
    const listas = await prisma.lista_livros.findMany({
      where: { usuario_id: id },
      select: {
        lista_id: true,
        nome_lista: true,
        data_criacao: true,
      },
    });
    if (listas.length === 0) {
      return res.status(404).json({ error: "Listas não encontradas." });
    }
    res.json(listas);
  } catch (error) {
    console.error("Erro ao verificar o token:", error); // Log do erro
    res.status(401).json({ error: "Token inválido." });
  }
});

module.exports = router;