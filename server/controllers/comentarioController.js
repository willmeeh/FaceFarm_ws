const _ = require('lodash');

const { Comentario } = require('../models/comentario');
const { Postagem } = require('../models/postagem')
const { ObjectID } = require('mongodb')


const create = (req, res) => {
	var body = _.pick(req.body, ['from']);
	var comentarioBody = _.pick(req.body, ['texto', 'from', 'idUsuario']);

	var comentario = new Comentario(comentarioBody)

	comentario.save().then((doc) => {

		Postagem.update(
			{ _id: comentarioBody.from },
			{ $push: { comentarios: doc } }
		).then( () => {
			return res.send(doc)
		}).catch((e) => {
			return res.status(400).send(e)
			
		});

	}, (e) => {
		return res.status(400).send(e)
	})

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
		return res.send({ comentario })
	}).catch((e) => res.status(400).send())
};

const update = (req, res) => {
	var body = _.pick(req.body, ['texto', 'curtidas', 'data', 'listaComentario']);

	var comentario = new Comentario(body)

	id = comentario._id;

	if (!ObjectID.isValid(id)) {
		return res.status(404).send()
	}

	Comentario.findByIdAndUpdate(id, { $set: comentario }, { new: true }).then((comentarioEdited) => {
		if (!comentarioEdited) {
			return res.status(404).send()
		}

		return res.send({ comentarioEdited })
	}).catch((e) => {
		return res.status(400).send()
	});
};

const getList = (req, res) => {
	Comentario.find().then((comentarioList) => {
		return res.send({ comentarioList })
	}), (e) => {
		return res.status(400).send(e)
	}
};

const count = (req, res) => {
	Comentario.count({})
		.then((counter) => {
			return res.send({ counter })
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
		return res.send({ comentario })
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
