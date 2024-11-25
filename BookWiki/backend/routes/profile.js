const express = require("express");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const prisma = new PrismaClient();
const SECRET = "seu_segredo_super_secreto"; // Certifique-se de definir a chave secreta

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token necessário." });

  try {
    const { id } = jwt.verify(token, SECRET);
    const usuario = await prisma.usuario.findUnique({
      where: { usuario_id: id },
      select: {
        usuario_id: true,
        nome: true,
        email: true,
        tipo: true,
        perfil: {
          select: {
            perfil_id: true,
            bio: true,
            foto_url: true
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
  console.log("GET /profile/lists called");
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log("Token não encontrado");
    return res.status(401).json({ error: "Token necessário." });
  }

  try {
    const { id } = jwt.verify(token, SECRET);
    console.log("Token verificado, ID do usuário:", id);
    const listas = await prisma.lista_livros.findMany({
      where: { usuario_id: id },
      select: {
        lista_id: true,
        nome_lista: true,
        data_criacao: true,
      },
    });
    if (listas.length === 0) {
      console.log("Listas não encontradas");
      return res.status(404).json({ error: "Listas não encontradas." });
    }
    console.log("Listas encontradas:", listas);
    res.json(listas);
  } catch (error) {
    console.error("Erro ao verificar o token:", error); // Log do erro
    res.status(401).json({ error: "Token inválido." });
  }
});

router.put("/profile/update", upload.single("foto"), async (req, res) => {
  console.log("PUT /profile called");
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log("Token não encontrado");
    return res.status(401).json({ error: "Token necessário." });
  }

  try {
    const { id } = jwt.verify(token, SECRET);
    console.log("Token verificado, ID do usuário:", id);
    const { bio, perfil_id } = req.body;
    console.log("Dados recebidos:", bio, perfil_id);
    let foto_url;

    if (req.file) {
      foto_url = `/uploads/${req.file.filename}`;
      console.log("Foto recebida:", foto_url);
    }

    let dataToUpdate = { bio };
    if (foto_url) {
      dataToUpdate.foto_url = foto_url;
    }

    console.log("Dados a serem atualizados:", dataToUpdate);

    const perfil = await prisma.perfil.update({
      where: { perfil_id: parseInt(perfil_id) },
      data: dataToUpdate,
      select: {
        bio: true,
        foto_url: true,
      },
    });

    console.log("Perfil atualizado no banco de dados:", perfil);

    const usuario = await prisma.usuario.findUnique({
      where: { usuario_id: id },
      select: {
        nome: true,
        email: true,
        perfil: {
          select: {
            bio: true,
            foto_url: true,
          },
        },
      },
    });

    console.log("Dados do usuário após atualização:", usuario);
    res.json(usuario);
  } catch (error) {
    console.error("Erro ao atualizar o perfil:", error); // Log do erro
    res.status(500).json({ error: "Erro ao atualizar o perfil." });
  }
});

module.exports = router;