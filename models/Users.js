// const bcrypt=require('bcrypt');

// const mongoose=require('mongoose');

import fastify from 'fastify';
const app=fastify({
    logger:true
});
import mongoose from 'mongoose';

import bcrypt from 'bcrypt';

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
},
role:{
    type:String,
    enum:['user','admin'],
    default:'user'
}
});

userSchema.pre('save',async function(done){
    if(!this.isModified('password')){
        return done();
    }
    this.password=await bcrypt.hash(this.password,10);
    done();
});
//module.exports=mongoose.model('User',userSchema);
export default mongoose.model('User',userSchema);