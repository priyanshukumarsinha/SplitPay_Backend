import {prisma} from '../../prisma/index.js'
import { ApiError, ApiResponse, asyncHandler} from '../utils/index.js'

// create a new message
const createMessage = asyncHandler(async(req, res, next) => {
    // we need a sender, receiver (i.e group), and the message
    // get the sender from the req.user
    const sender = req.user

    // get the receiver from the req.body
    const receiver = req.body.groupId

    // get the message from the req.body
    const message = req.body.message

    // check if the reciever and message are provided
    if(!receiver || !message) {
        throw new ApiError(400, "Please provide a receiver (groupID) and message")
    }

    // check if the receiver exists
    const group = await prisma.group.findUnique({
        where : {
            id : parseInt(receiver)
        }
    })

    if(!group) {
        throw new ApiError(404, "Group not found")
    }

    // create the message
    const newMessage = await prisma.message.create({
        data : {
            senderId : sender.id,
            receiverId : group.id,
            message : message
        }
    })

    // send the response
    const response = new ApiResponse(201, "Message sent", newMessage)
    res.status(200).json(response)

})

// get all messages in the group
const getMessages = asyncHandler(async(req, res, next) => {
    // get groupId from req.params
    const groupId = req.params.groupId

    // check if the groupId is provided
    if(!groupId) {
        throw new ApiError(400, "Please provide a group ID")
    }

    // check if the group exists
    const group = await prisma.group.findUnique({
        where : {
            id : parseInt(groupId)
        }
    })

    // check if the group exists
    if(!group) {
        throw new ApiError(404, "Group not found")
    }

    // check if the user is a member of the group
    const member = await prisma.groupMembers.findFirst({
        where : {
            groupId : parseInt(groupId),
            userId : req.user.id
        }
    })

    if(!member) {
        throw new ApiError(403, "You are not a member of this group")
    }

    // get all messages in the group
    const messages = await prisma.message.findMany({
        where : {
            receiverId : parseInt(groupId)
        },
        select : {
            id : true,
            message : true,
            sender : {
                select : {
                    id : true,
                    username : true
                }
            }
        }
    })

    // send the response
    const response = new ApiResponse(200, messages, "Messages retrieved")
    res.status(200).json(response)

})

// export the functions

export {createMessage, getMessages}