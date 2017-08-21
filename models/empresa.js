const validator = require("validator");
const mongoose = require('mongoose');

const EmpresaSchema = new mongoose.Schema({
    login: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senha: { type: String, required: true, min: 8 },
    nomeCompleto: { type: String, required: true, lowercase: true, trim: true, min: 6 },
    cnpj: { type: String, required: true, unique: true, min: 14, max: 14 },
    email: {type: String, validate: {
            validator: validator.isEmail,
            message: '{VALUE} não é um email válido.'
        }},
    telefone: { type: String },
    whattsapp: { type: String },
    bloqueado: { type: Boolean, required: true },
    visitas: { type: Number, default: 0 },
    sexo: { type: String },
    imagemPerfil: { type: String  },
    dataCriacaoConta: {    type: Date, default: Date.now },
    dataAberturaEmpresa: { type: Date, default: Date.now },
    hashConfirmacao: { type: String},
    configuracao: mongoose.Schema.ObjectId,
    listaDenunciaUsuario: [mongoose.Schema.ObjectId],
    listaCultura: [mongoose.Schema.ObjectId],
    listaPostage: [mongoose.Schema.ObjectId],
    listaComentarios: [mongoose.Schema.ObjectId],
    listaImagen: [mongoose.Schema.ObjectId],
    listaCidade: [mongoose.Schema.ObjectId],
    listaBanimento: [mongoose.Schema.ObjectId],
    listaNotificacao: [mongoose.Schema.ObjectId],
});

const Empresa = mongoose.model(('Empresa'), EmpresaSchema);

module.exports = { Empresa }
