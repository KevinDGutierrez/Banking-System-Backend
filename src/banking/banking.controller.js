import bankingModel from "./banking.model.js";

export const BancoIndustrial = async (req, res) => {

    try {
        const verifyBanco = await bankingModel.findOne({ name: "Banco Industrial".toLowerCase() });

        if (!verifyBanco) {
            const bancoIndustrial = new bankingModel({
                name: "Banco Industrial",
                description: "Liderezgo y Sostenibilidad",
                pais: "Guatemala",
                moneda: "GTQ",
                status: "active"
            })
            await bancoIndustrial.save()
            console.log("Banco Industrial creado")
        } else {
            console.log("Banco Industrial ya existe, no se volvio a crear")
        }
    } catch (error) {
        console.error("Error al crear Banco Industrial", error)
    }
}

export const Banrural = async (req, res) => {

    try {
        const verifyBanrural = await bankingModel.findOne({ name: "Banrural".toLowerCase() });

        if (!verifyBanrural) {
            const banrural = new bankingModel({
                name: "Banrural",
                description: "Banco de los campesinos",
                pais: "Guatemala",
                moneda: "GTQ",
                status: "active"
            })
            await banrural.save()
            console.log("Banrural creado")
        } else {
            console.log("Banrural ya existe, no se volvio a crear")
        }
    } catch (error) {
        console.error("Error al crear Banrural", error)
    }
}

export const BacCredomatic = async (req, res) => {

    try {
        const verifyBacCredomatic = await bankingModel.findOne({ name: "Bac Credomatic".toLowerCase() });

        if (!verifyBacCredomatic) {
            const bacCredomatic = new bankingModel({
                name: "Bac Credomatic",
                description: "Banco de los consumidores",
                pais: "Guatemala",
                moneda: "GTQ",
                status: "active"
            })
            await bacCredomatic.save()
            console.log("Bac Credomatic creado")
        } else {
            console.log("Bac Credomatic ya existe, no se volvio a crear")
        }
    } catch (error) {
        console.error("Error al crear Bac Credomatic", error)
    }
}

export const BancoInnova = async (req, res) => {

    try {
        const verifyBancoInnova = await bankingModel.findOne({ name: "Banco Innova".toLowerCase() });

        if (!verifyBancoInnova) {
            const bancoInnova = new bankingModel({
                name: "Banco Innova",
                description: "Banco de los emprendedores",
                pais: "Guatemala",
                moneda: "GTQ",
                status: "active"
            })
            await bancoInnova.save()
            console.log("Banco Innova creado")
        } else {
            console.log("Banco Innova ya existe, no se volvio a crear")
        }
    } catch (error) {
        console.error("Error al crear Banco Innova", error)
    }
}

export const getBancos = async (req, res) => {
    try {
        const bancos = await bankingModel.find();
        res.status(200).json(bancos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al obtener los bancos", error: error.message });
    }
}