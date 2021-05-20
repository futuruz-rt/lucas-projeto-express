let http = require('http'),
path = require('path'),
cookieParser = require('cookie-parser'),
session = require('express-session'),
cache = require('express-redis-cache'),
express = require('express'),
multer = require('multer'),
storage = multer.memoryStorage();
upload = multer({ storage: storage }),
port = process.env.PORT || 3000,
app = express();

Users = require ('./model/Users')
Cidades = require ('./model/Cidades')

login = 0;
cadastro = 0;
isAdmin = 0;
itemCidade = 0;

cache = cache({
	prefix:'redis-cache',
	host:'redis-13697.c262.us-east-1-3.ec2.cloud.redislabs.com',
	port: 13697,
	auth_pass:'9u1Zp6ayVhiqfUko4eBtMqYED35tu57k'
});

cache.invalidate = (name) => {
	return (req, res, next) => {
		const route_name = name ? name : req.url;
		if (!cache.connected) {
			next();
			return ;
		}
		cache.del(route_name, (err) => console.log(err));
		next();
	};
};

app.set('view engine','hbs');
app.set('views',path.join(__dirname,'view'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
	secret: 'chavesecreta',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
}))

app.get('/', cache.invalidate(),async (req, res) =>{
	isAdmin = 0;
	if(req.cookies && req.cookies.login && req.session && req.session.login){
		res.redirect('/busca');
	}else{
		res.render('login',{login:login,cadastro:cadastro});
		cadastro = 0;
		login = 0;
	}
})

app.post('/busca', cache.invalidate(), async (req,res) =>{
	req.session.destroy();
	res.clearCookie('login');
	res.clearCookie('connect.sid');
	res.redirect('/');
})

app.get('/cadastro', (req, res) =>{
	if(req.cookies && req.cookies.login && req.session && req.session.login){
		res.redirect('/busca');
	}else{
		res.render('cadastro');

	}
})

app.post('/',async (req,res) =>{
	const usuario = req.body.usuario,
	senha = req.body.senha;

	if(usuario !== "" && senha!== ""){
		result = await Users.login(usuario,senha);
		admin = await Users.isAdmin(usuario,senha);
		isAdmin = admin;

		if(result > 0){
			res.cookie('login', usuario);
			req.session.login = usuario;
			if (admin === 1){
				res.redirect('/cidade');
			}else{
				res.redirect('/busca');
			}
			return;
		}else{
			login = 1;
			res.redirect('/')
		}
	} else{
		login = 0;
		res.redirect('/')
	}
})

app.post('/cadastro',  async (req,res) =>{
	const email = req.body.email,
	usuario = req.body.usuario,
	senha = req.body.senha;
	if(email!== "" && usuario !=="" && senha !== ""){
		cadastro =  await Users.cadastrar(email,usuario,senha);
		if(cadastro === 0){
			cadastro = 3;
		}
	}
	res.redirect('/');
})

app.get('/cidade',  (req, res) =>{
	if(req.cookies && isAdmin===1 && req.session && req.session.login){
		res.render('cidade',{itemCidade:itemCidade});
		itemCidade = 0;
	}else{
		res.redirect('/');
	}
})

app.post('/cidade', upload.single('file'), async (req,res) =>{
	const nomeCidade = req.body.nomeCidade,
	estado = req.body.estado,
	descricao = req.body.descricao;

	if(req.file !== undefined){
		imagem = req.file.buffer.toString("base64");
	}else{
		imagem = "";
	}
	
	if(nomeCidade !== "" && estado !== "" && descricao !=="" && imagem != ""){		 
		 itemCidade = await Cidades.cadastrar(nomeCidade,estado,descricao,imagem);
	}
	res.redirect('/cidade');
})

app.get('/busca',   async (req, res) =>{
	var cidades = null;
	if(req.cookies && req.cookies.login && req.session && req.session.login){
		cache.route()
		if(req.query.busca !== "" &&req.query.busca !== null){
			const busca = req.query.busca;
			cidades = await Cidades.buscar(busca);
		}
		res.render('busca',{usuario: req.session.login,cidades:cidades});
	}else{
		res.redirect('/');
	}
})


app.listen(port);
