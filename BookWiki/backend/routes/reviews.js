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
    console.log("Usuário autenticado:", decoded);
    console.log("ID do usuário:", decoded.id);
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
            usuario_id: true,
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
            usuario_id: true,
            nome: true,
            perfil: {
              select: {
                foto_url: true,
              },
            },
            },
          },
          review: {
            select: {
              review_id: true,
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

router.put("/reviews/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { texto, nota, usuario_id } = req.body;

  if (!texto || !nota) {
    return res.status(400).json({ error: "Conteúdo e avaliação são obrigatórios." });
  }

  try {
    // Verificar se a review existe e se o usuário é o autor
    const review = await prisma.review.findUnique({ where: { review_id: parseInt(id) } });
    if (!review) {
      return res.status(404).json({ error: "Review não encontrada." });
    }
    if (review.usuario_id !== parseInt(usuario_id, 10)) {
      console.log('usuario_id', usuario_id);
      console.log('review.usuario_id', review.usuario_id);
      return res.status(403).json({ error: "Você não tem permissão para editar esta review." });
    }

    // Atualizar a review
    const updatedReview = await prisma.review.update({
      where: { review_id: parseInt(id) },
      data: { texto, nota },
    });

    res.status(200).json(updatedReview);
    console.log("Review atualizada:", updatedReview); // Log da review atualizada
  } catch (error) {
    console.error("Erro ao atualizar review:", error); // Log do erro
    res.status(500).json({ error: "Erro ao atualizar review." });
  }
});

// Rota para apagar uma review
router.delete("/reviews/:id", verifyToken, async (req, res) => {
  console.log('apagando review');
  console.log('req.params', req.params);
  const { id } = req.params;
  const { usuario_id } = req.body;

  const userId = parseInt(usuario_id, 10);

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    // Verificar se a review existe
    const review = await prisma.review.findUnique({ where: { review_id: parseInt(id) } });
    if (!review) {
      return res.status(404).json({ error: "Review não encontrada." });
    }

    // Verificar se o usuário é o autor ou um administrador
    const user = await prisma.usuario.findUnique({ where: { usuario_id: userId } });
    if (review.usuario_id !== userId && user.tipo !== 'admin') {
      return res.status(403).json({ error: "Você não tem permissão para apagar esta review." });
    }

    // Apagar os comentários relacionados à review
    await prisma.comentario.deleteMany({ where: { review_id: parseInt(id) } });

    // Apagar a review
    await prisma.review.delete({ where: { review_id: parseInt(id) } });

    res.status(200).json({ message: "Review apagada com sucesso." });
    console.log("Review apagada:", id); // Log da review apagada
  } catch (error) {
    console.error("Erro ao apagar review:", error); // Log do erro
    res.status(500).json({ error: "Erro ao apagar review." });
  }
});

// Rota para editar um comentário
router.put("/comentarios/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { texto, usuario_id } = req.body;
  const userId = req.user.id; // Obtendo o ID do usuário autenticado

  if (!texto) {
    return res.status(400).json({ error: "Texto é obrigatório." });
  }

  try {
    // Verificar se o comentário existe e se o usuário é o autor
    const comentario = await prisma.comentario.findUnique({ where: { comentario_id: parseInt(id) } });
    if (!comentario) {
      return res.status(404).json({ error: "Comentário não encontrado." });
    }
    if (comentario.usuario_id !== userId) {
      console.log('usuario_id', userId);
      console.log('comentario.usuario_id', comentario.usuario_id);
      return res.status(403).json({ error: "Você não tem permissão para editar este comentário." });
    }

    // Atualizar o comentário
    const updatedComentario = await prisma.comentario.update({
      where: { comentario_id: parseInt(id) },
      data: { texto },
    });

    res.status(200).json(updatedComentario);
    console.log("Comentário atualizado:", updatedComentario); // Log do comentário atualizado
  } catch (error) {
    console.error("Erro ao atualizar comentário:", error); // Log do erro
    res.status(500).json({ error: "Erro ao atualizar comentário." });
  }
});

// Rota para apagar um comentário
router.delete("/comentarios/:id", verifyToken, async (req, res) => {
  console.log('apagando comentário');
  console.log('req.params', req.params);
  const { id } = req.params;
  const userId = req.user.id; // Obtendo o ID do usuário autenticado

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    // Verificar se o comentário existe
    const comentario = await prisma.comentario.findUnique({ where: { comentario_id: parseInt(id) } });
    if (!comentario) {
      return res.status(404).json({ error: "Comentário não encontrado." });
    }

    // Verificar se o usuário é o autor ou um administrador
    const user = await prisma.usuario.findUnique({ where: { usuario_id: userId } });
    if (comentario.usuario_id !== userId && user.tipo !== 'admin') {
      return res.status(403).json({ error: "Você não tem permissão para apagar este comentário." });
    }

    // Apagar o comentário
    await prisma.comentario.delete({ where: { comentario_id: parseInt(id) } });

    res.status(200).json({ message: "Comentário apagado com sucesso." });
    console.log("Comentário apagado:", id); // Log do comentário apagado
  } catch (error) {
    console.error("Erro ao apagar comentário:", error); // Log do erro
    res.status(500).json({ error: "Erro ao apagar comentário." });
  }
});
module.exports = router;