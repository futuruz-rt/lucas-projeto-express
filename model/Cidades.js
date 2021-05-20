const MongoClient = require('mongodb').MongoClient;
var mongoURL = 'mongodb+srv://projetoweb2:6GrGdPRIjlJZJmoe@projetoweb2.edtud.mongodb.net/projetoweb2?retryWrites=true&w=majority' || 'mongodb://127.0.0.1:27017/projetoweb2'

module.exports = class Cidades{
	static async cadastrar(nomeCidade,estado,descricao,imagem){
		const conn = await MongoClient.connect(mongoURL);
		const db = conn.db();
		let correto = 0;

		let cidadesArray =  await db.collection('cidades').find({ nomeCidade:nomeCidade,estado:estado,descricao:descricao,imagem:imagem}).toArray();
		if (cidadesArray.length===0 && nomeCidade !== "" && estado !== "" && descricao !== "" && imagem != ""){
			db.collection('cidades').insertOne({nomeCidade:nomeCidade,estado:estado,descricao:descricao,imagem:imagem});
			correto=1;
		}
		conn.close();
		return correto;
	}

	static async buscar(busca){
		const conn = await MongoClient.connect(mongoURL);
		const db = conn.db();
		let result = null;

		if(busca){
			result =  await db.collection('cidades').find({ nomeCidade: new RegExp('^' + busca)} ).toArray();
		}
		conn.close();
		return result;
	}
}
