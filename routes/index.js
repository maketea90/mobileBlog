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

router.get('/posts', auth, userController.GETposts)

router.post('/posts', auth, userController.createPost)

router.get('/posts/:id', auth, userController.GETpostbyid)

router.get('/posts/:id/comments', auth, userController.GETpostcomments)

router.post('/posts/:id/comments', auth, userController.POSTcomment)

router.post('/changeUsername', auth, userController.changeUsername)

router.post('/changePassword', auth, userController.changePassword)

module.exports = router;
