import bcrypt from "bcryptjs";
import express from "express";
import { Comentarios, Publicacoes, Seguidores, Usuarios } from "../models/Models.js";

const router = express.Router();

router.post("/usuarios", async (req, res) => {
  const { nome, email, senha, nascimento, nick } = req.body;

  try {
    if (!nome || !email || !senha || !nascimento || !nick) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    const idade = new Date().getFullYear() - new Date(nascimento).getFullYear();
    if (idade < 16) {
      return res.status(400).json({ erro: "A idade deve ser maior que 16 anos" });
    }

    const emailExistente = await Usuarios.findOne({ where: { email } });
    const nickExistente = await Usuarios.findOne({ where: { nick } });

    if (emailExistente) return res.status(400).json({ erro: "Email já está em uso" });
    if (nickExistente) return res.status(400).json({ erro: "Nick já está em uso" });

    const hashedPassword = await bcrypt.hash(senha, 10);

    const usuario = await Usuarios.create({
      nome,
      email,
      senha: hashedPassword,
      nascimento,
      nick,
    });

    res.status(201).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      nick: usuario.nick,
      imagem: usuario.imagem,
      nascimento: usuario.nascimento,
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar usuário" });
  }
});

router.get("/usuarios", async (req, res) => {
  try {

    const { nick, nome } = req.query;

    const where = {};
    if (nick) where.nick = nick;
    if (nome) where.nome = nome;

    const usuarios = await Usuarios.findAll({ where });

    const data = usuarios.map(user => ({

      id: user.id,
      nome: user.nome,
      email: user.email,
      nick: user.nick,
      imagem: user.imagem,
      nascimento: user.nascimento

    }));

    res.status(200).json(data);
  } catch (error) {

    res.status(500).json({ erro: "Erro ao consultar usurário" });
  }
});

router.get("/usuarios/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const usuario = await Usuarios.findByPk(usuario_id);

    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });

    res.status(200).json({
      nome: usuario.nome,
      email: usuario.email,
      nick: usuario.nick,
      imagem: usuario.imagem,
      nascimento: usuario.nascimento,
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar detalhes do usuário" });
  }
});

router.patch("/usuarios/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;
  const { nome, email, nick } = req.body;

  try {
    if (!nome && !email && !nick) {
      return res.status(400).json({ erro: "Pelo menos um campo deve ser fornecido para atualização" });}

    const usuario = await Usuarios.findByPk(usuario_id);
    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });

    if (email) {
      const emailExistente = await Usuarios.findOne({ where: { email } });
      if (email && emailExistente && emailExistente.id !== usuario_id) {
        return res.status(400).json({ erro: "Email já está em uso" });
      }
    
    }

    if (nick) {
      const nickExistente = await Usuarios.findOne({ where: { nick } });
      if (nick && nickExistente && nickExistente.id !== usuario_id) {
        return res.status(400).json({ erro: "Nick já está em uso" });
      }
  
    }

    await usuario.update({ nome, email, nick });

    res.status(200).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      nick: usuario.nick,
      imagem: usuario.imagem,
      nascimento: usuario.nascimento,
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar usuário" });
  }
});


router.post("/publicacoes", async (req, res) => {
  const { publicacao, usuario_id } = req.body;

  try {
    if (!publicacao || !usuario_id) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    const usuario = await Usuarios.findByPk(usuario_id);
    if (!usuario) {
      return res.status(400).json({ erro: "Usuário não encontrado" });
    }

    const novaPublicacao = await Publicacoes.create({ publicacao, usuario_id });

    res.status(201).json({ publicacao_id: novaPublicacao.id });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar publicação" });
  }
});

router.get("/publicacoes", async (req, res) => {
  try {
    const publicacoes = await Publicacoes.findAll({
      include: {model: Usuarios, as: "usuario", attributes: ["nick", "imagem"]},
    });

    const data = publicacoes.map((pub) => ({
      publicacao_id: pub.id,
      publicacao: pub.publicacao,
      usuario_id: pub.usuario_id,
      nick: pub.usuario.nick,
      imagem:[pub.usuario.imagem],//pode mudar se o front estiver diferente
      qtd_likes: pub.qtd_likes,
      criado_em: pub.criado_em
    }));

    res.status(200).json({ data: data, total: data.length });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar publicações" });
  }
});

router.get("/publicacoes/de/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const usuario = await Usuarios.findByPk(usuario_id);
    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });

    const publicacoes = await Publicacoes.findAll({
      where: { usuario_id },
      include: [
        {
          model: Comentarios,
          as: "comentarios",
          attributes: ["id"],
        },
      ],
    });

    const data = publicacoes.map((pub) => ({
      publicacao_id: pub.id,
      publicacao: pub.publicacao,
      usuario_id: pub.usuario_id,
      nick: usuario.nick,
      imagem: [usuario.imagem],//pode mudar se o front estiver diferente
      qtd_likes: pub.qtd_likes,
      qtd_comentarios: pub.comentarios.length,
      criado_em: pub.criado_em,
    }));

    res.status(200).json({ data: data, total: data.length });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar publicações do usuário" });
  }
});

router.get("/publicacoes/:publicacao_id", async (req, res) => {
  const { publicacao_id } = req.params;
  try {
    if (!publicacao_id) {
      return res.status(404).json({ erro: "Publicação não encontrada" });
    }

    const publicacao = await Publicacoes.findByPk(publicacao_id,{
      include: { model: Usuarios, association: "usuario", }
    });

    const comentarios = await Comentarios.findAll({
      where: { publicacao_id },
      include: { model: Usuarios, association: "usuario", }
    });

    const data = comentarios.map((comentario) => ({
      comentario_id: comentario.id,
      comentario: comentario.comentario,
      usuario_id: comentario.usuario_id,
      nick: comentario.usuario.nick,
      imagem: comentario.usuario.imagem,
      qtd_likes: comentario.qtd_likes,
      criado_em: comentario.criado_em
    }))
    

    res.status(200).json({
      publicacao_id: publicacao.id,
      publicacao: publicacao.publicacao,
      usuario_id: publicacao.usuario_id,
      nick: publicacao.usuario.nick,
      imagem: publicacao.usuario.imagem,
      qtd_likes: publicacao.qtd_likes,
      criado_em: publicacao.criado_em,
      comentarios: data
    });
  } catch (error) {
    
    return res.status(500).json({ erro: "Erro ao consultar publicação" })
  }
});

router.delete("/publicacoes", async (req, res) => {
  const { publicacao_id, usuario_id } = req.body;

  try {
    if (!publicacao_id || !usuario_id) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    const publicacao = await Publicacoes.findByPk(publicacao_id);
    if (!publicacao) return res.status(400).json({ erro: "Publicação não encontrada" });

    if (publicacao.usuario_id !== usuario_id) {
      return res.status(403).json({ erro: "Usuário não autorizado" });
    }

    await publicacao.destroy();
    res.status(200).json({ mensagem: "Publicação deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao deletar publicação" });
  }
});

router.post("/comentarios", async (req, res) => {
  const { publicacao_id, usuario_id, comentario } = req.body;

  try {
    if (!publicacao_id || !usuario_id || !comentario) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    const publicacao = await Publicacoes.findByPk(publicacao_id);
    const usuario = await Usuarios.findByPk(usuario_id);

    if (!publicacao) return res.status(400).json({ erro: "Publicação não encontrada" });
    if (!usuario) return res.status(400).json({ erro: "Usuário não encontrado" });

    const novoComentario = await Comentarios.create({
      publicacao_id,
      usuario_id,
      comentario,
    });

    res.status(201).json({ comentario_id: novoComentario.id });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar comentário" });
  }
});

router.get("/comentarios", async (req, res) => {
  const { publicacao_id } = req.query;

  try {
    if (!publicacao_id) {
      return res.status(400).json({ erro: "Publicação não informada" });
    }

    const comentarios = await Comentarios.findAll({
      where: { publicacao_id },
      include: {
        model: Usuarios,
        as: "usuario",
        attributes: ["nick", "imagem"],
      },
    });

    const resultado = comentarios.map((com) => ({
      comentario_id: com.id,
      comentario: com.comentario,
      usuario_id: com.usuario_id,
      nick: com.usuario.nick,
      imagem: [com.usuario.imagem],
      criado_em: com.criado_em

    }));

    res.status(200).json({ data: resultado, total: resultado.length });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar comentários" });
  }
});

router.delete("/comentarios", async (req, res) => {
  const { comentario_id, usuario_id } = req.body;

  try {
    if (!comentario_id || !usuario_id) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    const comentario = await Comentarios.findByPk(comentario_id);
    if (!comentario) return res.status(400).json({ erro: "Comentário não encontrado" });

    if (comentario.usuario_id !== usuario_id) {
      return res.status(403).json({ erro: "Usuário não autorizado" });
    }

    await comentario.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: "Erro ao deletar comentário" });
  }
});


router.post("/curtidas/publicacao", async (req, res) => {
  const { publicacao_id } = req.body;

  try {
    if (!publicacao_id) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    const publicacao = await Publicacoes.findByPk(publicacao_id);
    if (!publicacao) return res.status(400).json({ erro: "Publicação não encontrada" });

    publicacao.qtd_likes += 1;
    await publicacao.save();

    res.status(200).json({ qtd_likes: publicacao.qtd_likes });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao adicionar curtida" });
  }
});

router.delete("/curtidas/publicacao", async (req, res) => {
  const { publicacao_id } = req.body;

  try {
    if (!publicacao_id) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    const publicacao = await Publicacoes.findByPk(publicacao_id);
    if (!publicacao) return res.status(400).json({ erro: "Publicação não encontrada" });

    publicacao.qtd_likes = Math.max(0, publicacao.qtd_likes - 1);
    await publicacao.save();

    res.status(200).json({ qtd_likes: publicacao.qtd_likes });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao remover curtida" });
  }
});

router.post("/curtidas/comentario", async (req, res) => {
  const { comentario_id } = req.body;

  try {
    if (!comentario_id) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    const comentario = await Comentarios.findByPk(comentario_id);
    if (!comentario) return res.status(400).json({ erro: "Comentário não encontrado" });

    comentario.qtd_likes += 1;
    await comentario.save();

    res.status(200).json({ qtd_likes: comentario.qtd_likes });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao adicionar curtida" });
  }
});

router.delete("/curtidas/comentario", async (req, res) => {
  const { comentario_id } = req.body;

  try {
    if (!comentario_id) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    const comentario = await Comentarios.findByPk(comentario_id);
    if (!comentario) return res.status(400).json({ erro: "Comentário não encontrado" });

    comentario.qtd_likes = Math.max(0, comentario.qtd_likes - 1);
    await comentario.save();

    res.status(200).json({ qtd_likes: comentario.qtd_likes });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao remover curtida" });
  }
});

router.post("/seguidores", async (req, res) => {
  const { usuario_id, usuario_a_seguir_id } = req.body;

  try {
    if (!usuario_id || !usuario_a_seguir_id) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }
    
    if (usuario_id === usuario_a_seguir_id) {
      return res.status(400).json({ erro: "Você não pode seguir a si mesmo" });
    }

    const usuario = await Usuarios.findByPk(usuario_a_seguir_id);
    if (!usuario) return res.status(400).json({ erro: "Usuário a ser seguido não encontrado" });

    const jaSegue = await Seguidores.findOne({ where: { usuario_id: usuario_a_seguir_id, seguidor_id: usuario_id } });
    if (jaSegue) return res.status(400).json({ erro: "Você já segue este usuário" });

    const seguidor = await Seguidores.create({ usuario_id: usuario_a_seguir_id, seguidor_id: usuario_id });

    res.status(201).json({ seguidor_id: seguidor.id });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao seguir usuário" });
  }
});

router.get("/seguidores/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const seguidores = await Seguidores.findAndCountAll({
      where: { usuario_id: usuario_id },
      include: {
        model: Usuarios,
        as: "seguidor",
        attributes: ["nome", "nick", "imagem"],
      },
      limit: +limit,
      offset: (+page - 1) * +limit,
    });

    res.status(200).json({
      data: seguidores.rows.map((seg) => ({
        seguidor_id: seg.seguidor_id,
        nome: seg.seguidor.nome,
        nick: seg.seguidor.nick,
        imagem: seg.seguidor.imagem,
      })),
      total: seguidores.count,
      currentPage: +page,
      totalPages: Math.ceil(seguidores.count / +limit),
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar seguidores" });
  }
});

router.get("/seguidores/seguindo/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const seguindo = await Seguidores.findAll({
      where: { seguidor_id: usuario_id },
      include: {
        model: Usuarios,
        as: "usuario",
        attributes: ["id", "nome", "nick", "imagem"],
      },
    });

    const data = seguindo.map((seg) => ({
      usuario_id: seg.usuario_id,
      nome: seg.usuario.nome,
      nick: seg.usuario.nick,
      imagem: seg.usuario.imagem,
    }));

    res.status(200).json({ data: data, total: data.length });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar usuários seguidos" });
  }
});



router.delete("/seguidores", async (req, res) => {
  const { usuario_id, usuario_a_seguir_id } = req.body;

  try {
    if (!usuario_id || !usuario_a_seguir_id) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    const seguir = await Seguidores.findOne({ where: { usuario_id: usuario_a_seguir_id, seguidor_id: usuario_id } });
    if (!seguir) return res.status(400).json({ erro: "Você não segue este usuário" });

    await seguir.destroy();
    res.status(200).json({ mensagem: "Deixou de seguir o usuário com sucesso" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao deixar de seguir usuário" });
  }
});

export default router;