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

    var cert = fs.readFileSync('server/keys/gerente.private_key.pem');
    var access = 'auth';
    var token = jwt.sign({ _id: Gerente._id.toHexString(), access },
        cert, { algorithm: 'RS256' });

    let tokenAuth = Gerente.tokens.filter( (t) => {
        if (t.access === 'auth') {
            t.token = token;
            return true;
        }

        return false;
    });

    if (tokenAuth.length === 0) {
        Gerente.tokens.push({access, token});
    }

    return Gerente.save().then(() => {
        return token;
    });
};

GerenteSchema.statics.findByToken = function(token) {
    var Gerente = this;
    var decoded;

    var cert = fs.readFileSync('server/keys/gerente.public_key.pem');

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
    let Gerente = this;

    let data;
    if (login) {
        data = {login};
    }else{
        data = {email};
    }

    return Gerente.findOne(data).then((gerente) => {
        
        if (!gerente) {
            return Promise.reject('Usuário não encontrado');
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(senha, gerente.senha, (err, res) => {
                if (res) {
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