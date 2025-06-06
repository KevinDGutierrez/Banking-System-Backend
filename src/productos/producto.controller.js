import { response, request } from "express";
import Producto from "./producto.model.js";

export const postProducto = async (req, res) => {
    try {
        const data = req.body;

        const producto = new Producto(data);

        await producto.save();

        res.status(200).json({
            success: true,
            message: 'Producto agregado satisfactoriamente!',
            producto
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error agregando el producto!',
            error
        })
    }
}

export const getProductos = async (req = request, res = response) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { status: true };

        const [total, productos] = await Promise.all([
            Producto.countDocuments(query),
            Producto.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ])

        res.status(200).json({
            success: true,
            total,
            productos
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error encontrando los productos!',
            error
        })
    }
}

export const getProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findById(id);

        res.status(200).json({
            success: true,
            producto
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error encontrando el producto!',
            error
        })
    }
}

export const getProductoPorNombre = async (req, res) => {
    try {
        const { nombre } = req.params;

        const producto = await Producto.findOne({ nombre });

        res.status(200).json({
            success: true,
            producto
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error encontrando el producto!',
            error: error.message
        });
    }
};

export const putProducto = async (req, res = response) => {
    try {

        const { id } = req.params;
        const data = req.body;

        const producto = await Producto.findByIdAndUpdate(id, data, { new: true });

        res.status(200).json({
            success: true,
            msg: 'Producto actualizado satisfactoriamente!',
            producto
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error actualizando el producto!',
            error
        })
    }
}

export const deleteProducto = async (req, res) => {
    try {

        const { id } = req.params;

        const producto = await Producto.findByIdAndUpdate(id, { status: false }, { new: true });


        res.status(200).json({
            success: true,
            msg: 'Producto desactivado satisfactoriamente!',
            producto,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error desactivando el producto!',
            error
        })
    }
}