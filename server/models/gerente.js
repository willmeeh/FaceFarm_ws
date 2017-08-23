const validator = require("validator");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
var fs = require('fs');

const GerenteSchema = new mongoose.Schema({
    login: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senha: { type: String, required: true, min: 8 },
    nomeCompleto: { type: String, required: true, lowercase: true, trim: true, min: 6 },
    email: {
        type: String,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} não é um email válido.'
        }
    },
    listaPlanoAnuncio: [mongoose.Schema.ObjectId],
    listaNotificacao: [mongoose.Schema.ObjectId],
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

GerenteSchema.methods.generateAuthToken = function() {
    var Gerente = this;

    var cert = fs.readFileSync('server/keys/private.key');
    var access = 'auth';
    var token = jwt.sign({ _id: Gerente._id.toHexString(), access },
        cert, { algorithm: 'RS256' });


    var foundToken = false;
    Gerente.tokens.forEach(function(token, key) {
        if (token.access === 'auth') {
            Gerente.tokens[key].access = access;
            Gerente.tokens[key].token = token;

            foundToken = true;
        }
    });

    if (!foundToken) {
        Gerente.tokens.push({ access, token });
        return Gerente.save().then(() => {
            return token;
        });
    }

    return token;


};

GerenteSchema.statics.findByToken = function(token) {
    var Gerente = this;
    var decoded;

    var cert = fs.readFileSync('server/keys/public.pem');

    try {
        decoded = jwt.verify(token, cert, { algorithms: ['RS256'] });
    } catch (e) {
        return Promise.reject();
    }

    return Gerente.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

GerenteSchema.statics.findByCredentials = function(email, login, senha) {
    var Gerente = this;
    console.log(email, login, senha)
    return Gerente.findOne({ email, login }).then((gerente) => {
        console.log(gerente);
        if (!gerente) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(senha, gerente.senha, (err, res) => {
                if (res) {
                    console.log(gerente);
                    resolve(gerente);
                } else {
                    reject();
                }
            });
        });
    });
};

GerenteSchema.pre('save', function(next) {
    var Gerente = this;

    if (Gerente.isModified('senha')) {
        var senha = Gerente.senha
        bcrypt.genSalt(1, (err, salt) => {
            bcrypt.hash(senha, salt, (err, hash) => {
                Gerente.senha = hash;
                next();
            })
        })

    } else {
        next();
    }
});

const Gerente = mongoose.model(('Gerente'), GerenteSchema);

module.exports = { Gerente }