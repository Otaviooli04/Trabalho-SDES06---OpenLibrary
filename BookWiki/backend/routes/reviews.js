const express = require("express");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();
const SECRET = "seu_segredo_super_secreto";

router.get("/reviews", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token necessário." });

  try {
    const { id } = jwt.verify(token, SECRET);
    console.log("ID do usuário:", id);

    const reviews = await prisma.review.findMany({
      where: { usuario_id: id },
      select: {
        review_id: true,
        texto: true,
        nota: true,
        data_criacao: true,
        usuario: {
          select: {
            nome: true,
            tipo: true,
            perfil: {
              select: {
                foto_url: true,
              },
            },
          },
        },
        livro: {
          select: {
            titulo: true,
          },
        },
      },
    });

    if (reviews.length === 0) {
      return res.status(404).json({ error: "Reviews não encontradas." });
    }

    res.json(reviews);
  } catch (error) {
    console.error("Erro ao verificar o token ou buscar reviews:", error); // Log do erro
    res.status(401).json({ error: "Token inválido." });
  }
});

router.get("/reviews/all", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      select: {
        review_id: true,
        texto: true,
        nota: true,
        data_criacao: true,
        usuario: {
          select: {
            nome: true,
            perfil: {
              select: {
                foto_url: true,
              },
            },
          },
        },
        livro: {
          select: {
            titulo: true,
          },
        },
      },
    });

    if (reviews.length === 0) {
      return res.status(404).json({ error: "Reviews não encontradas." });
    }

    res.json(reviews);
  } catch (error) {
    console.error("Erro ao buscar reviews:", error); // Log do erro
    res.status(500).json({ error: "Erro ao buscar reviews." });
  }
});

module.exports = router;