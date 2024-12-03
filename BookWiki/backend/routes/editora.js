const express = require("express");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const router = express.Router();
const prisma = new PrismaClient();

// Rota para trazer todas as editoras
router.get("/editoras", async (req, res) => {
  console.log("Buscando editoras..."); // Log da busca de editoras
  try {
    const editoras = await prisma.editora.findMany({
      select: {
        editora_id: true,
        nome: true,
      },
    });

    res.json(editoras);
    console.log("Editoras encontradas:", editoras); // Log das editoras encontradas
  } catch (error) {
    console.error("Erro ao buscar editoras:", error); // Log do erro
    res.status(500).json({ error: "Erro ao buscar editoras." });
  }
});

// Rota para trazer uma editora específica
router.get("/editoras/:editora_id", async (req, res) => {
  console.log("Buscando editora..."); // Log da busca de editora
  const { editora_id } = req.params;

  try {
    const editora = await prisma.editora.findUnique({
      where: { editora_id: parseInt(editora_id) },
      select: {
        editora_id: true,
        nome: true,
        livro: {
          select: {
            livro_key: true,
            titulo: true,
          },
        },
      },
    });

    if (!editora) {
      return res.status(404).json({ error: "Editora não encontrada." });
    }

    res.json(editora);
    console.log("Editora encontrada:", editora); // Log da editora encontrada
  } catch (error) {
    console.error("Erro ao buscar editora:", error); // Log do erro
    res.status(500).json({ error: "Erro ao buscar editora." });
  }
});

// Rota para editar uma editora
router.put("/editoras/:editora_id", async (req, res) => {
  console.log("Atualizando editora..."); // Log da atualização de editora
  const { editora_id } = req.params;
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ error: "Nome é obrigatório." });
  }

  try {
    // Verificar se a editora existe
    const editoraExistente = await prisma.editora.findUnique({ where: { editora_id: parseInt(editora_id) } });
    if (!editoraExistente) {
      return res.status(404).json({ error: "Editora não encontrada." });
    }

    // Atualizar a editora
    const updatedEditora = await prisma.editora.update({
      where: { editora_id: parseInt(editora_id) },
      data: {
        nome,
      },
    });

    res.status(200).json(updatedEditora);
    console.log("Editora atualizada:", updatedEditora); // Log da editora atualizada
  } catch (error) {
    console.error("Erro ao atualizar editora:", error); // Log do erro
    res.status(500).json({ error: "Erro ao atualizar editora." });
  }
});

// Rota para excluir uma editora
// Rota para excluir uma editora
router.delete("/editoras/:editora_id", async (req, res) => {
  console.log("Excluindo editora..."); // Log da exclusão de editora
  const { editora_id } = req.params;

  try {
    // Verificar se a editora existe
    const editoraExistente = await prisma.editora.findUnique({ where: { editora_id: parseInt(editora_id) } });
    if (!editoraExistente) {
      return res.status(404).json({ error: "Editora não encontrada." });
    }

    // Excluir os livros relacionados à editora
    await prisma.livro.deleteMany({ where: { editora_id: parseInt(editora_id) } });

    // Excluir a editora
    await prisma.editora.delete({ where: { editora_id: parseInt(editora_id) } });

    res.status(200).json({ message: "Editora excluída com sucesso." });
    console.log("Editora excluída:", editora_id); // Log da editora excluída
  } catch (error) {
    console.error("Erro ao excluir editora:", error); // Log do erro
    res.status(500).json({ error: "Erro ao excluir editora." });
  }
});

module.exports = router;