const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tasks = require('../models/tasks');

const userSchema = new mongoose.Schema({
    name: {
        type : String,
        required : true,
        trim : true
    },
    password: {
        type: String,
        required : true,
        minlength: 7,
        trim : true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    email: {
        type : String,
        required: true,
        trim: true,
        lowercase : true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    age : {
        type : Number,
        default : 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be positive number');
            }
        }
    },
    tokens: [{
        token: {
            type : String,
            required : true
        }
    }],
    avatar: {
        // store avatar
        type: Buffer
    }
}, {
    timestamps : true
});

userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({email});
    if (!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch) {
        throw new Error('Unable to loggin');
    }
    return user;
};

// virtual is not really stored in database
userSchema.virtual('tasks', {
    ref : 'Tasks',
    // primary key
    localField : '_id',
    // foreign key
    foreignField : 'owner'
});

// Generate token
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    // generate token
    const token =  jwt.sign({_id: user._id.toString()}, process.env.SECRETKEY);
    // add token to user.tokens array
    user.tokens = user.tokens.concat({token});
    //save user
    await user.save();
    // then return token
    return token;

};

// Hide private data are password and tokens
// toJSON = whenever JSON.stringlify is called
// When a Mongoose document is passed to res.send , Mongoose converts the object into JSON
userSchema.methods.toJSON = function () {
    // res.sencd(user) => JSON.stringlify(user) => this = user
    const user = this;
    // converts mongoose _doc document into a plain javascript object
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
};

// Hash the plain text password before saving
userSchema.pre('save',async function (next) {
    // user.save() => this = user model
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password,8);
    }
    next();
});

// Delete user 's tasks when user is removed
userSchema.pre('remove',async function (next) {
    const user = this;
    // if any tasks got owner equal to user id => deleted
    await Tasks.deleteMany({owner : user._id});
    next();
});

// userSchema.set('toJSON', {
//      transform: (doc,{__v,password, ...rest},options) => rest
// });

const User = mongoose.model('User',userSchema);
module.exports = User;