import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// const sequelize = new Sequelize({
//   host: "localhost", 
//   dialect: "sqlite",
//   storage: "./database.sqlite",
  
// });

dotenv.config();
const sequelize = new Sequelize(
  process.env.DB_PROD_NAME,
  process.env.DB_PROD_USER,
  process.env.DB_PROD_PASSWORD,
 
  {
    host: process.env.DB_PROD_HOST,
    port: process.env.DB_PROD_PORT,
    dialect: process.env.DB_PROD_DIALECT,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
       
      },
    },
    logging: false,
  }
);


export default sequelize;
