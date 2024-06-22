import {prisma} from '../../prisma/index.js'

const followUser = async (req, res) => {
    try {
        const {username} = req.params;
        if(!username) throw new Error ("Please Provide a Username to Follow");

        const user = await prisma.user.findUnique({
            where : {
                username : username
            }
        })

        if(!user) throw new Error ("User Not Found");

        if(user.id === req.user.id) throw new Error ("You Cannot Follow Yourself");

        const alreadyFollowed = await prisma.follow.findFirst({
            where : {
                followerId : req.user.id,
                followingId : user.id
            }
        })

        if(alreadyFollowed) throw new Error ("You are Already Following this User");

        const follow = await prisma.follow.create({
            data : {
                followerId : req.user.id,
                followingId : user.id
            }
        })

        return res.status(200).json({
            status : 200,
            message : "User Followed Successfully",
            data : follow
        })

    } catch (error) {
        return res.json({
            status : 500,
            message : "Error while Following User",
            error : error.message
        })
    }
}

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