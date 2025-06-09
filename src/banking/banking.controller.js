import bankingModel from "./banking.model.js";

export const BancoIndustrial = async (req, res) => {

    try {
        const verifyBanco = await bankingModel.findOne({ name: "Banco Industrial" });

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
        const verifyBanrural = await bankingModel.findOne({ name: "Banrural" });

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
        const verifyBacCredomatic = await bankingModel.findOne({ name: "Bac Credomatic" });

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

export const BancoPromerica = async (req, res) => {

    try {
        const verifyBancoPromerica = await bankingModel.findOne({ name: "Banco Promerica" });

        if (!verifyBancoPromerica) {
            const bancoPromerica = new bankingModel({
                name: "Banco Promerica",
                description: "Banco de los emprendedores",
                pais: "Guatemala",
                moneda: "GTQ",
                status: "active"
            })
            await bancoPromerica.save()
            console.log("Banco Promerica creado")
        } else {
            console.log("Banco Promerica ya existe, no se volvio a crear")
        }
    } catch (error) {
        console.error("Error al crear Banco Promerica", error)
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