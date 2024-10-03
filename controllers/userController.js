const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')
const asyncHandler = require('express-async-handler')
const { body, validationResult } = require('express-validator')


exports.signupPOST = [
    body('email').trim().notEmpty().withMessage('email must not be empty').isLength({max: 100}).escape().withMessage('email must be between 1 and 20 characters'),
    body('username').trim().notEmpty().withMessage('username must not be empty').isLength({max: 20}).escape().withMessage('username must be between 1 and 20 characters'),
    body('password').trim().notEmpty().withMessage('password must not be empty').isLength({max: 20}).escape().withMessage('password must be between 1 and 20 characters'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
    
        // Indicates the success of this synchronous custom validator
        return true;
      }),
    asyncHandler(async (req, res, next) => {

        const jsonResponses = {
            emailError: '',
            usernameError: '',
            passwordError: '',
            confirmPasswordError: ''
        } 

        const errors = validationResult(req)
        // console.log(errors)
        if (!errors.isEmpty()) {
            errors.errors.forEach((error) => {
                if(error.path === 'username'){
                    jsonResponses.usernameError = error.msg
                } else if (error.path === 'password'){
                    jsonResponses.passwordError = error.msg
                } else if (error.path === 'email'){
                    jsonResponses.emailError = error.msg
                }else {
                    jsonResponses.confirmPasswordError = error.msg
                }
            
            })
            return res.status(400).json(jsonResponses)
        } else {
            const {username, email} = req.body
            const user = await User.findOne({username})
            const userbyemail = await User.findOne({email})
            if(user){
                jsonResponses.usernameError = 'username already exists'
                return res.status(400).json(jsonResponses)
            } else if(userbyemail){
                jsonResponses.emailError = 'email already in use'
                return res.status(400).json(jsonResponses)
            }else {
                
                const hashedPassword = await bcrypt.hash(req.body.password, 10)

                // console.log(hashedPassword)
                
                const newUser = new User({
                    email: req.body.email,
                    username: req.body.username,
                    password: hashedPassword
                })

                await newUser.save()

                return res.json('signup successful')
            }
        }
    })
]

exports.loginPOST = [
    body('email').trim().notEmpty().withMessage('email must not be empty').escape(),
    body('password').trim().notEmpty().withMessage('password must not be empty').escape(),
    asyncHandler(async(req, res, next) => {
        const errors = validationResult(req)

        const jsonResponses = {
            emailError: '',
            passwordError: ''
        }

        if(!errors.isEmpty()){
            console.log(errors)
            errors.errors.forEach((error) => {
                if(error.path === 'email'){
                    jsonResponses.emailError = error.msg
                } else {
                    jsonResponses.passwordError = error.msg
                }
            })
            return res.status(400).json(jsonResponses)
        } else {
            const {email, password} = req.body

            let user = await User.find({email})

            user = user[0]

            if(!user){
                jsonResponses.emailError = 'email not in use'
                return res.status(400).json(jsonResponses)
            }
                
            
            const match = await bcrypt.compare(password, user.password)

            if(!match){
                jsonResponses.passwordError = 'incorrect password'
                return res.status(400).json(jsonResponses)
            }

            jwt.sign({userId: user._id}, process.env.SECRET, (err, asyncToken) => {
                if (err) throw err;
                // console.log(asyncToken);
                return res.json({token: asyncToken})
              });
            
            
        }
    })
]

exports.GETposts = async(req, res, next) => {

    const quantity = (req.query.page-1)*10

    console.log(quantity)

    const posts = await Post.find({}).sort({timestamp: -1}).skip(quantity).limit(10).populate('author', 'username')

    // console.log(posts)

    return res.json(posts)
}

exports.createPost = [
    body('title').trim().notEmpty().escape().withMessage('please enter a title'),
    body('text').trim().notEmpty().escape().withMessage('write some text to go with your post'),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            // console.log(errors)
            return res.json({errors})
        } else {

            // console.log('in here')
            
            const newPost = new Post({
                title: req.body.title,
                text: req.body.text,
                author: req.userId
            })

            await newPost.save()

            return res.json('post successfully created')
        }
    })
]

exports.GETpostbyid = async(req, res, next) => {
    const post = await Post.findById(req.params.id).populate('author', 'username')

    return res.json(post)
}

exports.GETpostcomments = async(req, res, next) => {
    const comments = await Comment.find({post: req.params.id}).populate('author', 'username').populate('post')

    return res.json(comments)
}

exports.POSTcomment = [
    body('message').trim().notEmpty().escape().withMessage('enter a valid message'),
    asyncHandler(async(req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.json({errors})
        } else {
            const newComment = new Comment({
                message: req.body.message,
                author: req.userId,
                post: req.params.id
            })

            await newComment.save()

            return res.json('successfully posted a comment')
        }
    })
]


exports.changeUsername = [
    body('username').trim().notEmpty().escape().withMessage('enter a valid username'),
    asyncHandler(async(req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.json(errors[0].msg)
        } else {

            const user = await User.find({username: req.body.username})

            console.log(user)

            if(user.length !== 0){
                return res.status(400).json('username already exists')
            }

            await User.findOneAndUpdate({_id: req.userId}, {username: req.body.username})

            return res.json('successfully updated username')
        }
    })
]

exports.changePassword = [
    body('password').trim().notEmpty().escape().withMessage('enter a valid password'),
    asyncHandler(async(req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.json(errors[0].msg)
        } else {

            const password = await bcrypt.hash(req.body.password, 10)

            await User.findOneAndUpdate({_id: req.userId}, {password})

            return res.json('successfully updated password')
        }
    })
]