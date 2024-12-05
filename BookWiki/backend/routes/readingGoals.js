const express = require("express");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();
const SECRET = "seu_segredo_super_secreto"; // Certifique-se de definir a chave secreta

// Middleware para verificar o token
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

// Rota para definir uma meta de leitura
router.post("/reading-goals", verifyToken, async (req, res) => {
  const { livro, meta } = req.body;

  if (!livro || !meta) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const goal = await prisma.reading_goal.create({
      data: {
        usuario_id: req.user.id,
        livro_key: livro,
        meta,
      },
    });

    res.status(201).json(goal);
    console.log("Meta de leitura definida:", goal); // Log da meta de leitura definida
  } catch (error) {
    console.error("Erro ao definir meta de leitura:", error); // Log do erro
    res.status(500).json({ error: "Erro ao definir meta de leitura." });
  }
});

// Rota para trazer as metas de leitura de um usuário
router.get("/reading-goals", verifyToken, async (req, res) => {
    try {
      const goals = await prisma.reading_goal.findMany({
        where: { usuario_id: req.user.id },
        select: {
          goal_id: true,
          livro_key: true,
          meta: true,
          livro: {
            select: {
              titulo: true,
              capa_url: true,
            },
          },
        },
      });
  
      res.json(goals);
      console.log("Metas de leitura encontradas:", goals); // Log das metas de leitura encontradas
    } catch (error) {
      console.error("Erro ao buscar metas de leitura:", error); // Log do erro
      res.status(500).json({ error: "Erro ao buscar metas de leitura." });
    }
  });

// Rota para alterar uma meta de leitura
router.put("/reading-goals/:goal_id", verifyToken, async (req, res) => {
    const { goal_id } = req.params;
    const { meta } = req.body;
  
    if (!meta) {
      return res.status(400).json({ error: "Meta é obrigatória." });
    }
  
    try {
      // Verificar se a meta de leitura existe
      const goalExistente = await prisma.reading_goal.findUnique({ where: { goal_id: parseInt(goal_id) } });
      if (!goalExistente) {
        return res.status(404).json({ error: "Meta de leitura não encontrada." });
      }
  
      // Atualizar a meta de leitura
      const updatedGoal = await prisma.reading_goal.update({
        where: { goal_id: parseInt(goal_id) },
        data: {
          meta,
        },
      });
  
      res.status(200).json(updatedGoal);
      console.log("Meta de leitura atualizada:", updatedGoal); // Log da meta de leitura atualizada
    } catch (error) {
      console.error("Erro ao atualizar meta de leitura:", error); // Log do erro
      res.status(500).json({ error: "Erro ao atualizar meta de leitura." });
    }
  });

  // Rota para remover uma meta de leitura
router.delete("/reading-goals/:goal_id", verifyToken, async (req, res) => {
    const { goal_id } = req.params;
  
    try {
      // Verificar se a meta de leitura existe
      const goalExistente = await prisma.reading_goal.findUnique({ where: { goal_id: parseInt(goal_id) } });
      if (!goalExistente) {
        return res.status(404).json({ error: "Meta de leitura não encontrada." });
      }
  
      // Remover a meta de leitura
      await prisma.reading_goal.delete({ where: { goal_id: parseInt(goal_id) } });
  
      res.status(200).json({ message: "Meta de leitura removida com sucesso." });
      console.log("Meta de leitura removida:", goal_id); // Log da meta de leitura removida
    } catch (error) {
      console.error("Erro ao remover meta de leitura:", error); // Log do erro
      res.status(500).json({ error: "Erro ao remover meta de leitura." });
    }
  });

module.exports = router;