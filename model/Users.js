const MongoClient = require('mongodb').MongoClient;
var mongoURL = 'mongodb://127.0.0.1:27017/projetoweb2'

module.exports = class Users{
	static async login(usuario,senha){
		const conn = await MongoClient.connect(mongoURL);
		const db = conn.db();
		let result =  await db.collection('users').find({usuario:usuario,senha:senha}).toArray();		
		conn.close();
		return result.length
	}

	static async cadastrar(email,usuario,senha){
		const conn = await MongoClient.connect(mongoURL);
		const db = conn.db();

		let usuarioArray =  await db.collection('users').find({usuario:usuario}).toArray();
		let emailArray =  await db.collection('users').find({email:email}).toArray();
		let result = usuarioArray.length + emailArray.length

		if (usuarioArray.length === 0 && emailArray.length === 0 && email !=="" && usuario!=="" && senha!== ""){
			db.collection('users').insertOne({email: email,usuario:usuario,senha:senha,isAdmin:0});
		}
		conn.close();
		return result;
	}

	static async isAdmin(usuario,senha){
		const conn = await MongoClient.connect(mongoURL);
		const db = conn.db();

		let result =  await db.collection('users').find({usuario:usuario,senha:senha,isAdmin:1}).toArray();		
		conn.close();

		return result.length;
	}


}