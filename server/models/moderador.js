const validator = require("validator");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
var fs = require('fs');

const ModeradorSchema = new mongoose.Schema({
    login: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senha: { type: String, required: true, min: 8 },
    nomeCompleto: { type: String, required: true, lowercase: true, trim: true, min: 6 },
    cpf: { type: String, required: true, unique: true, min: 11, max: 11 },
    email: {type: String, validate: {
            validator: validator.isEmail,
            message: '{VALUE} não é um email válido.'
        }},
    telefone: { type: String },
    whattsapp: { type: String },
    bloqueado: { type: Boolean, required: true },
    visitas: { type: Number, default: 0 },
    sexo: { type: String },
    listaBanimento: [mongoose.Schema.ObjectId],
    listaNotificacao: [mongoose.Schema.ObjectId],
    listaCidade: [mongoose.Schema.ObjectId],
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

ModeradorSchema.methods.generateAuthToken = function () {
    var Moderador = this;

    var cert = fs.readFileSync('../keys/private.key');
    var access = 'auth';
    var token = jwt.sign({_id: Moderador._id.toHexString(), access},
        cert, { algorithm: 'RS256'});

    Moderador.tokens.push({access, token});

    return Moderador.save().then(() => {
        return token;
    });
};

ModeradorSchema.statics.findByToken = function (token) {
    var Moderador = this;
    var decoded;

    var cert = fs.readFileSync('../keys/public.pem');

    try {
        decoded = jwt.verify(token, cert, { algorithms: ['RS256'] });
    } catch (e) {
        return Promise.reject();
    }

    return Moderador.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

ModeradorSchema.statics.findByCredentials = function (email, senha) {
    var Moderador = this;

    return Moderador.findOne({email}).then((moderador) => {
        if (!moderador) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(senha, moderador.senha, (err, res) => {
                if (res) {
                    resolve(moderador);
                } else {
                    reject();
                }
            });
        });
    });
};

ModeradorSchema.pre('save', function (next) {
    var Moderador = this;

    if (Moderador.isModified('senha')) {
        var senha = Moderador.senha
        bcrypt.genSalt(1, (err, salt) => {
            bcrypt.hash(senha, salt, (err, hash) => {
                Moderador.senha = hash;
                next();
            })
        }) 

    } else {
        next();
    }
});

const Moderador = mongoose.model(('Moderador'), ModeradorSchema);

module.exports = { Moderador }
