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



export {followUser}