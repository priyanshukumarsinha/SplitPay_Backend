import {prisma} from '../../prisma/index.js'
import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js'

// followUser to follow a user : POST /api/follow/:username
const followUser = asyncHandler(async (req, res) => {
    // Get the username from the params
    const { username } = req.params;

    // Check if the username is provided
    if (!username) {
        throw new ApiError(400, 'Please provide a username to follow');
    }

    // Find the user with the username
    const user = await prisma.user.findUnique({
        where: {
            username,
        },
    });

    // Check if the user exists
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Check if the user is trying to follow themselves
    if (user.id === req.user.id) {
        throw new ApiError(400, 'You cannot follow yourself');
    }

    // Check if the user is already following the user
    const alreadyFollowed = await prisma.follow.findFirst({
        where: {
            followerId: req.user.id,
            followingId: user.id,
        },
    });

    if (alreadyFollowed) {
        throw new ApiError(400, 'You are already following this user');
    }

    // Follow the user

    const follow = await prisma.follow.create({
        data: {
            followerId: req.user.id,
            followingId: user.id,
        },
    });

    // Check if the follow was successful
    if (!follow) {
        throw new ApiError(500, 'Error while following the user');
    }

    // Send the response
    const response = new ApiResponse(200, follow, "User Followed Successfully");
    return res.status(200).json(response);

    

});

const getMyFollowers = async (req, res) => {
    try {
            const followers = await prisma.follow.findMany({
                where:{
                    followingId : req.user.id
                }
            })
            if(!followers || followers.length === 0) throw new Error ("No Followers Found");

            return res.status(200).json({
                status : 200,
                message : "Followers Fetched Successfully",
                followers : followers,
                count : followers.length
            })
    } catch (error) {
        return res.json({
            status : 500,
            message : "Error while Getting Followers",
            error : error.message
        })
    }
}

const getMyFollowing = async (req, res) => {
    try {
            const following = await prisma.follow.findMany({
                where:{
                    followerId : req.user.id
                }
            })
            if(!following || following.length === 0) throw new Error ("Not Following Anyone");

            return res.status(200).json({
                status : 200,
                message : "Following Fetched Successfully",
                following : following,
                count : following.length
            })
    } catch (error) {
        return res.json({
            status : 500,
            message : "Error while Getting Following",
            error : error.message
        })
    }

}



export {followUser, getMyFollowers, getMyFollowing}