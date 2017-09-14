const _ = require('lodash');

const { Comentario } = require('../models/comentario');
const { Postagem } = require('../models/postagem')
const { ObjectID } = require('mongodb')


const save = (body, req, res) => {
	var comentario = new Comentario(body)

	comentario.save().then((doc) => {
        return res.send(doc)
    }, (e) => {
        return res.status(400).send(e)
    })
}

const create = (req, res) => {
	var body = _.pick(req.body, ['_id_pai']);
	var comentarioBody = _.pick(req.body, ['texto']);

	Postagem.exist(body._id_pai).then(() => {
		save(comentarioBody, req, res);
	}).catch(() => {
		Comentario.exist(body._id_pai).then(() => {
			save(comentarioBody, req, res);
		}).catch(() => {
			return res.status(500).send({cod: 'ERROR_POSTAGEM_NOT_EXIST'})
		});
	});
};

const remove = (req, res) => {
	var id = req.params.id

	if (!ObjectID.isValid(id)) {
		return res.status(404).send()
	}

	Comentario.findByIdAndRemove(id).then((comentario) => {
		if (!comentario) {
			return res.status(404).send()
		}
		return res.send({comentario})
	}).catch((e) => res.status(400).send())
};

const update = (req, res) => {
	var body = _.pick(req.body, ['texto', 'curtidas', 'data', 'listaComentario']);

	var comentario = new Comentario(body)

	id = comentario._id;
	
	if (!ObjectID.isValid(id)) {
		return res.status(404).send()
	}

	Comentario.findByIdAndUpdate(id, {$set: comentario}, {new: true}).then((comentarioEdited) => {
		if (!comentarioEdited) {
			return res.status(404).send()
		}

		return res.send({comentarioEdited})
	}).catch((e) => {
		return res.status(400).send()
	});
};

const getList = (req, res) => {
	Comentario.find().then((comentarioList) => {
		return res.send({comentarioList})
	}), (e) => {
		return res.status(400).send(e)
	}
};

const count = (req, res) => {
	Comentario.count({})
	.then((counter) => {
		return res.send({counter})
	}), (e) => {
		return res.status(400).send(e)
	}
};

const getById = (req, res) => {
	var id = req.params.id
	if (!ObjectID.isValid(id)) {
		return res.status(404).send()
	}

	Comentario.findById(id).then((comentario) => {
		if (!comentario) {
			return res.status(404).send()		
		}
		return res.send({comentario})
	}).catch((e) => res.status(400).send())
};

module.exports = {
    create,
	remove,
	update,
	getList,
	count,
	getById
};
