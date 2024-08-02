const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')
const asyncHandler = require('express-async-handler')
const { body, validationResult } = require('express-validator')


exports.signupPOST = [
    body('username').trim().notEmpty().escape().withMessage('invalid username'),
    body('password').trim().notEmpty().escape().withMessage('invalid password'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
    
        // Indicates the success of this synchronous custom validator
        return true;
      }),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req)
        // console.log(errors)
        if (!errors.isEmpty()) {
            return res.json({ errors })
        } else {
            const {username} = req.body
            const user = await User.findOne({username})
            if(user){
                return res.json({error: 'username already exists'})
            } else {
                
                const hashedPassword = await bcrypt.hash(req.body.password, 10)

                // console.log(hashedPassword)
                
                const newUser = new User({
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
    body('username').trim().notEmpty().escape().withMessage('invalid username'),
    body('password').trim().notEmpty().escape().withMessage('invalid password'),
    asyncHandler(async(req, res, next) => {
        const errors = validationResult(req)

        if(!errors.isEmpty()){
            return res.json({errors})
        } else {
            const {username, password} = req.body

            let user = await User.find({username})

            user = user[0]

            if(!user){
                return res.json('username does not exist')
            }
                
            
            const match = await bcrypt.compare(password, user.password)

            if(!match){
                return res.json('incorrect password')
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
    const posts = await Post.find({}).sort({timestamp: -1}).populate('author')

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
    const post = await Post.findById(req.params.id).populate('author')

    return res.json(post)
}

exports.GETpostcomments = async(req, res, next) => {
    const comments = await Comment.find({post: req.params.id}).populate('author').populate('post')

    return res.json(comments)
}

exports.POSTcomment = [
    body('message').trim().notEmpty().withMessage('enter a valid message'),
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