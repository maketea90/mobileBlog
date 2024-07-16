var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController')
const auth = require('../middleware/auth')
/* GET home page. */
router.get('/signup', function(req, res){
    res.send('GET sign up')
})

router.post('/signup', userController.signupPOST);

router.post('/login', userController.loginPOST);

router.get('/posts', userController.GETposts)

router.post('/posts', auth, userController.createPost)

router.get('/posts/:id', userController.GETpostbyid)

router.get('/posts/:id/comments', userController.GETpostcomments)

router.post('/posts/:id/comments', auth, userController.POSTcomment)

module.exports = router;
