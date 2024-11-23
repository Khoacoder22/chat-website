const  express = require('express')
const {Server} = require('socket.io')
const http = require('http')
const app = express()
const getUserDetailsFromToken = require('../helper/getUserDetailFromToken')
const UserModel = require('../models/UserModel')
const {ConversationModel, MessageModel} = require('../models/ConversationModel')

/**socket connection**/ 
const server = http.createServer(app)
const io = new Server(server,{
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
})
// socket runnning at localhost:8080
// online user
const onlineUser = new Set()

io.on('connection',async(socket) =>{
    console.log("connect User", socket.id)

    const token = socket.handshake.auth.token

    // current user detail
    const user = await getUserDetailsFromToken(token)
 
    socket.join(user?._id.toString())
    // console.log("user", user)
    onlineUser.add(user?._id?.toString())

    io.emit('onlineUser',Array.from(onlineUser))
    
    socket.on('message-page', async (userId) => {
        console.log('userId',userId)
        const userDetail = await UserModel.findById(userId).select("-password");
        const payload = {
            _id: userDetail?._id,
            name: userDetail?.name,
            email: userDetail?.email,
            profile_pic : userDetail?.profile_pic,
            online: onlineUser.has(userId)
        };
        socket.emit('message-user', payload);
        

        //get saved message
        const getConversationMessage = await ConversationModel.findOne({
            "$or": [
                {sender: user?._id, receiver : userId},
                {sender: userId, receiver : user?._id}
            ]   
        }).populate('messages').sort({updateAt : -1})

        socket.emit('message',getConversationMessage?.messages || [])
    });

    // new message 
    socket.on('new message', async(data)=>{
        console.log("data", data)
        // check conversation is available both user 
        let conversation = await ConversationModel.findOne({
            "$or" : [
                { sender : data?.sender, receiver : data?.receiver },
                { sender : data?.receiver, receiver :  data?.sender}
            ]
        })
        // if conversation is not available
        if(!conversation){
            const createConversation = await ConversationModel({
                sender : data?.sender,
                receiver : data?.receiver
            })
            conversation = await createConversation.save()
        }

        console.log("conversation", conversation)
        const message = new MessageModel({
            text : data.text,
            imageUrl : data.imageUrl,
            videoUrl : data.videoUrl,
            msgByUserId : data?.msgByUserId,
          })
        const saveMessage = await message.save()
        
        const updateConversation = await ConversationModel.updateOne({ _id : conversation?._id },{
            "$push" : { messages : saveMessage?._id }
        })

        const getConversationMessage = await ConversationModel.findOne({
            "$or": [
                {sender: data?.sender, receiver : data?.receiver},
                {sender: data?.receiver, receiver : data?.sender}
            ]   
        }).populate('messages').sort({updateAt : -1})

        io.to(data?.sender).emit('message', getConversationMessage?.messages || [])
        io.to(data?.receiver).emit('message', getConversationMessage?.messages || [])
    })

    // sidebar
    socket.on('sidebar',async(currentUserId)=>{
        console.log("current user", currentUserId)
        if(currentUserId){
            const currentUserConversation = await ConversationModel.find({
                "$or" : [
                    {sender : currentUserId},
                    {receiver : currentUserId}
                ]
            }).sort({ updateAt : -1 }).populate('messages').populate('sender').populate('receiver')
    
            const conversation = currentUserConversation.map((conv)=>{
    
                const countUnseenMsg = conv.messages.reduce((preve,curr) => preve + (curr.seen ? 0 : 1), 0)
    
                return{
                    _id : conv?._id,
                    sender : conv?.sender,
                    receiver : conv?.receiver, 
                    unseenMsg : countUnseenMsg,
                    lastMsg : conv.messages[conv?.messages?.length - 1]
                }
            })
            socket.emit('conversation', conversation)
        }
    })

    // disconnect
    socket.on('disconnect',()=>{
        onlineUser.delete(user?._id)
        console.log('disconnected user.', socket.id)
    })
})

module.exports = {
    app,
    server
}