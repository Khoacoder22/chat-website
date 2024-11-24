const  express = require('express')
const {Server} = require('socket.io')
const http = require('http')
const app = express()
const getUserDetailsFromToken = require('../helper/getUserDetailFromToken')
const UserModel = require('../models/UserModel')
const {ConversationModel, MessageModel} = require('../models/ConversationModel')
const getConversation = require('../helper/getConversation')


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
 
    // socket.join(user?._id.toString())
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

        // send conversation
        const ConversationSender = await getConversation(data?.sender)
        const ConversationReceiver = await getConversation(data?.receiver)

        io.to(data?.sender).emit('conversation', ConversationSender)
        io.to(data?.receiver).emit('conversation', ConversationReceiver?.messages || [])
    })

    // sidebar
    socket.on('sidebar',async(currentUserId)=>{
        console.log("current user", currentUserId)
        const ConversationSideBar = await getConversation(currentUserId)
        socket.emit('conversation', ConversationSideBar)
    })

    // seen
    socket.on('seen',async(msgByUserId)=>{
        
        let conversation = await ConversationModel.findOne({
            "$or" : [
                { sender : user?._id, receiver : msgByUserId },
                { sender : msgByUserId, receiver :  user?._id}
            ]
        })

        const conversationMessageId = conversation?.messages || []

        const updateMessages  = await MessageModel.updateMany(
            { _id : { "$in" : conversationMessageId }, msgByUserId : msgByUserId },
            { "$set" : { seen : true }}
        )

        //send conversation
        const conversationSender = await getConversation(user?._id?.toString())
        const conversationReceiver = await getConversation(msgByUserId)

        io.to(user?._id?.toString()).emit('conversation',conversationSender)
        io.to(msgByUserId).emit('conversation',conversationReceiver)
    })

    // calling
 socket.on('join-room', (roomId) => {
    if (!roomId) {
        console.error('Room ID không hợp lệ.');
        return;
    }

    console.log(`Socket ${socket.id} tham gia phòng: ${roomId}`);
    socket.join(roomId);

    // Gửi thông báo tới các thành viên khác trong phòng
    socket.to(roomId).emit('user-connected', socket.id); // Thông báo socket ID đã kết nối

    // Xử lý các tín hiệu WebRTC (signaling)
    socket.on('offer', (data) => {
        console.log(`Offer nhận từ ${socket.id}:`, data);
        socket.to(roomId).emit('offer', data); // Chuyển tiếp offer tới các thành viên khác
    });

    socket.on('answer', (data) => {
        console.log(`Answer nhận từ ${socket.id}:`, data);
        socket.to(roomId).emit('answer', data); // Chuyển tiếp answer tới các thành viên khác
    });

    socket.on('candidate', (data) => {
        console.log(`Candidate nhận từ ${socket.id}:`, data);
        socket.to(roomId).emit('candidate', data); // Chuyển tiếp candidate tới các thành viên khác
    });

    // Khi người dùng rời phòng
    socket.on('leave-room', () => {
        console.log(`Socket ${socket.id} rời phòng: ${roomId}`);
        socket.to(roomId).emit('user-disconnected', socket.id);
        socket.leave(roomId);
    });

    // Xử lý khi ngắt kết nối
    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} ngắt kết nối.`);
        socket.to(roomId).emit('user-disconnected', socket.id);
    });
});

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