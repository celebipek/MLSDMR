const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); 
const Article = require('./models/article')
const articleRouter = require('./routes/articles')
const methodOverride = require('method-override')
const Contact = require('./models/contact');
const User = require('./models/user');
const app = express()

mongoose.connect('mongodb+srv://celebi:celo12@cluster0.ebk8sgc.mongodb.net/', {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
})

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); 
app.use('/articles', articleRouter)

app.get('/', async (req, res) =>{
  res.render("main/index")
})

  app.get('/blog', async (req, res) => {
    const articles = await Article.find().sort({ createdAt: 'desc' })
    res.render('articles/blog', { articles: articles })
  })
app.get('/galeri', async (req, res) => {

    res.render('main/gallery')
  })

app.get('/panel', async (req, res) => {
    res.render('main/login')
  })

  const authenticateUser = (req, res, next) => {
    const token = req.cookies.jwt;
  
    if (token) {
      jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) {
          console.error('Token doğrulama hatası:', err);
          res.redirect('/login'); 
        } else {
          req.user = user;
          next();
        }
      });
    } else {
      res.redirect('/login'); 
    }
  };
  

  
  app.get('/blogPanel', authenticateUser, async (req, res) => {
    const articles = await Article.find().sort({ createdAt: 'desc' })
    res.render('articles/index', { articles: articles })
  });

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email: email, password: password });
  
      if (user) {
        const token = jwt.sign({ email: user.email }, 'your_secret_key', { expiresIn: '1h' });
        res.cookie('jwt', token);
        res.redirect('/blogPanel');
      } else {
        res.send('Hatalı e-posta veya şifre');
      }
    } catch (error) {
      console.error('Giriş işlemi sırasında bir hata oluştu:', error);
      res.status(500).send('Sunucu hatası');
    }
  });
  app.post('/send-email', async (req, res) => {
    const { name, email, subject, message } = req.body;
  
    const contact = new Contact({
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message
  });
    console.log(req.body);
    // E-posta gönderme işlemleri
    let transporter = nodemailer.createTransport({
      service: 'Gmail', // E-posta servisi seçeneği
      auth: {
        user: 'mdemirer017@gmail.com', // Gönderici e-posta adresi
        pass: 'yushxmyxfifmoopa' // Gönderici e-posta şifresi
             //nhftpjynawbnxsdw
      }
    });
  
    let mailOptions = {
      from: 'mdemirer017@gmail.com',
      to: 'pskmelisademirer@gmail.com', // Alıcı e-posta adresi
      subject: req.body.subject,
      text: `Gönderen: ${name}\nE-posta: ${email}\nMesaj: ${message}`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.send('E-posta gönderme hatası.');
      } else {
        console.log('E-posta gönderildi: ' + info.response);
        
        res.redirect('/');
      }
    });
    
   
    
  });

  const PORT = 3000;
  app.listen(PORT, () => {
      console.log(`Test Sürümü http://localhost:${PORT} adresinde çalışıyor.`);
  });