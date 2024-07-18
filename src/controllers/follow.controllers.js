import {prisma} from '../../prisma/index.js'
import { ApiError, ApiResponse, AsyncHandler } from '../utils/index.js'

// followUser to follow a user : POST /api/follow/:username
const followUser = AsyncHandler(async (req, res) => {
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
        select: {
            id: true,
            following: {
                select: {
                    id: true,
                    username: true,
                    photoURL: true,
                    phoneNumber: true,
                },
            },
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

// unfolow a user : DELETE /api/unfollow/:username
const unfollowUser = AsyncHandler(async (req, res) => {
    // Get the username from the params
    const { username } = req.params;

    // Check if the username is provided
    if (!username) {
        throw new ApiError(400, 'Please provide a username to unfollow');
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

    // Check if the user is trying to unfollow themselves
    if (user.id === req.user.id) {
        throw new ApiError(400, 'You cannot unfollow yourself');
    }

    // Check if the user is following the user
    const following = await prisma.follow.findFirst({
        where: {
            followerId: req.user.id,
            followingId: user.id,
        },
    });

    if (!following) {
        throw new ApiError(400, 'You are not following this user');
    }

    // Unfollow the user

    const unfollow = await prisma.follow.delete({
        where: {
            id: following.id,
        },
    });

    // Check if the unfollow was successful

    if (!unfollow) {
        throw new ApiError(500, 'Error while unfollowing the user');
    }

    // Send the response
    const response = new ApiResponse(200, unfollow, "User Unfollowed Successfully");
    return res.status(200).json(response);
});

export {followUser, unfollowUser}