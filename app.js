import express from "express";
import sequelize from "./config/database.js";
import routers from "./routes/rotas.js";

const app = express();

app.use(express.json());

app.use(routers);

const startServer = async () => {
  try {
    await sequelize.sync();
    app.listen(3000, () => {
      console.log("Servidor rodando na porta 3000");
    });
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
  }
};

startServer();