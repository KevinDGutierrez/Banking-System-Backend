'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './mongo.js';
import limiter from '../src/middlewares/validar-cant-peticiones.js';
import { createAdmin } from '../src/auth/auth.controller.js';
import authRoutes from '../src/auth/auth.routes.js'
import accountRoutes from '../src/account/account.routes.js';
import favoritosRoutes from '../src/favoritos/favoritos.routes.js';
import creditosRoutes from '../src/credito/credito.routes.js';
import bankingRoutes from '../src/banking/banking.routes.js';
import productoRoutes from '../src/productos/producto.routes.js';
import ordenRoutes from '../src/ordenes/orden.routes.js';
import { BancoIndustrial } from '../src/banking/banking.controller.js';
import { BacCredomatic } from '../src/banking/banking.controller.js';
import { Banrural } from '../src/banking/banking.controller.js';
<<<<<<< HEAD
import { BancoInnova } from '../src/banking/banking.controller.js';
=======
import { BancoPromerica } from '../src/banking/banking.controller.js';
import transfersRoutes from '../src/transfers/transfers.routes.js';
import interTransfersRoutes from '../src/interbank/interBankTransfer.routes.js'
import { crearServiciosPorDefecto } from '../src/services/setupService.js';
//import shoppingRoutes from "../src/shopping/shopping.routes.js";

>>>>>>> b9062cc (transfers added)
const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false }));
    app.use(cors());
    app.use(express.json());
    app.use(helmet());
    app.use(morgan('dev'));
    app.use(limiter);
}

const routes = (app) => {
    app.use('/users', authRoutes);
    app.use('/cuentas', accountRoutes);
    app.use('/favoritos', favoritosRoutes);
    app.use('/creditos', creditosRoutes);
    app.use('/bancos', bankingRoutes);
    app.use('/productos', productoRoutes);
<<<<<<< HEAD
<<<<<<< HEAD
=======
    app.use('/transfers', transfersRoutes);
    app.use('/interTransfers', interTransfersRoutes);
    app.use("/shoppings", shoppingRoutes);
>>>>>>> b9062cc (transfers added)
=======
    app.use('/ordenes', ordenRoutes);
    app.use('/transfers', transfersRoutes);
    app.use('/interTransfers', interTransfersRoutes);
    //app.use("/shoppings", shoppingRoutes);
>>>>>>> b275667 (Se realizó el apartado de ordenes para poder canjear o comprar productos y servicios)
}

const conectarDB = async () => {
    try {
        await dbConnection();
        console.log('¡¡Conexión a la base de datos exitosa!!');
        await createAdmin();
        await BancoIndustrial();
        await BacCredomatic();
        await Banrural();
<<<<<<< HEAD
        await BancoInnova(); 
=======
        await BancoPromerica(); 
        await crearServiciosPorDefecto();
>>>>>>> b9062cc (transfers added)
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1);
    }
}

export const initServer = async () => {
    const app = express();
    const port = process.env.PORT || 3000;

    try {
        middlewares(app);
        conectarDB();
        routes(app);
        app.listen(port);
        console.log(`Server running on port ${port}`);
    } catch (error) {
        console.log(`Server init failded: ${error}`);
    }
}