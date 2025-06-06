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
import bankingRoutes from '../src/banking/banking.routes.js';
import { BancoIndustrial } from '../src/banking/banking.controller.js';
import { BacCredomatic } from '../src/banking/banking.controller.js';
import { Banrural } from '../src/banking/banking.controller.js';
import { BancoPromerica } from '../src/banking/banking.controller.js';
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
    app.use('/bancos', bankingRoutes);
}

const conectarDB = async () => {
    try {
        await dbConnection();
        console.log('¡¡Conexión a la base de datos exitosa!!');
        await createAdmin();
        await BancoIndustrial();
        await BacCredomatic();
        await Banrural();
        await BancoPromerica(); 
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