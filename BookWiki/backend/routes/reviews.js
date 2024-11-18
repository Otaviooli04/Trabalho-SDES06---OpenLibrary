const express = require("express");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();
const SECRET = "seu_segredo_super_secreto";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token necessário." });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido." });
  }
};


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

router.post("/reviews", verifyToken, async (req, res) => {
  const { texto, nota, livro_key } = req.body;

  if (!texto || !nota || !livro_key) {
    return res.status(400).json({ error: "Texto, nota e ID do livro são obrigatórios." });
  }

  try {
    const { id } = req.user;

    // Verifique se o livro existe
    const livro = await prisma.livro.findUnique({ where: { livro_key } });
    if (!livro) {
      return res.status(404).json({ error: "Livro não encontrado." });
    }

    const newReview = await prisma.review.create({
      data: {
        texto,
        nota,
        data_criacao: new Date(),
        usuario_id: id,
        livro_key,
      },
    });

    res.status(201).json(newReview);
    console.log("Review criada:", newReview); // Log da review criada
  } catch (error) {
    console.error("Erro ao criar review:", error); // Log do erro
    res.status(500).json({ error: "Erro ao criar review." });
  }
});

// Rota para criar um novo comentário
router.post("/comentarios", verifyToken, async (req, res) => {
  const { texto, review_id } = req.body;

  if (!texto || !review_id) {
    return res.status(400).json({ error: "Texto e ID da review são obrigatórios." });
  }

  try {
    const { id } = req.user;

    // Verifique se a review existe
    const review = await prisma.review.findUnique({ where: { review_id } });
    if (!review) {
      return res.status(404).json({ error: "Review não encontrada." });
    }

    const newComentario = await prisma.comentario.create({
      data: {
        texto,
        data_criacao: new Date(),
        usuario_id: id,
        review_id,
      },
    });

    res.status(201).json(newComentario);
    console.log("Comentário criado:", newComentario); // Log do comentário criado
  } catch (error) {
    console.error("Erro ao criar comentário:", error); // Log do erro
    res.status(500).json({ error: "Erro ao criar comentário." });
  }
});

// Rota para obter todos os comentários de uma review
router.get("/comentarios/:review_id", async (req, res) => {
  console.log('exibindo comentarios');
  const { review_id } = req.params;

  try {
    const comentarios = await prisma.comentario.findMany({
      where: { review_id: parseInt(review_id) },
      select: {
        comentario_id: true,
        texto: true,
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
      },
    });

    if (comentarios.length === 0) {
      return res.json({ error: "Comentários não encontrados." });
    }

    res.json(comentarios);
    console.log("Comentários encontrados:", comentarios);
  } catch (error) {
    console.error("Erro ao buscar comentários:", error); // Log do erro
    res.status(500).json({ error: "Erro ao buscar comentários." });
  }
});
module.exports = router;