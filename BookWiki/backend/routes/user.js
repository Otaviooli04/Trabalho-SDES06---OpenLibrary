const express = require("express");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const prisma = new PrismaClient();
const SECRET = "seu_segredo_super_secreto"; // Certifique-se de definir a chave secreta

// Middleware para verificar o token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido." });
  }
};

// Rota para obter todos os usuários
router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        usuario_id: true,
        nome: true,
        email: true,
        tipo: true,
      },
    });

    res.json(users);
    console.log("Usuários encontrados:", users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
});

// Rota para excluir um usuário
router.delete("/users/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log("ID do usuário a ser excluído:", id);

  try {
    await prisma.usuario.delete({
      where: { usuario_id: parseInt(id) },
    });

    res.status(200).json({ message: "Usuário excluído com sucesso." });
    console.log("Usuário excluído:", id); // Log do usuário excluído
  } catch (error) {
    console.error("Erro ao excluir usuário:", error); // Log do erro
    res.status(500).json({ error: "Erro ao excluir usuário." });
  }
});

// Rota para criar um novo usuário
router.post("/users", verifyToken, async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios." });
  }

  try {
    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
      },
    });

    res.status(201).json(newUser);
    console.log("Usuário criado:", newUser); // Log do usuário criado
  } catch (error) {
    console.error("Erro ao criar usuário:", error); // Log do erro
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
});

// Rota para editar o tipo de usuário
router.put("/users/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body;

  if (!tipo) {
    return res.status(400).json({ error: "Tipo de usuário é obrigatório." });
  }

  try {
    const updatedUser = await prisma.usuario.update({
      where: { usuario_id: parseInt(id) },
      data: { tipo },
    });

    res.status(200).json(updatedUser);
    console.log("Tipo de usuário atualizado:", updatedUser); // Log do usuário atualizado
  } catch (error) {
    console.error("Erro ao atualizar tipo de usuário:", error); // Log do erro
    res.status(500).json({ error: "Erro ao atualizar tipo de usuário." });
  }
});

module.exports = router;