import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Usuarios extends Model {}

Usuarios.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nick: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nascimento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    imagem: {
      type: DataTypes.STRING,
      defaultValue: "assets/dog.jpg",
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Usuarios",
  }
);

class Publicacoes extends Model {}

Publicacoes.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    publicacao: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qtd_likes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Publicacoes",
    timestamps: true,
    createdAt: "criado_em",
    updatedAt: false,
  }
);

class Comentarios extends Model {}

Comentarios.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    publicacao_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    comentario: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qtd_likes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Comentarios",
    createdAt: false,
    updatedAt: false,
  }
);

class Seguidores extends Model {}

Seguidores.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    seguidor_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Seguidores",
  }
);

Publicacoes.belongsTo(Usuarios, { foreignKey: "usuario_id", as: "usuario" });
Publicacoes.hasMany(Comentarios, { foreignKey: "publicacao_id", as: "comentarios" });

Comentarios.belongsTo(Usuarios, { foreignKey: "usuario_id", as: "usuario" });
Comentarios.belongsTo(Publicacoes, { foreignKey: "publicacao_id", as: "publicacao" });

Seguidores.belongsTo(Usuarios, { foreignKey: "usuario_id", as: "usuario" });
Seguidores.belongsTo(Usuarios, { foreignKey: "seguidor_id", as: "seguidor" });

Usuarios.hasMany(Publicacoes, { foreignKey: "usuario_id", as: "publicacoes" });
Usuarios.hasMany(Comentarios, { foreignKey: "usuario_id", as: "comentarios" });
Usuarios.hasMany(Seguidores, { foreignKey: "usuario_id", as: "seguindo" });
Usuarios.hasMany(Seguidores, { foreignKey: "seguidor_id", as: "seguidores" });

export { Comentarios, Publicacoes, Seguidores, Usuarios };

